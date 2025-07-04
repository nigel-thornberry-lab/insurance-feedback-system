const express = require('express');
const { param, validationResult } = require('express-validator');
const LeadService = require('../services/lead-service');

const router = express.Router();

// Get lead by external ID
router.get('/:leadId', [
    param('leadId').notEmpty().withMessage('Lead ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const leadService = new LeadService();
        const lead = await leadService.getLeadByExternalId(req.params.leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found',
                code: 'LEAD_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: lead
        });

    } catch (error) {
        console.error('❌ Get lead error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve lead information'
        });
    }
});

// Get lead analytics
router.get('/:leadId/analytics', [
    param('leadId').notEmpty().withMessage('Lead ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const leadService = new LeadService();
        const analytics = await leadService.getLeadAnalytics(req.params.leadId);

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('❌ Get lead analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve lead analytics'
        });
    }
});

// Search leads
router.get('/', async (req, res) => {
    try {
        const leadService = new LeadService();
        const { 
            page = 1, 
            limit = 20, 
            insuranceType, 
            urgency, 
            minScore, 
            maxScore,
            source,
            startDate,
            endDate
        } = req.query;

        const filters = {
            insuranceType,
            urgency,
            minScore: minScore ? parseInt(minScore) : null,
            maxScore: maxScore ? parseInt(maxScore) : null,
            source,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null
        };

        const leads = await leadService.searchLeads(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: leads
        });

    } catch (error) {
        console.error('❌ Search leads error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search leads'
        });
    }
});

module.exports = router;