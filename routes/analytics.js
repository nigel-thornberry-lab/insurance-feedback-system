const express = require('express');
const { query, validationResult } = require('express-validator');
const AnalyticsService = require('../services/analytics-service');

const router = express.Router();

// Get system overview analytics
router.get('/overview', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate } = req.query;
        
        const overview = await analyticsService.getSystemOverview({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        res.json({
            success: true,
            data: overview
        });

    } catch (error) {
        console.error('❌ System overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve system overview'
        });
    }
});

// Get rating trends
router.get('/ratings', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate, brokerId } = req.query;
        
        const ratings = await analyticsService.getRatingTrends({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
            brokerId: brokerId || null
        });

        res.json({
            success: true,
            data: ratings
        });

    } catch (error) {
        console.error('❌ Rating trends error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve rating trends'
        });
    }
});

// Get issue analysis
router.get('/issues', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate, limit = 10 } = req.query;
        
        const issues = await analyticsService.getIssueAnalysis({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: issues
        });

    } catch (error) {
        console.error('❌ Issue analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve issue analysis'
        });
    }
});

// Get status distribution
router.get('/status', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate } = req.query;
        
        const statusData = await analyticsService.getStatusDistribution({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        res.json({
            success: true,
            data: statusData
        });

    } catch (error) {
        console.error('❌ Status distribution error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve status distribution'
        });
    }
});

// Get lead score correlation
router.get('/lead-scores', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate } = req.query;
        
        const correlation = await analyticsService.getLeadScoreCorrelation({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        res.json({
            success: true,
            data: correlation
        });

    } catch (error) {
        console.error('❌ Lead score correlation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve lead score correlation'
        });
    }
});

// Get response time analytics
router.get('/response-times', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate } = req.query;
        
        const responseTimes = await analyticsService.getResponseTimeAnalytics({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        res.json({
            success: true,
            data: responseTimes
        });

    } catch (error) {
        console.error('❌ Response time analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve response time analytics'
        });
    }
});

// Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const analyticsService = new AnalyticsService();
        const { startDate, endDate } = req.query;
        
        const dateRange = {
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        };

        // Run all analytics queries in parallel for better performance
        const [
            overview,
            ratings,
            issues,
            status,
            leadScores,
            responseTimes
        ] = await Promise.all([
            analyticsService.getSystemOverview(dateRange),
            analyticsService.getRatingTrends(dateRange),
            analyticsService.getIssueAnalysis({ ...dateRange, limit: 5 }),
            analyticsService.getStatusDistribution(dateRange),
            analyticsService.getLeadScoreCorrelation(dateRange),
            analyticsService.getResponseTimeAnalytics(dateRange)
        ]);

        res.json({
            success: true,
            data: {
                overview,
                ratings,
                issues,
                status,
                leadScores,
                responseTimes,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve dashboard analytics'
        });
    }
});

// Export analytics data
router.get('/export', [
    query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const analyticsService = new AnalyticsService();
        const { format = 'json', startDate, endDate } = req.query;
        
        const exportData = await analyticsService.exportAnalytics({
            format,
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        res.send(exportData);

    } catch (error) {
        console.error('❌ Export analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export analytics data'
        });
    }
});

module.exports = router;