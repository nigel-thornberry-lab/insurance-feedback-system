require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

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
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        error: 'Too many feedback submissions, please try again later.'
    }
});

app.use('/api/', generalLimiter);
app.use('/api/feedback', feedbackLimiter);

// Logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// API Routes
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/brokers', require('./routes/brokers'));
app.use('/api/v1/feedback', require('./routes/feedback'));
app.use('/api/v1/analytics', require('./routes/analytics'));

// Serve the main feedback page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'feedback-page.html'));
});

app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'feedback-page.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'demo-dashboard.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected' // TODO: Add actual database health check
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Insurance Feedback System API',
        version: '1.0.0',
        endpoints: {
            'POST /api/v1/feedback': 'Submit feedback for a lead',
            'GET /api/v1/leads/:id': 'Get lead details',
            'GET /api/v1/brokers/:id': 'Get broker details',
            'GET /api/v1/analytics': 'Get system analytics',
            'GET /health': 'Health check endpoint'
        },
        documentation: '/docs'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path
    });
});

// 404 handler for other routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', 'feedback-page.html'));
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Insurance Feedback System running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access the application at: http://localhost:${PORT}`);
    console.log(`📈 Dashboard available at: http://localhost:${PORT}/dashboard`);
    console.log(`🔍 API documentation at: http://localhost:${PORT}/api`);
    
    if (process.env.NODE_ENV === 'development') {
        console.log('\n🛠️  Development mode active');
        console.log('💡 Don\'t forget to:');
        console.log('   - Set up your PostgreSQL database');
        console.log('   - Copy .env.example to .env and configure');
        console.log('   - Run: npm run db:setup');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});