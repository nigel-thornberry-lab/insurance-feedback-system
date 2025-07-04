const db = require('../database/db');

class LeadService {
    constructor() {
        this.db = db;
    }

    async getLeadByExternalId(externalId) {
        try {
            const lead = await this.db('leads')
                .where('external_id', externalId)
                .first();

            return lead;
        } catch (error) {
            console.error('❌ Get lead by external ID failed:', error);
            throw error;
        }
    }

    async getLeadAnalytics(externalId) {
        try {
            const [leadInfo, feedbackStats] = await Promise.all([
                this.db('leads').where('external_id', externalId).first(),
                this.db('feedback as f')
                    .join('leads as l', 'f.lead_id', 'l.id')
                    .where('l.external_id', externalId)
                    .select(
                        this.db.raw('COUNT(*) as feedback_count'),
                        this.db.raw('AVG(rating) as average_rating'),
                        this.db.raw('MAX(submitted_at) as last_feedback')
                    )
                    .first()
            ]);

            return {
                lead: leadInfo,
                feedback: {
                    count: parseInt(feedbackStats.feedback_count || 0),
                    averageRating: parseFloat(feedbackStats.average_rating || 0),
                    lastFeedback: feedbackStats.last_feedback
                }
            };
        } catch (error) {
            console.error('❌ Get lead analytics failed:', error);
            throw error;
        }
    }

    async searchLeads(filters = {}, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            let query = this.db('leads');

            // Apply filters
            if (filters.insuranceType) {
                query = query.where('insurance_type', filters.insuranceType);
            }
            if (filters.urgency) {
                query = query.where('urgency', filters.urgency);
            }
            if (filters.minScore) {
                query = query.where('score', '>=', filters.minScore);
            }
            if (filters.maxScore) {
                query = query.where('score', '<=', filters.maxScore);
            }
            if (filters.source) {
                query = query.where('source', filters.source);
            }
            if (filters.startDate) {
                query = query.where('generated_at', '>=', filters.startDate);
            }
            if (filters.endDate) {
                query = query.where('generated_at', '<=', filters.endDate);
            }

            const [leads, totalCount] = await Promise.all([
                query.clone()
                    .select('*')
                    .orderBy('generated_at', 'desc')
                    .limit(limit)
                    .offset(offset),
                query.clone().count('id as count').first()
            ]);

            return {
                leads,
                pagination: {
                    page,
                    limit,
                    total: parseInt(totalCount.count),
                    pages: Math.ceil(totalCount.count / limit)
                }
            };
        } catch (error) {
            console.error('❌ Search leads failed:', error);
            throw error;
        }
    }
}

module.exports = LeadService;