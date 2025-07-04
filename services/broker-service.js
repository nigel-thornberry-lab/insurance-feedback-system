const db = require('../database/db');

class BrokerService {
    constructor() {
        this.db = db;
    }

    async getBrokerByExternalId(externalId) {
        try {
            const broker = await this.db('brokers')
                .where('external_id', externalId)
                .first();

            return broker;
        } catch (error) {
            console.error('❌ Get broker by external ID failed:', error);
            throw error;
        }
    }

    async getBrokerAnalytics(externalId, options = {}) {
        try {
            const { startDate, endDate } = options;
            
            let feedbackQuery = this.db('feedback as f')
                .join('brokers as b', 'f.broker_id', 'b.id')
                .where('b.external_id', externalId);

            if (startDate) {
                feedbackQuery = feedbackQuery.where('f.submitted_at', '>=', startDate);
            }
            if (endDate) {
                feedbackQuery = feedbackQuery.where('f.submitted_at', '<=', endDate);
            }

            const [brokerInfo, feedbackStats, ratingDistribution] = await Promise.all([
                this.db('brokers').where('external_id', externalId).first(),
                feedbackQuery.clone()
                    .select(
                        this.db.raw('COUNT(*) as total_feedback'),
                        this.db.raw('AVG(rating) as average_rating'),
                        this.db.raw('AVG(form_completion_time) as avg_completion_time')
                    )
                    .first(),
                feedbackQuery.clone()
                    .select('rating')
                    .count('rating as count')
                    .groupBy('rating')
                    .orderBy('rating')
            ]);

            return {
                broker: brokerInfo,
                stats: {
                    totalFeedback: parseInt(feedbackStats.total_feedback || 0),
                    averageRating: parseFloat(feedbackStats.average_rating || 0),
                    avgCompletionTime: parseFloat(feedbackStats.avg_completion_time || 0)
                },
                ratingDistribution: ratingDistribution.reduce((acc, item) => {
                    acc[item.rating] = parseInt(item.count);
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('❌ Get broker analytics failed:', error);
            throw error;
        }
    }

    async getActiveBrokers(filters = {}, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            let query = this.db('brokers').where('is_active', true);

            if (filters.location) {
                query = query.where('location', 'ilike', `%${filters.location}%`);
            }
            if (filters.company) {
                query = query.where('company', 'ilike', `%${filters.company}%`);
            }

            const [brokers, totalCount] = await Promise.all([
                query.clone()
                    .select('*')
                    .orderBy('average_rating', 'desc')
                    .limit(limit)
                    .offset(offset),
                query.clone().count('id as count').first()
            ]);

            return {
                brokers,
                pagination: {
                    page,
                    limit,
                    total: parseInt(totalCount.count),
                    pages: Math.ceil(totalCount.count / limit)
                }
            };
        } catch (error) {
            console.error('❌ Get active brokers failed:', error);
            throw error;
        }
    }

    async getBrokerLeaderboard(metric = 'rating', limit = 10) {
        try {
            let orderBy;
            switch (metric) {
                case 'rating':
                    orderBy = 'average_rating';
                    break;
                case 'leads':
                    orderBy = 'total_leads_received';
                    break;
                default:
                    orderBy = 'average_rating';
            }

            const leaderboard = await this.db('brokers')
                .where('is_active', true)
                .where('total_leads_received', '>', 0)
                .select('*')
                .orderBy(orderBy, 'desc')
                .limit(limit);

            return leaderboard;
        } catch (error) {
            console.error('❌ Get broker leaderboard failed:', error);
            throw error;
        }
    }
}

module.exports = BrokerService;