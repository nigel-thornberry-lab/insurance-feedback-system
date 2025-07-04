// Professional Insurance Feedback Backend Simulation
// Realistic API simulation for stakeholder demonstrations

class BackendSimulation {
    constructor() {
        this.baseURL = 'https://api.leadfeedback.com/v1';
        this.apiKey = 'demo_key_' + Math.random().toString(36).substr(2, 9);
        this.sessionId = this.generateSessionId();
        
        // Simulated database
        this.database = {
            leads: this.loadLeads(),
            brokers: this.loadBrokers(),
            feedback: this.loadFeedback(),
            analytics: this.loadAnalytics()
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Insurance Lead Feedback System - Backend Simulation Active');
        console.log('📊 Session ID:', this.sessionId);
        console.log('🔑 API Key:', this.apiKey);
        
        // Log current database state
        this.logDatabaseStats();
        
        // Set up periodic analytics updates
        this.startAnalyticsCollection();
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // URL Parameter Handling for Lead Data
    parseURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const leadData = {
            leadId: urlParams.get('leadId') || this.generateSampleLeadId(),
            brokerId: urlParams.get('brokerId') || 'broker_' + Math.random().toString(36).substr(2, 6),
            source: urlParams.get('source') || 'email_link',
            timestamp: urlParams.get('timestamp') || Date.now(),
            token: urlParams.get('token') || this.generateAccessToken()
        };

        console.log('📥 URL Parameters parsed:', leadData);
        return leadData;
    }

    generateSampleLeadId() {
        const prefixes = ['INS', 'LEAD', 'NZ'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 10000) + 1000;
        return `${prefix}-${number}`;
    }

    generateAccessToken() {
        return 'tk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    // Lead Data Retrieval
    async getLeadData(leadId) {
        console.log(`🔍 Fetching lead data for: ${leadId}`);
        
        // Simulate network delay
        await this.simulateNetworkDelay(300, 800);
        
        // Check if lead exists in database
        let lead = this.database.leads.find(l => l.leadId === leadId);
        
        // Generate realistic lead data if not found
        if (!lead) {
            lead = this.generateRealisticLead(leadId);
            this.database.leads.push(lead);
            this.persistData();
        }
        
        console.log('✅ Lead data retrieved:', lead);
        return lead;
    }

    generateRealisticLead(leadId) {
        const names = [
            'Sarah Mitchell', 'David Thompson', 'Emma Wilson', 'James Anderson',
            'Lisa Chen', 'Michael Brown', 'Rachel Taylor', 'Mark Johnson',
            'Amy Clarke', 'Tom Roberts', 'Sophie Davis', 'Chris Parker'
        ];
        
        const locations = [
            'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
            'Napier', 'Palmerston North', 'Dunedin', 'Rotorua', 'Nelson'
        ];

        const insuranceTypes = [
            'Life Insurance', 'Health Insurance', 'Income Protection', 
            'Trauma Insurance', 'Business Insurance', 'Mortgage Protection'
        ];

        const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
        const urgency = ['1-3 months', '4-6 months', '6+ months'][Math.floor(Math.random() * 3)];
        
        return {
            leadId: leadId,
            name: names[Math.floor(Math.random() * names.length)],
            email: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '.')}@email.com`,
            phone: this.generateNZPhone(),
            location: locations[Math.floor(Math.random() * locations.length)],
            insuranceType: insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)],
            score: score,
            urgency: urgency,
            income: this.generateIncome(),
            age: Math.floor(Math.random() * 40) + 25,
            receivedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'Website Form',
            notes: this.generateLeadNotes(score)
        };
    }

    generateNZPhone() {
        const prefixes = ['021', '022', '027', '029', '09', '03', '04', '06', '07'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 9000000) + 1000000;
        return `${prefix} ${number.toString().substring(0, 3)} ${number.toString().substring(3)}`;
    }

    generateIncome() {
        const ranges = ['$50K-$75K', '$75K-$100K', '$100K-$150K', '$150K-$200K', '$200K+'];
        return ranges[Math.floor(Math.random() * ranges.length)];
    }

    generateLeadNotes(score) {
        if (score >= 85) return 'High-quality lead with strong urgency and clear needs';
        if (score >= 70) return 'Good potential, requires follow-up within 24 hours';
        if (score >= 60) return 'Average lead, may need nurturing';
        return 'Lower priority, long-term nurturing candidate';
    }

    // Broker Data Management
    async getBrokerData(brokerId) {
        console.log(`👤 Fetching broker data for: ${brokerId}`);
        
        await this.simulateNetworkDelay(200, 500);
        
        let broker = this.database.brokers.find(b => b.brokerId === brokerId);
        
        if (!broker) {
            broker = this.generateBrokerData(brokerId);
            this.database.brokers.push(broker);
            this.persistData();
        }
        
        return broker;
    }

    generateBrokerData(brokerId) {
        const companies = [
            'NZ Insurance Brokers Ltd', 'Premium Insurance Solutions', 'Guardian Financial',
            'Pacific Insurance Group', 'Elite Insurance Partners', 'Trust Insurance Co'
        ];
        
        const names = [
            'John Smith', 'Sarah Jones', 'Mike Williams', 'Lisa Brown',
            'David Wilson', 'Emma Taylor', 'Chris Johnson', 'Amy Davis'
        ];

        return {
            brokerId: brokerId,
            name: names[Math.floor(Math.random() * names.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            email: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '.')}@${companies[0].toLowerCase().replace(/[^a-z]/g, '')}.co.nz`,
            phone: this.generateNZPhone(),
            location: ['Auckland', 'Wellington', 'Christchurch'][Math.floor(Math.random() * 3)],
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            totalLeads: Math.floor(Math.random() * 500) + 50,
            conversionRate: (Math.random() * 30 + 15).toFixed(1) + '%',
            avgRating: (Math.random() * 2 + 3).toFixed(1),
            preferredContact: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)]
        };
    }

    // Comprehensive Data Collection
    async submitFeedback(feedbackData) {
        console.log('📤 Processing feedback submission:', feedbackData);
        
        // Validate required fields
        const validation = this.validateFeedbackData(feedbackData);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Simulate network delay with realistic variation
        await this.simulateNetworkDelay(1000, 2500);

        // Enrich feedback data with metadata
        const enrichedFeedback = this.enrichFeedbackData(feedbackData);
        
        // Store in database
        this.database.feedback.push(enrichedFeedback);
        
        // Update analytics
        this.updateAnalytics(enrichedFeedback);
        
        // Persist to localStorage
        this.persistData();
        
        // Log successful submission
        console.log('✅ Feedback submitted successfully:', enrichedFeedback);
        
        // Simulate broker notification
        this.sendBrokerNotification(enrichedFeedback);
        
        return {
            success: true,
            feedbackId: enrichedFeedback.feedbackId,
            timestamp: enrichedFeedback.submittedAt,
            message: 'Feedback submitted successfully'
        };
    }

    validateFeedbackData(data) {
        const errors = [];
        
        if (!data.leadId) errors.push('Lead ID is required');
        if (!data.brokerId) errors.push('Broker ID is required');
        if (!data.rating || data.rating < 1 || data.rating > 5) {
            errors.push('Rating must be between 1 and 5');
        }
        if (!data.status) errors.push('Lead status is required');
        
        // Validate email if provided
        if (data.brokerEmail && !this.isValidEmail(data.brokerEmail)) {
            errors.push('Invalid email format');
        }
        
        // Validate comment length
        if (data.comments && data.comments.length > 500) {
            errors.push('Comments must be under 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    enrichFeedbackData(data) {
        return {
            ...data,
            feedbackId: this.generateFeedbackId(),
            submittedAt: new Date().toISOString(),
            sessionId: this.sessionId,
            ipAddress: this.getSimulatedIP(),
            userAgent: navigator.userAgent,
            responseTime: this.calculateResponseTime(),
            source: 'web_form',
            version: '1.0.0',
            metadata: {
                formCompletionTime: data.formCompletionTime || null,
                retryCount: data.retryCount || 0,
                validationErrors: data.validationErrors || [],
                autosaveUsed: data.autosaveUsed || false
            }
        };
    }

    generateFeedbackId() {
        return 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    }

    getSimulatedIP() {
        return `203.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    calculateResponseTime() {
        return Math.floor(Math.random() * 120) + 15; // 15-135 seconds
    }

    // Analytics and Tracking
    updateAnalytics(feedbackData) {
        const today = new Date().toISOString().split('T')[0];
        let dailyStats = this.database.analytics.daily.find(d => d.date === today);
        
        if (!dailyStats) {
            dailyStats = {
                date: today,
                totalSubmissions: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                statusDistribution: {},
                issuesReported: {},
                responseTimeAvg: 0,
                brokerActivity: {}
            };
            this.database.analytics.daily.push(dailyStats);
        }

        // Update statistics
        dailyStats.totalSubmissions++;
        dailyStats.ratingDistribution[feedbackData.rating]++;
        dailyStats.statusDistribution[feedbackData.status] = 
            (dailyStats.statusDistribution[feedbackData.status] || 0) + 1;
        
        // Track issues
        if (feedbackData.issues && feedbackData.issues.length > 0) {
            feedbackData.issues.forEach(issue => {
                dailyStats.issuesReported[issue] = (dailyStats.issuesReported[issue] || 0) + 1;
            });
        }

        // Update broker activity
        if (!dailyStats.brokerActivity[feedbackData.brokerId]) {
            dailyStats.brokerActivity[feedbackData.brokerId] = {
                submissions: 0,
                totalRating: 0,
                averageRating: 0
            };
        }
        
        const brokerStats = dailyStats.brokerActivity[feedbackData.brokerId];
        brokerStats.submissions++;
        brokerStats.totalRating += feedbackData.rating;
        brokerStats.averageRating = (brokerStats.totalRating / brokerStats.submissions).toFixed(1);

        // Recalculate overall average rating
        const totalRatings = Object.values(dailyStats.ratingDistribution).reduce((a, b) => a + b, 0);
        const weightedSum = Object.entries(dailyStats.ratingDistribution)
            .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0);
        dailyStats.averageRating = totalRatings > 0 ? (weightedSum / totalRatings).toFixed(2) : 0;

        console.log('📈 Analytics updated:', dailyStats);
    }

    startAnalyticsCollection() {
        // Simulate real-time analytics updates every 30 seconds
        setInterval(() => {
            this.logAnalyticsSummary();
        }, 30000);
    }

    logAnalyticsSummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = this.database.analytics.daily.find(d => d.date === today);
        
        if (todayStats) {
            console.log('📊 Daily Analytics Summary:', {
                date: today,
                submissions: todayStats.totalSubmissions,
                averageRating: todayStats.averageRating,
                activeBrokers: Object.keys(todayStats.brokerActivity).length
            });
        }
    }

    // Broker Notification System
    async sendBrokerNotification(feedbackData) {
        console.log('📧 Sending broker notification for feedback:', feedbackData.feedbackId);
        
        // Simulate email notification delay
        await this.simulateNetworkDelay(500, 1000);
        
        const notification = {
            notificationId: 'notif_' + Date.now(),
            type: 'feedback_received',
            brokerId: feedbackData.brokerId,
            leadId: feedbackData.leadId,
            rating: feedbackData.rating,
            status: feedbackData.status,
            sentAt: new Date().toISOString(),
            deliveryStatus: 'sent'
        };

        console.log('✅ Broker notification sent:', notification);
        return notification;
    }

    // Data Persistence
    persistData() {
        try {
            localStorage.setItem('insuranceFeedbackDB', JSON.stringify(this.database));
            console.log('💾 Database persisted to localStorage');
        } catch (error) {
            console.error('❌ Failed to persist database:', error);
        }
    }

    loadLeads() {
        const stored = localStorage.getItem('insuranceFeedbackDB');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.leads || [];
            } catch (error) {
                console.warn('⚠️ Failed to load stored leads:', error);
            }
        }
        return [];
    }

    loadBrokers() {
        const stored = localStorage.getItem('insuranceFeedbackDB');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.brokers || [];
            } catch (error) {
                console.warn('⚠️ Failed to load stored brokers:', error);
            }
        }
        return [];
    }

    loadFeedback() {
        const stored = localStorage.getItem('insuranceFeedbackDB');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.feedback || [];
            } catch (error) {
                console.warn('⚠️ Failed to load stored feedback:', error);
            }
        }
        return [];
    }

    loadAnalytics() {
        const stored = localStorage.getItem('insuranceFeedbackDB');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.analytics || { daily: [], summary: {} };
            } catch (error) {
                console.warn('⚠️ Failed to load stored analytics:', error);
            }
        }
        return { daily: [], summary: {} };
    }

    // Demo and Reporting Functions
    generateDemoReport() {
        const report = {
            systemOverview: {
                totalLeads: this.database.leads.length,
                totalBrokers: this.database.brokers.length,
                totalFeedback: this.database.feedback.length,
                systemUptime: '99.9%',
                lastUpdated: new Date().toISOString()
            },
            recentActivity: this.database.feedback.slice(-10),
            topPerformingBrokers: this.getTopBrokers(),
            issueAnalysis: this.getIssueAnalysis(),
            ratingTrends: this.getRatingTrends()
        };

        console.log('📋 Demo Report Generated:', report);
        return report;
    }

    getTopBrokers() {
        const brokerStats = {};
        
        this.database.feedback.forEach(feedback => {
            if (!brokerStats[feedback.brokerId]) {
                brokerStats[feedback.brokerId] = {
                    totalFeedback: 0,
                    totalRating: 0,
                    averageRating: 0
                };
            }
            
            brokerStats[feedback.brokerId].totalFeedback++;
            brokerStats[feedback.brokerId].totalRating += feedback.rating;
        });

        return Object.entries(brokerStats)
            .map(([brokerId, stats]) => ({
                brokerId,
                ...stats,
                averageRating: (stats.totalRating / stats.totalFeedback).toFixed(1)
            }))
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5);
    }

    getIssueAnalysis() {
        const issues = {};
        
        this.database.feedback.forEach(feedback => {
            if (feedback.issues) {
                feedback.issues.forEach(issue => {
                    issues[issue] = (issues[issue] || 0) + 1;
                });
            }
        });

        return Object.entries(issues)
            .map(([issue, count]) => ({ issue, count }))
            .sort((a, b) => b.count - a.count);
    }

    getRatingTrends() {
        const trends = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        this.database.feedback.forEach(feedback => {
            trends[feedback.rating]++;
        });

        return trends;
    }

    // Utility Functions
    async simulateNetworkDelay(min = 500, max = 2000) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    logDatabaseStats() {
        console.log('🗄️ Database Statistics:', {
            leads: this.database.leads.length,
            brokers: this.database.brokers.length,
            feedback: this.database.feedback.length,
            analyticsRecords: this.database.analytics.daily.length
        });
    }

    // Export functionality for demonstrations
    exportData(format = 'json') {
        const exportData = {
            exported_at: new Date().toISOString(),
            system_info: {
                version: '1.0.0',
                session_id: this.sessionId
            },
            data: this.database
        };

        if (format === 'csv') {
            return this.convertToCSV(this.database.feedback);
        }

        return JSON.stringify(exportData, null, 2);
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                }).join(',')
            )
        ].join('\n');
        
        return csv;
    }

    // Clear demo data for fresh demonstrations
    clearDemoData() {
        this.database = {
            leads: [],
            brokers: [],
            feedback: [],
            analytics: { daily: [], summary: {} }
        };
        
        localStorage.removeItem('insuranceFeedbackDB');
        console.log('🧹 Demo data cleared');
    }

    // Seed with sample data for demonstrations
    seedDemoData() {
        console.log('🌱 Seeding demo data...');
        
        // Generate sample leads
        for (let i = 0; i < 10; i++) {
            const lead = this.generateRealisticLead(`DEMO-${1000 + i}`);
            this.database.leads.push(lead);
        }

        // Generate sample brokers
        for (let i = 0; i < 5; i++) {
            const broker = this.generateBrokerData(`demo_broker_${i + 1}`);
            this.database.brokers.push(broker);
        }

        // Generate sample feedback
        for (let i = 0; i < 25; i++) {
            const feedback = this.generateSampleFeedback();
            this.database.feedback.push(feedback);
            this.updateAnalytics(feedback);
        }

        this.persistData();
        console.log('✅ Demo data seeded successfully');
    }

    generateSampleFeedback() {
        const leadId = this.database.leads[Math.floor(Math.random() * this.database.leads.length)]?.leadId || 'DEMO-1000';
        const brokerId = this.database.brokers[Math.floor(Math.random() * this.database.brokers.length)]?.brokerId || 'demo_broker_1';
        
        const issues = ['wrong-contact', 'not-interested', 'has-coverage', 'budget-mismatch', 'outside-area', 'fake-lead'];
        const statuses = ['new', 'contacted', 'booked', 'first-meeting', 'second-meeting', 'submitted', 'issued', 'failed'];
        
        return {
            feedbackId: this.generateFeedbackId(),
            leadId: leadId,
            brokerId: brokerId,
            rating: Math.floor(Math.random() * 5) + 1,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            issues: Math.random() > 0.7 ? [issues[Math.floor(Math.random() * issues.length)]] : [],
            comments: Math.random() > 0.6 ? 'Sample feedback comment for demonstration' : '',
            submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            sessionId: this.sessionId,
            responseTime: Math.floor(Math.random() * 120) + 15
        };
    }
}

// Export for use in main application
window.BackendSimulation = BackendSimulation;