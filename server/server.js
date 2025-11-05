const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const workRoutes = require('./routes/work.routes');
const aboutRoutes = require('./routes/about.routes');
const skillRoutes = require('./routes/skill.routes');
const experienceRoutes = require('./routes/experience.routes');
const workExperienceRoutes = require('./routes/workExperience.routes');
const brandRoutes = require('./routes/brand.routes');
const awardRoutes = require('./routes/award.routes');
const contactRoutes = require('./routes/contact.routes');
const resumeRoutes = require('./routes/resume.routes');
const researchRoutes = require('./routes/research.routes'); // Includes publications & research statement
const testimonialRoutes = require('./routes/testimonial.routes');
const leadershipRoutes = require('./routes/leadership.routes');
const githubSyncRoutes = require('./routes/github-sync.routes');

// Services
const { startScheduler } = require('./services/schedulerService');

const app = express();

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - trim whitespace and handle serverless environment
const allowedOrigins = [
    'https://www.ekdportfolio.ekddigital.com',
    'https://ekdportfolio.ekddigital.com',
    'http://localhost:3000',
    'http://localhost:3001'
];

// Add FRONTEND_URL if provided (trim any whitespace/newlines)
if (process.env.FRONTEND_URL) {
    const frontendUrl = process.env.FRONTEND_URL.trim();
    if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
        allowedOrigins.push(frontendUrl);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Portfolio API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/works', workRoutes);
app.use('/api/abouts', aboutRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/work-experiences', workExperienceRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/research', researchRoutes); // Handles /statement, /publications, /stats, /featured
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/github-sync', githubSyncRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Welcome to Portfolio API',
        version: '1.0.0',
        endpoints: {
            works: '/api/works',
            abouts: '/api/abouts',
            skills: '/api/skills',
            experiences: '/api/experiences',
            workExperiences: '/api/work-experiences',
            brands: '/api/brands',
            awards: '/api/awards',
            contacts: '/api/contacts',
            resumes: '/api/resumes'
        },
        docs: '/api/docs'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

// Only start the server if not running in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Portfolio API Server                                ║
║                                                           ║
║   Status:    Running                                      ║
║   Port:      ${PORT}                                            ║
║   Env:       ${process.env.NODE_ENV || 'development'}                           ║
║   URL:       http://localhost:${PORT}                        ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /api/works                                       ║
║   - GET  /api/abouts                                      ║
║   - GET  /api/skills                                      ║
║   - GET  /api/experiences                                 ║
║   - GET  /api/awards                                      ║
║   - POST /api/contacts                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

        // Start GitHub Auto-Sync Scheduler (syncs every 1 hour)
        console.log('🔄 Initializing GitHub Auto-Sync Scheduler...');
        startScheduler();
    });
}

module.exports = app;
