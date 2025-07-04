const express = require('express');
const { param, validationResult } = require('express-validator');
const BrokerService = require('../services/broker-service');

const router = express.Router();

// Get broker by external ID
router.get('/:brokerId', [
    param('brokerId').notEmpty().withMessage('Broker ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const brokerService = new BrokerService();
        const broker = await brokerService.getBrokerByExternalId(req.params.brokerId);

        if (!broker) {
            return res.status(404).json({
                success: false,
                error: 'Broker not found',
                code: 'BROKER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: broker
        });

    } catch (error) {
        console.error('❌ Get broker error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve broker information'
        });
    }
});

// Get broker performance analytics
router.get('/:brokerId/analytics', [
    param('brokerId').notEmpty().withMessage('Broker ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const brokerService = new BrokerService();
        const { startDate, endDate } = req.query;
        
        const analytics = await brokerService.getBrokerAnalytics(req.params.brokerId, {
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date()
        });

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('❌ Get broker analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve broker analytics'
        });
    }
});

// Get all active brokers
router.get('/', async (req, res) => {
    try {
        const brokerService = new BrokerService();
        const { page = 1, limit = 20, location, company } = req.query;

        const filters = {
            location: location || null,
            company: company || null
        };

        const brokers = await brokerService.getActiveBrokers(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: brokers
        });

    } catch (error) {
        console.error('❌ Get brokers error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve brokers'
        });
    }
});

// Get broker leaderboard
router.get('/leaderboard/top', async (req, res) => {
    try {
        const brokerService = new BrokerService();
        const { limit = 10, metric = 'rating' } = req.query;

        const leaderboard = await brokerService.getBrokerLeaderboard(
            metric,
            parseInt(limit)
        );

        res.json({
            success: true,
            data: leaderboard
        });

    } catch (error) {
        console.error('❌ Get broker leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve broker leaderboard'
        });
    }
});

module.exports = router;