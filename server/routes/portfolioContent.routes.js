/**
 * Portfolio Content Search Routes
 * API endpoints for searching portfolio content to add to resumes
 */

const express = require('express');
const router = express.Router();
const portfolioContentService = require('../services/portfolioContentService');

// ============================================
// UNIFIED SEARCH
// ============================================

/**
 * Search all content types
 * GET /api/portfolio-content/search
 * Query params: search, types (comma-separated), countryCode, skip, take
 */
router.get('/search', async (req, res) => {
    try {
        const { search, types, countryCode = 'US', skip = 0, take = 20 } = req.query;

        const options = {
            search,
            types: types ? types.split(',') : [],
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        };

        const results = await portfolioContentService.searchAllContent(options);

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Search all content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search content',
            message: error.message,
        });
    }
});

// ============================================
// INDIVIDUAL TYPE SEARCHES
// ============================================

/**
 * Search work experiences
 * GET /api/portfolio-content/experiences
 */
router.get('/experiences', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchWorkExperiences({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search experiences error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search education
 * GET /api/portfolio-content/education
 */
router.get('/education', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchEducation({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search education error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search certifications
 * GET /api/portfolio-content/certifications
 */
router.get('/certifications', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchCertifications({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search certifications error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search awards
 * GET /api/portfolio-content/awards
 */
router.get('/awards', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchAwards({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search awards error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search projects
 * GET /api/portfolio-content/projects
 */
router.get('/projects', async (req, res) => {
    try {
        const { search, skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchProjects({
            search,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search projects error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search skills
 * GET /api/portfolio-content/skills
 */
router.get('/skills', async (req, res) => {
    try {
        const { search, category, skip = 0, take = 100 } = req.query;

        const results = await portfolioContentService.searchSkills({
            search,
            category,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search skills error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search publications
 * GET /api/portfolio-content/publications
 */
router.get('/publications', async (req, res) => {
    try {
        const { search, skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchPublications({
            search,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search publications error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search leadership
 * GET /api/portfolio-content/leadership
 */
router.get('/leadership', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchLeadership({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search leadership error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search volunteer work
 * GET /api/portfolio-content/volunteer
 */
router.get('/volunteer', async (req, res) => {
    try {
        const { search, countryCode = 'US', skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchVolunteerWork({
            search,
            countryCode,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search volunteer error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search references
 * GET /api/portfolio-content/references
 */
router.get('/references', async (req, res) => {
    try {
        const { search, consentOnly, skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchReferences({
            search,
            consentOnly: consentOnly === 'true',
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search references error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Search languages
 * GET /api/portfolio-content/languages
 */
router.get('/languages', async (req, res) => {
    try {
        const { search, skip = 0, take = 50 } = req.query;

        const results = await portfolioContentService.searchLanguages({
            search,
            skip: parseInt(skip),
            take: parseInt(take),
        });

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Search languages error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
