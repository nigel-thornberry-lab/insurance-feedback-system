# Implementation Guide - Production Setup

## Quick Start Guide

### 1. Environment Setup

```bash
# Clone and setup
git clone https://github.com/yourcompany/insurance-feedback-system
cd insurance-feedback-system
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your configuration

# Database setup
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### 2. Essential Configuration

#### Environment Variables
```bash
# .env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost/feedback_db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-256-bit-secret
SESSION_SECRET=your-session-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=leads@yourcompany.com

# Frontend URL
FRONTEND_URL=https://feedback.yourcompany.com

# Business Configuration
COMPANY_NAME="Your Lead Generation Business"
PRIMARY_COLOR="#3B82F6"
LOGO_URL="/assets/logo.png"
```

## Database Setup

### PostgreSQL Installation & Configuration

```sql
-- Create database and user
CREATE DATABASE feedback_db;
CREATE USER feedback_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE feedback_db TO feedback_user;

-- Connect to database
\c feedback_db

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Migration Scripts

```javascript
// migrations/001_initial_schema.js
exports.up = function(knex) {
    return knex.schema
        .createTable('leads', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
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
            table.timestamp('generated_at').defaultTo(knex.fn.now());
            table.timestamps(true, true);
            
            // Indexes
            table.index(['external_id'], 'idx_leads_external_id');
            table.index(['score'], 'idx_leads_score');
            table.index(['generated_at'], 'idx_leads_generated_at');
        })
        .createTable('brokers', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
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
        })
        .createTable('feedback', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
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
            table.timestamps(true, true);
            
            table.unique(['lead_id', 'broker_id'], 'unique_lead_broker_feedback');
            table.index(['broker_id'], 'idx_feedback_broker_id');
            table.index(['rating'], 'idx_feedback_rating');
            table.index(['created_at'], 'idx_feedback_created_at');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('feedback')
        .dropTableIfExists('brokers')
        .dropTableIfExists('leads');
};
```

## Email Integration Setup

### SendGrid Configuration

```javascript
// services/email-service.js
const sgMail = require('@sendgrid/mail');

class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.templates = {
            leadNotification: process.env.SENDGRID_LEAD_TEMPLATE_ID,
            feedbackReminder: process.env.SENDGRID_REMINDER_TEMPLATE_ID
        };
    }

    async sendLeadNotification(leadData, brokerData) {
        const feedbackUrl = this.generateFeedbackUrl(leadData, brokerData);
        
        const msg = {
            to: brokerData.email,
            from: {
                email: process.env.FROM_EMAIL,
                name: process.env.COMPANY_NAME
            },
            templateId: this.templates.leadNotification,
            dynamicTemplateData: {
                broker_name: brokerData.name,
                lead_name: leadData.name,
                lead_phone: leadData.phone,
                lead_email: leadData.email,
                lead_score: leadData.score,
                insurance_type: leadData.insuranceType,
                urgency: leadData.urgency,
                feedback_url: feedbackUrl,
                company_name: process.env.COMPANY_NAME
            },
            trackingSettings: {
                clickTracking: { enable: true },
                openTracking: { enable: true }
            }
        };

        try {
            const [response] = await sgMail.send(msg);
            
            // Log email delivery
            await this.logEmailDelivery({
                leadId: leadData.id,
                brokerId: brokerData.id,
                messageId: response.headers['x-message-id'],
                status: 'sent'
            });
            
            return response;
        } catch (error) {
            console.error('Email send failed:', error);
            throw error;
        }
    }

    generateFeedbackUrl(leadData, brokerData) {
        const token = jwt.sign(
            {
                leadId: leadData.external_id,
                brokerId: brokerData.external_id,
                exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
            },
            process.env.JWT_SECRET
        );

        const params = new URLSearchParams({
            leadId: leadData.external_id,
            brokerId: brokerData.external_id,
            token: token,
            source: 'email'
        });

        return `${process.env.FRONTEND_URL}/feedback?${params.toString()}`;
    }
}

module.exports = EmailService;
```

