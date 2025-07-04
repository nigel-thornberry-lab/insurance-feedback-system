const db = require('../database/db');

class AnalyticsService {
    constructor() {
        this.db = db;
    }

    async getSystemOverview(options = {}) {
        try {
            const { startDate, endDate } = options;
            
            let baseQuery = this.db('feedback as f');
            if (startDate) baseQuery = baseQuery.where('f.submitted_at', '>=', startDate);
            if (endDate) baseQuery = baseQuery.where('f.submitted_at', '<=', endDate);

            const [feedbackStats, leadStats, brokerStats] = await Promise.all([
                baseQuery.clone()
                    .count('f.id as total_feedback')
                    .avg('f.rating as average_rating')
                    .avg('f.form_completion_time as avg_completion_time')
                    .first(),
                this.db('leads').count('id as total_leads').first(),
                this.db('brokers').where('is_active', true).count('id as active_brokers').first()
            ]);

            return {
                totalFeedback: parseInt(feedbackStats.total_feedback || 0),
                totalLeads: parseInt(leadStats.total_leads || 0),
                activeBrokers: parseInt(brokerStats.active_brokers || 0),
                averageRating: parseFloat(feedbackStats.average_rating || 0),
                avgCompletionTime: parseFloat(feedbackStats.avg_completion_time || 0),
                period: {
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Get system overview failed:', error);
            throw error;
        }
    }

    async getRatingTrends(options = {}) {
        try {
            const { startDate, endDate, brokerId } = options;
            
            let query = this.db('feedback as f');
            if (startDate) query = query.where('f.submitted_at', '>=', startDate);
            if (endDate) query = query.where('f.submitted_at', '<=', endDate);
            if (brokerId) {
                query = query.join('brokers as b', 'f.broker_id', 'b.id')
                           .where('b.external_id', brokerId);
            }

            const ratings = await query
                .select('f.rating')
                .count('f.rating as count')
                .groupBy('f.rating')
                .orderBy('f.rating');

            return ratings.reduce((acc, item) => {
                acc[item.rating] = parseInt(item.count);
                return acc;
            }, {});
        } catch (error) {
            console.error('❌ Get rating trends failed:', error);
            throw error;
        }
    }

    async getIssueAnalysis(options = {}) {
        try {
            const { startDate, endDate, limit = 10 } = options;
            
            let baseConditions = '1=1';
            const params = [];
            
            if (startDate) {
                baseConditions += ' AND f.submitted_at >= ?';
                params.push(startDate);
            }
            if (endDate) {
                baseConditions += ' AND f.submitted_at <= ?';
                params.push(endDate);
            }

            const result = await this.db.raw(`
                SELECT issue, COUNT(*) as count
                FROM (
                    SELECT unnest(issues) as issue
                    FROM feedback f
                    WHERE ${baseConditions}
                    AND issues IS NOT NULL
                    AND array_length(issues, 1) > 0
                ) as issues_expanded
                WHERE issue IS NOT NULL AND issue != ''
                GROUP BY issue
                ORDER BY count DESC
                LIMIT ?
            `, [...params, limit]);

            return result.rows.map(row => ({
                issue: row.issue,
                count: parseInt(row.count)
            }));
        } catch (error) {
            console.error('❌ Get issue analysis failed:', error);
            throw error;
        }
    }

    async getStatusDistribution(options = {}) {
        try {
            const { startDate, endDate } = options;
            
            let query = this.db('feedback');
            if (startDate) query = query.where('submitted_at', '>=', startDate);
            if (endDate) query = query.where('submitted_at', '<=', endDate);

            const statuses = await query
                .select('status')
                .count('status as count')
                .groupBy('status')
                .orderBy('count', 'desc');

            return statuses.map(item => ({
                status: item.status,
                count: parseInt(item.count)
            }));
        } catch (error) {
            console.error('❌ Get status distribution failed:', error);
            throw error;
        }
    }

    async getLeadScoreCorrelation(options = {}) {
        try {
            const { startDate, endDate } = options;
            
            let query = this.db('feedback as f')
                .join('leads as l', 'f.lead_id', 'l.id')
                .select('l.score as lead_score', 'f.rating');
                
            if (startDate) query = query.where('f.submitted_at', '>=', startDate);
            if (endDate) query = query.where('f.submitted_at', '<=', endDate);

            const data = await query;
            
            // Group by score ranges
            const scoreRanges = {
                '0-20': { total: 0, avgRating: 0 },
                '21-40': { total: 0, avgRating: 0 },
                '41-60': { total: 0, avgRating: 0 },
                '61-80': { total: 0, avgRating: 0 },
                '81-100': { total: 0, avgRating: 0 }
            };

            data.forEach(item => {
                const score = item.lead_score;
                let range;
                if (score <= 20) range = '0-20';
                else if (score <= 40) range = '21-40';
                else if (score <= 60) range = '41-60';
                else if (score <= 80) range = '61-80';
                else range = '81-100';

                scoreRanges[range].total++;
                scoreRanges[range].avgRating += item.rating;
            });

            // Calculate averages
            Object.keys(scoreRanges).forEach(range => {
                if (scoreRanges[range].total > 0) {
                    scoreRanges[range].avgRating = scoreRanges[range].avgRating / scoreRanges[range].total;
                }
            });

            return scoreRanges;
        } catch (error) {
            console.error('❌ Get lead score correlation failed:', error);
            throw error;
        }
    }

    async getResponseTimeAnalytics(options = {}) {
        try {
            const { startDate, endDate } = options;
            
            let query = this.db('feedback')
                .whereNotNull('form_completion_time');
                
            if (startDate) query = query.where('submitted_at', '>=', startDate);
            if (endDate) query = query.where('submitted_at', '<=', endDate);

            const stats = await query
                .select(
                    this.db.raw('AVG(form_completion_time) as avg_time'),
                    this.db.raw('MIN(form_completion_time) as min_time'),
                    this.db.raw('MAX(form_completion_time) as max_time'),
                    this.db.raw('COUNT(*) as total_responses')
                )
                .first();

            return {
                averageTime: parseFloat(stats.avg_time || 0),
                minTime: parseInt(stats.min_time || 0),
                maxTime: parseInt(stats.max_time || 0),
                totalResponses: parseInt(stats.total_responses || 0)
            };
        } catch (error) {
            console.error('❌ Get response time analytics failed:', error);
            throw error;
        }
    }

    async exportAnalytics(options = {}) {
        try {
            const { format = 'json', startDate, endDate } = options;
            
            const [overview, ratings, issues, status] = await Promise.all([
                this.getSystemOverview({ startDate, endDate }),
                this.getRatingTrends({ startDate, endDate }),
                this.getIssueAnalysis({ startDate, endDate }),
                this.getStatusDistribution({ startDate, endDate })
            ]);

            const data = {
                overview,
                ratings,
                issues,
                status,
                exportedAt: new Date().toISOString()
            };

            if (format === 'csv') {
                // Convert to CSV format
                let csv = 'Type,Metric,Value\n';
                csv += `Overview,Total Feedback,${overview.totalFeedback}\n`;
                csv += `Overview,Average Rating,${overview.averageRating}\n`;
                csv += `Overview,Active Brokers,${overview.activeBrokers}\n`;
                
                Object.entries(ratings).forEach(([rating, count]) => {
                    csv += `Ratings,${rating} Star,${count}\n`;
                });
                
                issues.forEach(issue => {
                    csv += `Issues,${issue.issue},${issue.count}\n`;
                });
                
                return csv;
            }

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('❌ Export analytics failed:', error);
            throw error;
        }
    }
}

module.exports = AnalyticsService;