const { v4: uuidv4 } = require('uuid');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('email_logs').del()
    .then(() => knex('analytics_events').del())
    .then(() => knex('feedback').del())
    .then(() => knex('brokers').del())
    .then(() => knex('leads').del())
    .then(() => {
      // Insert sample brokers
      const brokers = [
        {
          id: uuidv4(),
          external_id: 'broker_001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@premiuminsurance.co.nz',
          phone: '+64 21 123 4567',
          company: 'Premium Insurance Solutions',
          location: 'Auckland',
          total_leads_received: 45,
          average_rating: 4.2,
          is_active: true
        },
        {
          id: uuidv4(),
          external_id: 'broker_002', 
          name: 'Mike Chen',
          email: 'mike.chen@elitecover.co.nz',
          phone: '+64 21 234 5678',
          company: 'Elite Cover Ltd',
          location: 'Wellington',
          total_leads_received: 38,
          average_rating: 4.5,
          is_active: true
        },
        {
          id: uuidv4(),
          external_id: 'broker_003',
          name: 'Emma Wilson',
          email: 'emma.wilson@trustinsure.com',
          phone: '+64 21 345 6789',
          company: 'Trust Insurance Group',
          location: 'Christchurch',
          total_leads_received: 52,
          average_rating: 3.8,
          is_active: true
        }
      ];

      return knex('brokers').insert(brokers)
        .then(() => {
          // Insert sample leads
          const leads = [
            {
              id: uuidv4(),
              external_id: 'INS-2024-001',
              name: 'David Thompson',
              email: 'david.thompson@email.com',
              phone: '+64 9 123 4567',
              location: 'Auckland',
              insurance_type: 'Life Insurance',
              urgency: 'High',
              income_range: '$75,000-$100,000',
              age: 34,
              score: 85,
              source: 'Google Ads',
              weekly_cost: 45.50,
              insurance_status: 'Currently insured',
              satisfaction_score: 4.2,
              engagement_score: 4.5,
              completion_rate: 0.95,
              generated_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
              id: uuidv4(),
              external_id: 'INS-2024-002',
              name: 'Lisa Rodriguez',
              email: 'lisa.rodriguez@email.com',
              phone: '+64 4 234 5678',
              location: 'Wellington',
              insurance_type: 'Health Insurance',
              urgency: 'Medium',
              income_range: '$50,000-$75,000',
              age: 28,
              score: 72,
              source: 'Facebook',
              weekly_cost: 32.75,
              insurance_status: 'Not insured',
              satisfaction_score: 3.8,
              engagement_score: 4.1,
              completion_rate: 0.88,
              generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
              id: uuidv4(),
              external_id: 'INS-2024-003',
              name: 'James Patel',
              email: 'james.patel@email.com',
              phone: '+64 3 345 6789',
              location: 'Christchurch',
              insurance_type: 'Income Protection',
              urgency: 'High',
              income_range: '$100,000+',
              age: 42,
              score: 91,
              source: 'Referral',
              weekly_cost: 68.25,
              insurance_status: 'Partially insured',
              satisfaction_score: 4.7,
              engagement_score: 4.8,
              completion_rate: 0.98,
              generated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            }
          ];

          return knex('leads').insert(leads);
        });
    })
    .then(() => {
      // Get the inserted data for foreign key references
      return Promise.all([
        knex('brokers').select('id', 'external_id'),
        knex('leads').select('id', 'external_id')
      ]);
    })
    .then(([brokers, leads]) => {
      // Insert sample feedback
      const feedback = [
        {
          id: uuidv4(),
          lead_id: leads.find(l => l.external_id === 'INS-2024-001').id,
          broker_id: brokers.find(b => b.external_id === 'broker_001').id,
          rating: 4,
          status: 'contacted',
          issues: ['budget-mismatch'],
          comments: 'Good lead overall, budget expectations were slightly high but we found a suitable option.',
          lead_score: 85,
          form_completion_time: 45,
          session_id: 'session_' + Date.now(),
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          touch_device: true,
          ip_address: '203.97.99.100',
          submitted_at: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
        },
        {
          id: uuidv4(),
          lead_id: leads.find(l => l.external_id === 'INS-2024-002').id,
          broker_id: brokers.find(b => b.external_id === 'broker_002').id,
          rating: 5,
          status: 'booked',
          issues: [],
          comments: 'Excellent lead! Very engaged and has scheduled an appointment for next week.',
          lead_score: 72,
          form_completion_time: 32,
          session_id: 'session_' + (Date.now() - 1000),
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          touch_device: false,
          ip_address: '203.97.99.101',
          submitted_at: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        }
      ];

      return knex('feedback').insert(feedback);
    })
    .then(() => {
      // Insert sample analytics events
      const analyticsEvents = [
        {
          id: uuidv4(),
          event_name: 'page_view',
          session_id: 'session_' + Date.now(),
          event_data: {
            page: '/feedback',
            referrer: 'email',
            device: 'mobile'
          },
          ip_address: '203.97.99.100',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          occurred_at: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          id: uuidv4(),
          event_name: 'star_rating_click',
          session_id: 'session_' + Date.now(),
          event_data: {
            rating: 4,
            previousRating: 0
          },
          ip_address: '203.97.99.100',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          occurred_at: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
        }
      ];

      return knex('analytics_events').insert(analyticsEvents);
    });
};