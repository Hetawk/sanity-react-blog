// Vercel Serverless Function Entry Point
// This exports the Express app to handle all /api/* routes

try {
    console.log('🚀 Loading server from:', __dirname);
    console.log('📁 Files in api/:', require('fs').readdirSync(__dirname));
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('💾 DATABASE_URL exists:', !!process.env.DATABASE_URL);

    const app = require('./server');
    console.log('✅ Server loaded successfully');
    module.exports = app;
} catch (error) {
    console.error('❌ Failed to load backend server:', error);
    console.error('Stack:', error.stack);

    // Export a basic error handler
    module.exports = (req, res) => {
        res.status(500).json({
            error: 'Server initialization failed',
            message: error.message,
            stack: error.stack,
            cwd: process.cwd(),
            dirname: __dirname
        });
    };
}