### Alternative Email Providers

#### AWS SES Integration
```javascript
// services/aws-ses-service.js
const AWS = require('aws-sdk');

class AWSEmailService {
    constructor() {
        this.ses = new AWS.SES({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
        });
    }

    async sendEmail(params) {
        const emailParams = {
            Destination: {
                ToAddresses: [params.to]
            },
            Message: {
                Body: {
                    Html: {
                        Data: params.html,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: params.text,
                        Charset: 'UTF-8'
                    }
                },
                Subject: {
                    Data: params.subject,
                    Charset: 'UTF-8'
                }
            },
            Source: params.from
        };

        return await this.ses.sendEmail(emailParams).promise();
    }
}
```

## Server Configuration

### Express.js Server Setup

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many feedback submissions, please try again later.'
    }
});

app.use('/api/', generalLimiter);
app.use('/api/feedback', feedbackLimiter);

// Logging
app.use(morgan('combined'));

// Static files
app.use(express.static('public'));

// API Routes
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/brokers', require('./routes/brokers'));
app.use('/api/v1/feedback', require('./routes/feedback'));
app.use('/api/v1/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

### API Route Implementations

```javascript
// routes/feedback.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const FeedbackService = require('../services/feedback-service');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const feedbackService = new FeedbackService();

// Validation rules
const validateFeedback = [
    body('leadId').notEmpty().withMessage('Lead ID is required'),
    body('brokerId').notEmpty().withMessage('Broker ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('status').isIn([
        'new', 'contacted', 'booked', 'first-meeting', 
        'second-meeting', 'submitted', 'issued', 'failed'
    ]).withMessage('Invalid status'),
    body('issues').optional().isArray().withMessage('Issues must be array'),
    body('comments').optional().isLength({ max: 500 }).withMessage('Comments too long')
];

// Submit feedback
router.post('/', authenticateToken, validateFeedback, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const feedbackData = {
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            submittedAt: new Date()
        };

        const result = await feedbackService.submitFeedback(feedbackData);
        
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});

// Get feedback analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, brokerId } = req.query;
        
        const analytics = await feedbackService.getAnalytics({
            startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
            brokerId
        });

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve analytics'
        });
    }
});

module.exports = router;
```

## Deployment Options

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application (if you have a build step)
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://feedback_user:${DB_PASSWORD}@db:5432/feedback_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feedback_db
      POSTGRES_USER: feedback_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name feedback.yourcompany.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name feedback.yourcompany.com;

        ssl_certificate /etc/ssl/certs/yourcompany.pem;
        ssl_certificate_key /etc/ssl/certs/yourcompany.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        location /health {
            proxy_pass http://app/health;
            access_log off;
        }
    }
}
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: feedback-app
  labels:
    app: feedback-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: feedback-app
  template:
    metadata:
      labels:
        app: feedback-app
    spec:
      containers:
      - name: feedback-app
        image: yourregistry/feedback-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: feedback-service
spec:
  selector:
    app: feedback-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Monitoring Setup

### Application Monitoring

```javascript
// monitoring/metrics.js
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 500]
});

const feedbackSubmissions = new promClient.Counter({
    name: 'feedback_submissions_total',
    help: 'Total number of feedback submissions',
    labelNames: ['status', 'rating']
});

const emailsSent = new promClient.Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['type', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(feedbackSubmissions);
register.registerMetric(emailsSent);

// Middleware to collect HTTP metrics
function metricsMiddleware(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
    });
    
    next();
}

// Metrics endpoint
function metricsEndpoint(req, res) {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
}

module.exports = {
    metricsMiddleware,
    metricsEndpoint,
    feedbackSubmissions,
    emailsSent
};
```

### Logging Configuration

