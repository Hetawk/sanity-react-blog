// Vercel Serverless Function Entry Point
// This exports the Express app to handle all /api/* routes

try {
    const app = require('./server');
    module.exports = app;
} catch (error) {
    console.error('❌ Failed to load backend server:', error);
    
    // Export a basic error handler
    module.exports = (req, res) => {
        res.status(500).json({
            error: 'Server initialization failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    };
}