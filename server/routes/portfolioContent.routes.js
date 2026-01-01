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

// ============================================
// UPDATE ROUTES (for syncing resume edits back to portfolio)
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Update reference
 * PUT /api/portfolio-content/references/:id
 */
router.put('/references/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const reference = await prisma.reference.update({
            where: { id },
            data: {
                name: data.name,
                title: data.title,
                company: data.company,
                email: data.email,
                phone: data.phone,
                relationship: data.relationship,
                hasConsent: data.hasConsent,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: reference });
    } catch (error) {
        console.error('Update reference error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Reference not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update work experience
 * PUT /api/portfolio-content/experiences/:id
 */
router.put('/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const experience = await prisma.workExperience.update({
            where: { id },
            data: {
                title: data.title,
                company: data.company,
                location: data.location,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                isCurrent: data.isCurrent,
                description: data.description,
                responsibilities: data.responsibilities,
                achievements: data.achievements,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: experience });
    } catch (error) {
        console.error('Update experience error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Experience not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update education
 * PUT /api/portfolio-content/education/:id
 */
router.put('/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const education = await prisma.education.update({
            where: { id },
            data: {
                institution: data.institution,
                degree: data.degree,
                field: data.field,
                location: data.location,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                gpa: data.gpa,
                honors: data.honors,
                description: data.description,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: education });
    } catch (error) {
        console.error('Update education error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Education not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update certification
 * PUT /api/portfolio-content/certifications/:id
 */
router.put('/certifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const certification = await prisma.certification.update({
            where: { id },
            data: {
                name: data.name,
                issuer: data.issuer,
                issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                credentialId: data.credentialId,
                credentialUrl: data.credentialUrl,
                description: data.description,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: certification });
    } catch (error) {
        console.error('Update certification error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Certification not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update award
 * PUT /api/portfolio-content/awards/:id
 */
router.put('/awards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const award = await prisma.award.update({
            where: { id },
            data: {
                name: data.name || data.title,
                issuer: data.issuer,
                date: data.date ? new Date(data.date) : undefined,
                description: data.description,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: award });
    } catch (error) {
        console.error('Update award error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Award not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update project (work)
 * PUT /api/portfolio-content/projects/:id
 */
router.put('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const project = await prisma.work.update({
            where: { id },
            data: {
                title: data.title || data.name,
                description: data.description,
                projectLink: data.projectLink || data.url,
                codeLink: data.codeLink,
                techStack: Array.isArray(data.technologies) ? JSON.stringify(data.technologies) : data.techStack,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: project });
    } catch (error) {
        console.error('Update project error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update publication
 * PUT /api/portfolio-content/publications/:id
 */
router.put('/publications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const publication = await prisma.publication.update({
            where: { id },
            data: {
                title: data.title,
                authors: Array.isArray(data.authors) ? JSON.stringify(data.authors) : data.authors,
                journal: data.journal || data.venue,
                year: data.year ? parseInt(data.year) : undefined,
                doi: data.doi,
                url: data.url,
                abstract: data.abstract || data.description,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: publication });
    } catch (error) {
        console.error('Update publication error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Publication not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update volunteer work
 * PUT /api/portfolio-content/volunteer/:id
 */
router.put('/volunteer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const volunteer = await prisma.volunteerWork.update({
            where: { id },
            data: {
                role: data.role || data.title,
                organization: data.organization,
                location: data.location,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                isCurrent: data.isCurrent,
                description: data.description,
                impact: data.impact,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: volunteer });
    } catch (error) {
        console.error('Update volunteer work error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Volunteer work not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Update leadership
 * PUT /api/portfolio-content/leadership/:id
 */
router.put('/leadership/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const leadership = await prisma.leadership.update({
            where: { id },
            data: {
                title: data.title,
                organization: data.organization || data.company,
                location: data.location,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                isCurrent: data.isCurrent,
                description: data.description,
                achievements: data.achievements,
                updatedAt: new Date(),
            },
        });

        res.json({ success: true, data: leadership });
    } catch (error) {
        console.error('Update leadership error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Leadership not found' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