```javascript
// logging/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { 
        service: 'feedback-system',
        version: process.env.npm_package_version 
    },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Structured logging for business events
logger.logFeedbackSubmission = (data) => {
    logger.info('Feedback submitted', {
        event: 'feedback_submission',
        leadId: data.leadId,
        brokerId: data.brokerId,
        rating: data.rating,
        status: data.status,
        formCompletionTime: data.formCompletionTime
    });
};

logger.logEmailSent = (data) => {
    logger.info('Email sent', {
        event: 'email_sent',
        type: data.type,
        recipient: data.recipient,
        messageId: data.messageId
    });
};

module.exports = logger;
```

## Testing Strategy

### Unit Tests

```javascript
// tests/services/feedback-service.test.js
const FeedbackService = require('../../services/feedback-service');
const db = require('../../database');

jest.mock('../../database');

describe('FeedbackService', () => {
    let feedbackService;

    beforeEach(() => {
        feedbackService = new FeedbackService();
        jest.clearAllMocks();
    });

    describe('submitFeedback', () => {
        it('should submit valid feedback successfully', async () => {
            const mockFeedbackData = {
                leadId: 'lead-123',
                brokerId: 'broker-456',
                rating: 4,
                status: 'contacted',
                issues: ['budget-mismatch'],
                comments: 'Good lead overall'
            };

            db.query.mockResolvedValueOnce({ rows: [{ id: 'feedback-789' }] });

            const result = await feedbackService.submitFeedback(mockFeedbackData);

            expect(result).toHaveProperty('feedbackId', 'feedback-789');
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO feedback'),
                expect.any(Array)
            );
        });

        it('should reject invalid rating', async () => {
            const invalidData = {
                leadId: 'lead-123',
                brokerId: 'broker-456',
                rating: 6, // Invalid
                status: 'contacted'
            };

            await expect(feedbackService.submitFeedback(invalidData))
                .rejects.toThrow('Rating must be between 1 and 5');
        });
    });
});
```

### Integration Tests

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../database');

describe('Feedback API Integration', () => {
    beforeAll(async () => {
        await db.migrate.latest();
        await db.seed.run();
    });

    afterAll(async () => {
        await db.destroy();
    });

    describe('POST /api/v1/feedback', () => {
        it('should submit feedback with valid data', async () => {
            const feedbackData = {
                leadId: 'TEST-001',
                brokerId: 'BROKER-001',
                rating: 4,
                status: 'contacted',
                issues: [],
                comments: 'Test feedback'
            };

            const response = await request(app)
                .post('/api/v1/feedback')
                .set('Authorization', 'Bearer valid-token')
                .send(feedbackData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('feedbackId');
        });

        it('should return 400 for invalid data', async () => {
            const invalidData = {
                leadId: 'TEST-001',
                // Missing required fields
                rating: 6 // Invalid rating
            };

            const response = await request(app)
                .post('/api/v1/feedback')
                .set('Authorization', 'Bearer valid-token')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });
});
```

### Load Testing

```javascript
// tests/load/load-test.js
const http = require('k6/http');
const { check, sleep } = require('k6');

export let options = {
    stages: [
        { duration: '2m', target: 10 }, // Ramp up
        { duration: '5m', target: 50 }, // Stay at 50 users
        { duration: '2m', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
        http_req_failed: ['rate<0.1'],    // Less than 10% failure rate
    },
};

export default function() {
    const payload = JSON.stringify({
        leadId: 'LOAD-TEST-001',
        brokerId: 'BROKER-001',
        rating: Math.floor(Math.random() * 5) + 1,
        status: 'contacted',
        issues: [],
        comments: 'Load test feedback'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
        },
    };

    const response = http.post('http://localhost:3000/api/v1/feedback', payload, params);
    
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
```

This implementation guide provides everything needed to deploy the feedback system to production, including database setup, email integration, server configuration, deployment options, monitoring, and testing strategies.