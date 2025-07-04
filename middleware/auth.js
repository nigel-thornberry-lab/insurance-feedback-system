const jwt = require('jsonwebtoken');

// Simple token authentication middleware
const authenticateToken = (req, res, next) => {
    // For demo purposes, we'll make this optional
    // In production, you'd require proper authentication
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        // Allow requests without tokens in development
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️  Development mode: Skipping authentication');
            return next();
        }
        
        return res.status(401).json({
            success: false,
            error: 'Access token required',
            code: 'MISSING_TOKEN'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'development-secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        req.user = user;
        next();
    });
};

// Generate a token for lead/broker authentication
const generateFeedbackToken = (leadId, brokerId, expiresIn = '7d') => {
    return jwt.sign(
        {
            leadId,
            brokerId,
            type: 'feedback_access'
        },
        process.env.JWT_SECRET || 'development-secret',
        { expiresIn }
    );
};

// Verify feedback token from URL parameters
const verifyFeedbackAccess = (req, res, next) => {
    const { token, leadId, brokerId } = req.query;

    if (!token && process.env.NODE_ENV === 'development') {
        console.log('⚠️  Development mode: Skipping feedback token verification');
        return next();
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Feedback access token required',
            code: 'MISSING_FEEDBACK_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
        
        // Verify the token matches the provided leadId and brokerId
        if (decoded.leadId !== leadId || decoded.brokerId !== brokerId) {
            return res.status(403).json({
                success: false,
                error: 'Token does not match lead/broker combination',
                code: 'TOKEN_MISMATCH'
            });
        }

        req.feedbackAccess = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired feedback token',
            code: 'INVALID_FEEDBACK_TOKEN'
        });
    }
};

module.exports = {
    authenticateToken,
    generateFeedbackToken,
    verifyFeedbackAccess
};