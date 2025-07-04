const express = require('express');
const { body, validationResult } = require('express-validator');
const FeedbackService = require('../services/feedback-service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules for feedback submission
const validateFeedback = [
    body('leadId').notEmpty().withMessage('Lead ID is required'),
    body('brokerId').notEmpty().withMessage('Broker ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('status').isIn([
        'new', 'contacted', 'booked', 'first-meeting', 
        'second-meeting', 'submitted', 'issued', 'failed'
    ]).withMessage('Invalid status'),
    body('issues').optional().isArray().withMessage('Issues must be an array'),
    body('comments').optional().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters'),
    body('formCompletionTime').optional().isInt({ min: 0 }).withMessage('Form completion time must be a positive integer')
];

// Submit feedback endpoint
router.post('/', validateFeedback, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                message: 'Validation failed'
            });
        }

        const feedbackService = new FeedbackService();
        
        // Prepare feedback data
        const feedbackData = {
            leadId: req.body.leadId,
            brokerId: req.body.brokerId,
            rating: parseInt(req.body.rating),
            status: req.body.status,
            issues: req.body.issues || [],
            comments: req.body.comments || '',
            leadScore: req.body.leadScore || null,
            formCompletionTime: req.body.formCompletionTime || null,
            sessionId: req.body.sessionId || null,
            userAgent: req.headers['user-agent'] || null,
            touchDevice: req.body.touchDevice || false,
            ipAddress: req.ip || req.connection.remoteAddress || null,
            submittedAt: new Date()
        };

        console.log('📝 Feedback submission received:', {
            leadId: feedbackData.leadId,
            brokerId: feedbackData.brokerId,
            rating: feedbackData.rating,
            status: feedbackData.status
        });

        const result = await feedbackService.submitFeedback(feedbackData);
        
        res.json({
            success: true,
            data: result,
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error('❌ Feedback submission error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                success: false,
                error: 'Feedback already exists for this lead and broker combination',
                code: 'DUPLICATE_FEEDBACK'
            });
        }
        
        if (error.code === '23503') { // Foreign key constraint violation
            return res.status(400).json({
                success: false,
                error: 'Invalid lead or broker ID',
                code: 'INVALID_REFERENCE'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback',
            code: 'SUBMISSION_ERROR'
        });
    }
});

// Get feedback by lead ID
router.get('/lead/:leadId', async (req, res) => {
    try {
        const feedbackService = new FeedbackService();
        const feedback = await feedbackService.getFeedbackByLeadId(req.params.leadId);
        
        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('❌ Get feedback by lead error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve feedback'
        });
    }
});

// Get feedback by broker ID
router.get('/broker/:brokerId', async (req, res) => {
    try {
        const feedbackService = new FeedbackService();
        const { page = 1, limit = 20 } = req.query;
        
        const feedback = await feedbackService.getFeedbackByBrokerId(
            req.params.brokerId, 
            parseInt(page), 
            parseInt(limit)
        );
        
        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('❌ Get feedback by broker error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve feedback'
        });
    }
});

// Get feedback analytics
router.get('/analytics', async (req, res) => {
    try {
        const feedbackService = new FeedbackService();
        const { startDate, endDate, brokerId } = req.query;
        
        const analytics = await feedbackService.getAnalytics({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
            brokerId: brokerId || null
        });

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('❌ Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve analytics'
        });
    }
});

// Get recent feedback submissions
router.get('/recent', async (req, res) => {
    try {
        const feedbackService = new FeedbackService();
        const { limit = 10 } = req.query;
        
        const recentFeedback = await feedbackService.getRecentFeedback(parseInt(limit));
        
        res.json({
            success: true,
            data: recentFeedback
        });
    } catch (error) {
        console.error('❌ Recent feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve recent feedback'
        });
    }
});

module.exports = router;