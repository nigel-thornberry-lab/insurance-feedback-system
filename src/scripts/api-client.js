// Professional Insurance Feedback System - API Client
// Replaces localStorage simulation with real PostgreSQL backend

class ApiClient {
    constructor() {
        this.baseURL = window.location.origin + '/api/v1';
        this.sessionId = this.generateSessionId();
        console.log('🚀 API Client initialized with base URL:', this.baseURL);
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Submit feedback to PostgreSQL backend
    async submitFeedback(feedbackData) {
        try {
            console.log('📤 Submitting feedback:', feedbackData);
            
            const response = await fetch(`${this.baseURL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...feedbackData,
                    sessionId: this.sessionId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit feedback');
            }

            console.log('✅ Feedback submitted successfully:', result);
            return result;

        } catch (error) {
            console.error('❌ Feedback submission failed:', error);
            throw error;
        }
    }

    // Get lead information
    async getLeadInfo(leadId) {
        try {
            const response = await fetch(`${this.baseURL}/leads/${leadId}`);
            const result = await response.json();
            
            if (!response.ok) {
                if (response.status === 404) {
                    // Create a default lead if not found
                    return this.createDefaultLead(leadId);
                }
                throw new Error(result.error || 'Failed to get lead info');
            }

            return result.data;

        } catch (error) {
            console.error('❌ Get lead info failed:', error);
            // Return default lead data for demo purposes
            return this.createDefaultLead(leadId);
        }
    }

    // Get broker information
    async getBrokerInfo(brokerId) {
        try {
            const response = await fetch(`${this.baseURL}/brokers/${brokerId}`);
            const result = await response.json();
            
            if (!response.ok) {
                if (response.status === 404) {
                    return this.createDefaultBroker(brokerId);
                }
                throw new Error(result.error || 'Failed to get broker info');
            }

            return result.data;

        } catch (error) {
            console.error('❌ Get broker info failed:', error);
            return this.createDefaultBroker(brokerId);
        }
    }

    // Get analytics data
    async getAnalytics(params = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${this.baseURL}/analytics/overview?${queryParams}`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get analytics');
            }

            return result.data;

        } catch (error) {
            console.error('❌ Get analytics failed:', error);
            throw error;
        }
    }

    // Get recent feedback
    async getRecentFeedback(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/feedback/recent?limit=${limit}`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get recent feedback');
            }

            return result.data;

        } catch (error) {
            console.error('❌ Get recent feedback failed:', error);
            return [];
        }
    }

    // Track analytics event
    async trackEvent(eventName, eventData) {
        try {
            // For now, just log the event - in production this would send to analytics service
            console.log(`📊 Event tracked: ${eventName}`, eventData);
            
            // Store locally for demo dashboard
            const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
            events.push({
                event: eventName,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                ...eventData
            });
            localStorage.setItem('analyticsEvents', JSON.stringify(events.slice(-100)));

        } catch (error) {
            console.error('❌ Event tracking failed:', error);
        }
    }

    // URL Parameter Handling
    parseURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            leadId: urlParams.get('leadId') || this.generateSampleLeadId(),
            brokerId: urlParams.get('brokerId') || 'broker_' + Math.random().toString(36).substr(2, 6),
            source: urlParams.get('source') || 'direct',
            timestamp: urlParams.get('timestamp') || Date.now(),
            token: urlParams.get('token') || null
        };
    }

    generateSampleLeadId() {
        const prefixes = ['INS', 'LIFE', 'HEALTH', 'AUTO', 'HOME'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `${prefix}-${new Date().getFullYear()}-${number}`;
    }

    createDefaultLead(leadId) {
        return {
            external_id: leadId,
            name: 'Sample Lead',
            email: 'lead@example.com',
            phone: '+64 21 123 4567',
            location: 'Auckland',
            insurance_type: 'Life Insurance',
            urgency: 'High',
            income_range: '$75,000-$100,000',
            age: 35,
            score: Math.floor(Math.random() * 40) + 60, // 60-100
            source: 'Google Ads',
            weekly_cost: Math.floor(Math.random() * 50) + 25,
            insurance_status: 'Currently insured',
            generated_at: new Date()
        };
    }

    createDefaultBroker(brokerId) {
        const brokerNames = ['Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Lee', 'Lisa Rodriguez'];
        const companies = ['Premium Insurance', 'Elite Cover', 'Trust Insurance', 'Safe Harbor', 'Guardian Life'];
        
        return {
            external_id: brokerId,
            name: brokerNames[Math.floor(Math.random() * brokerNames.length)],
            email: `${brokerId}@insurance.co.nz`,
            company: companies[Math.floor(Math.random() * companies.length)],
            location: 'Auckland',
            total_leads_received: Math.floor(Math.random() * 50) + 10,
            average_rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
            is_active: true
        };
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${window.location.origin}/health`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return { status: 'error', error: error.message };
        }
    }

    // Export data (for dashboard)
    async exportData(format = 'json') {
        try {
            const response = await fetch(`${this.baseURL}/analytics/export?format=${format}`);
            
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-data-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('❌ Export failed:', error);
            throw error;
        }
    }
}