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

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
});

module.exports = app;
