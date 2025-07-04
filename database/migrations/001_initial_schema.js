exports.up = function(knex) {
    return knex.schema
        .createTable('leads', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('external_id', 50).unique().notNullable();
            table.string('name', 255).notNullable();
            table.string('email', 255);
            table.string('phone', 50);
            table.string('location', 255);
            table.string('insurance_type', 100);
            table.string('urgency', 50);
            table.string('income_range', 50);
            table.integer('age');
            table.integer('score').checkBetween([0, 100]);
            table.string('source', 100);
            table.decimal('weekly_cost', 10, 2);
            table.string('insurance_status', 100);
            table.decimal('satisfaction_score', 3, 2);
            table.decimal('engagement_score', 3, 2);
            table.decimal('completion_rate', 3, 2);
            table.timestamp('generated_at').defaultTo(knex.fn.now());
            table.timestamps(true, true);
            
            // Indexes for performance
            table.index(['external_id'], 'idx_leads_external_id');
            table.index(['score'], 'idx_leads_score');
            table.index(['generated_at'], 'idx_leads_generated_at');
            table.index(['insurance_type'], 'idx_leads_insurance_type');
        })
        .createTable('brokers', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('external_id', 50).unique().notNullable();
            table.string('name', 255).notNullable();
            table.string('email', 255).unique().notNullable();
            table.string('phone', 50);
            table.string('company', 255);
            table.string('location', 255);
            table.integer('total_leads_received').defaultTo(0);
            table.decimal('average_rating', 3, 2).defaultTo(0);
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
            
            table.index(['external_id'], 'idx_brokers_external_id');
            table.index(['email'], 'idx_brokers_email');
            table.index(['is_active'], 'idx_brokers_active');
        })
        .createTable('feedback', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('lead_id').references('id').inTable('leads').onDelete('CASCADE');
            table.uuid('broker_id').references('id').inTable('brokers').onDelete('CASCADE');
            table.integer('rating').checkBetween([1, 5]).notNullable();
            table.string('status', 50).notNullable();
            table.specificType('issues', 'text[]');
            table.text('comments');
            table.integer('lead_score');
            table.integer('form_completion_time');
            table.string('session_id', 100);
            table.text('user_agent');
            table.boolean('touch_device');
            table.inet('ip_address');
            table.timestamp('submitted_at').defaultTo(knex.fn.now());
            table.timestamps(true, true);
            
            // Ensure one feedback per lead-broker combination
            table.unique(['lead_id', 'broker_id'], 'unique_lead_broker_feedback');
            table.index(['broker_id'], 'idx_feedback_broker_id');
            table.index(['rating'], 'idx_feedback_rating');
            table.index(['status'], 'idx_feedback_status');
            table.index(['submitted_at'], 'idx_feedback_submitted_at');
        })
        .createTable('analytics_events', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('event_name', 100).notNullable();
            table.string('session_id', 100);
            table.uuid('lead_id').references('id').inTable('leads').onDelete('SET NULL');
            table.uuid('broker_id').references('id').inTable('brokers').onDelete('SET NULL');
            table.jsonb('event_data');
            table.inet('ip_address');
            table.text('user_agent');
            table.timestamp('occurred_at').defaultTo(knex.fn.now());
            
            table.index(['event_name'], 'idx_analytics_event_name');
            table.index(['session_id'], 'idx_analytics_session_id');
            table.index(['occurred_at'], 'idx_analytics_occurred_at');
        })
        .createTable('email_logs', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('lead_id').references('id').inTable('leads').onDelete('CASCADE');
            table.uuid('broker_id').references('id').inTable('brokers').onDelete('CASCADE');
            table.string('email_type', 50).notNullable();
            table.string('recipient_email', 255).notNullable();
            table.string('message_id', 255);
            table.string('status', 50).defaultTo('sent');
            table.jsonb('email_data');
            table.timestamp('sent_at').defaultTo(knex.fn.now());
            table.timestamps(true, true);
            
            table.index(['email_type'], 'idx_email_logs_type');
            table.index(['status'], 'idx_email_logs_status');
            table.index(['sent_at'], 'idx_email_logs_sent_at');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('email_logs')
        .dropTableIfExists('analytics_events')
        .dropTableIfExists('feedback')
        .dropTableIfExists('brokers')
        .dropTableIfExists('leads');
};