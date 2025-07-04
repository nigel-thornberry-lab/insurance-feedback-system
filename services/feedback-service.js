const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
    constructor() {
        this.db = db;
    }

    async submitFeedback(feedbackData) {
        const trx = await this.db.transaction();
        
        try {
            // First, get or create the lead
            const lead = await this.getOrCreateLead(feedbackData.leadId, trx);
            const broker = await this.getOrCreateBroker(feedbackData.brokerId, trx);

            // Insert feedback
            const [feedback] = await trx('feedback').insert({
                id: uuidv4(),
                lead_id: lead.id,
                broker_id: broker.id,
                rating: feedbackData.rating,
                status: feedbackData.status,
                issues: feedbackData.issues,
                comments: feedbackData.comments,
                lead_score: feedbackData.leadScore,
                form_completion_time: feedbackData.formCompletionTime,
                session_id: feedbackData.sessionId,
                user_agent: feedbackData.userAgent,
                touch_device: feedbackData.touchDevice,
                ip_address: feedbackData.ipAddress,
                submitted_at: feedbackData.submittedAt
            }).returning('*');

            // Update broker statistics
            await this.updateBrokerStats(broker.id, trx);

            await trx.commit();

            console.log('✅ Feedback submitted successfully:', {
                feedbackId: feedback.id,
                leadId: feedbackData.leadId,
                brokerId: feedbackData.brokerId,
                rating: feedbackData.rating
            });

            return {
                feedbackId: feedback.id,
                leadId: feedbackData.leadId,
                brokerId: feedbackData.brokerId,
                status: 'submitted',
                submittedAt: feedback.submitted_at
            };

        } catch (error) {
            await trx.rollback();
            console.error('❌ Feedback submission failed:', error);
            throw error;
        }
    }

    async getOrCreateLead(externalId, trx) {
        // Try to find existing lead
        let lead = await trx('leads').where('external_id', externalId).first();
        
        if (!lead) {
            // Create a basic lead record if it doesn't exist
            [lead] = await trx('leads').insert({
                id: uuidv4(),
                external_id: externalId,
                name: 'Unknown Lead',
                score: 0,
                source: 'feedback-form'
            }).returning('*');
            
            console.log('📝 Created new lead record:', externalId);
        }
        
        return lead;
    }

    async getOrCreateBroker(externalId, trx) {
        // Try to find existing broker
        let broker = await trx('brokers').where('external_id', externalId).first();
        
        if (!broker) {
            // Create a basic broker record if it doesn't exist
            [broker] = await trx('brokers').insert({
                id: uuidv4(),
                external_id: externalId,
                name: 'Unknown Broker',
                email: `${externalId}@example.com`,
                is_active: true
            }).returning('*');
            
            console.log('📝 Created new broker record:', externalId);
        }
        
        return broker;
    }

    async updateBrokerStats(brokerId, trx) {
        // Calculate new average rating for the broker
        const stats = await trx('feedback')
            .where('broker_id', brokerId)
            .avg('rating as average_rating')
            .count('id as total_feedback')
            .first();

        await trx('brokers')
            .where('id', brokerId)
            .update({
                average_rating: parseFloat(stats.average_rating || 0),
                total_leads_received: parseInt(stats.total_feedback || 0),
                updated_at: trx.fn.now()
            });
    }

    async getFeedbackByLeadId(leadId) {
        return await this.db('feedback as f')
            .join('leads as l', 'f.lead_id', 'l.id')
            .join('brokers as b', 'f.broker_id', 'b.id')
            .where('l.external_id', leadId)
            .select(
                'f.*',
                'l.external_id as lead_external_id',
                'l.name as lead_name',
                'b.external_id as broker_external_id',
                'b.name as broker_name',
                'b.company as broker_company'
            )
            .first();
    }

    async getFeedbackByBrokerId(brokerId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const feedback = await this.db('feedback as f')
            .join('leads as l', 'f.lead_id', 'l.id')
            .join('brokers as b', 'f.broker_id', 'b.id')
            .where('b.external_id', brokerId)
            .select(
                'f.*',
                'l.external_id as lead_external_id',
                'l.name as lead_name',
                'l.score as lead_score',
                'b.external_id as broker_external_id',
                'b.name as broker_name'
            )
            .orderBy('f.submitted_at', 'desc')
            .limit(limit)
            .offset(offset);

        const total = await this.db('feedback as f')
            .join('brokers as b', 'f.broker_id', 'b.id')
            .where('b.external_id', brokerId)
            .count('f.id as count')
            .first();

        return {
            feedback,
            pagination: {
                page,
                limit,
                total: parseInt(total.count),
                pages: Math.ceil(total.count / limit)
            }
        };
    }

    async getRecentFeedback(limit = 10) {
        return await this.db('feedback as f')
            .join('leads as l', 'f.lead_id', 'l.id')
            .join('brokers as b', 'f.broker_id', 'b.id')
            .select(
                'f.rating',
                'f.status',
                'f.issues',
                'f.submitted_at',
                'l.external_id as lead_id',
                'l.name as lead_name',
                'b.external_id as broker_id',
                'b.name as broker_name',
                'b.company as broker_company'
            )
            .orderBy('f.submitted_at', 'desc')
            .limit(limit);
    }

    async getAnalytics(options = {}) {
        const { startDate, endDate, brokerId } = options;
        
        let query = this.db('feedback as f')
            .join('leads as l', 'f.lead_id', 'l.id')
            .join('brokers as b', 'f.broker_id', 'b.id');

        if (startDate) {
            query = query.where('f.submitted_at', '>=', startDate);
        }
        
        if (endDate) {
            query = query.where('f.submitted_at', '<=', endDate);
        }
        
        if (brokerId) {
            query = query.where('b.external_id', brokerId);
        }

        const [
            totalFeedback,
            averageRating,
            ratingDistribution,
            statusDistribution,
            commonIssues
        ] = await Promise.all([
            // Total feedback count
            query.clone().count('f.id as count').first(),
            
            // Average rating
            query.clone().avg('f.rating as rating').first(),
            
            // Rating distribution
            query.clone()
                .select('f.rating')
                .count('f.id as count')
                .groupBy('f.rating')
                .orderBy('f.rating'),
            
            // Status distribution
            query.clone()
                .select('f.status')
                .count('f.id as count')
                .groupBy('f.status')
                .orderBy('count', 'desc'),
            
            // Common issues
            this.db.raw(`
                SELECT issue, COUNT(*) as count
                FROM (
                    SELECT unnest(issues) as issue
                    FROM feedback f
                    JOIN brokers b ON f.broker_id = b.id
                    WHERE 1=1
                    ${startDate ? "AND f.submitted_at >= ?" : ""}
                    ${endDate ? "AND f.submitted_at <= ?" : ""}
                    ${brokerId ? "AND b.external_id = ?" : ""}
                ) as issues_expanded
                WHERE issue IS NOT NULL AND issue != ''
                GROUP BY issue
                ORDER BY count DESC
                LIMIT 10
            `, [startDate, endDate, brokerId].filter(Boolean))
        ]);

        return {
            summary: {
                totalFeedback: parseInt(totalFeedback.count || 0),
                averageRating: parseFloat(averageRating.rating || 0),
                period: {
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString()
                }
            },
            ratingDistribution: ratingDistribution.reduce((acc, item) => {
                acc[item.rating] = parseInt(item.count);
                return acc;
            }, {}),
            statusDistribution: statusDistribution.map(item => ({
                status: item.status,
                count: parseInt(item.count)
            })),
            commonIssues: commonIssues.rows?.map(row => ({
                issue: row.issue,
                count: parseInt(row.count)
            })) || []
        };
    }
}

module.exports = FeedbackService;