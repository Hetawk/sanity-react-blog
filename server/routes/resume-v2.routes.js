const express = require('express');
const router = express.Router();
const resumeService = require('../services/resumeService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ==================== COUNTRIES ====================

/**
 * GET /api/resume-countries
 * Get all resume countries
 */
router.get('/countries', async (req, res) => {
    try {
        const { activeOnly } = req.query;
        const countries = await resumeService.getAllCountries(activeOnly === 'true');

        res.json({
            success: true,
            data: countries,
            count: countries.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resume-countries/:code
 * Get single country by code
 */
router.get('/countries/:code', async (req, res) => {
    try {
        const country = await resumeService.getCountryByCode(req.params.code);

        if (!country) {
            return res.status(404).json({
                success: false,
                error: 'Country not found'
            });
        }

        res.json({
            success: true,
            data: country
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resume-countries
 * Create a new country
 */
router.post('/countries', async (req, res) => {
    try {
        const country = await resumeService.createCountry(req.body);

        res.status(201).json({
            success: true,
            message: 'Country created successfully',
            data: country
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/resume-countries/:id
 * Update country
 */
router.put('/countries/:id', async (req, res) => {
    try {
        const country = await prisma.resumeCountry.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json({
            success: true,
            message: 'Country updated successfully',
            data: country
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== RESUME TYPES ====================

/**
 * GET /api/resume-types
 * Get all resume types
 */
router.get('/types', async (req, res) => {
    try {
        const types = await resumeService.getAllResumeTypes();

        res.json({
            success: true,
            data: types,
            count: types.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resume-types
 * Create a new resume type
 */
router.post('/types', async (req, res) => {
    try {
        const type = await resumeService.createResumeType(req.body);

        res.status(201).json({
            success: true,
            message: 'Resume type created successfully',
            data: type
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== TEMPLATES ====================

/**
 * GET /api/resume-templates
 * Get all templates with filtering
 */
router.get('/templates', async (req, res) => {
    try {
        const result = await resumeService.getAllTemplates(req.query);

        res.json({
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resume-templates/:id
 * Get single template
 */
router.get('/templates/:id', async (req, res) => {
    try {
        const template = await resumeService.getTemplateById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resume-templates
 * Create a new template
 */
router.post('/templates', async (req, res) => {
    try {
        const template = await resumeService.createTemplate(req.body);

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /api/resume-templates/:id
 * Update template
 */
router.patch('/templates/:id', async (req, res) => {
    try {
        const template = await resumeService.updateTemplate(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Template updated successfully',
            data: template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/resume-templates/:id
 * Delete template
 */
router.delete('/templates/:id', async (req, res) => {
    try {
        await resumeService.deleteTemplate(req.params.id);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== RESUME CONTENT ====================

/**
 * GET /api/resumes-v2
 * Get all resumes with filtering
 */
router.get('/', async (req, res) => {
    try {
        const result = await resumeService.getAllResumes(req.query);

        res.json({
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resumes-v2/:id/view-pdf
 * View resume as HTML/PDF in browser
 */
router.get('/:id/view-pdf', async (req, res) => {
    try {
        const resume = await prisma.resumeContent.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Create HTML version of resume for viewing
        const htmlContent = createResumeHtmlFromData(resume);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resumes-v2/:id/download-pdf
 * Download resume as PDF
 */
router.get('/:id/download-pdf', async (req, res) => {
    try {
        const resume = await prisma.resumeContent.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Increment downloads count
        await prisma.resumeContent.update({
            where: { id: req.params.id },
            data: { downloads: { increment: 1 } }
        });

        // Create HTML version and serve as PDF
        const htmlContent = createResumeHtmlFromData(resume);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.title.replace(/\s+/g, '-')}.pdf"`);
        res.send(htmlContent); // In production, convert to PDF using puppeteer or similar
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Helper function to create HTML from resume data
 */
function createResumeHtmlFromData(resume) {
    // Parse JSON fields if they're strings
    const parseJson = (field) => {
        try {
            return typeof field === 'string' ? JSON.parse(field) : field;
        } catch (e) {
            return [];
        }
    };

    const experience = parseJson(resume.experience) || [];
    const education = parseJson(resume.education) || [];
    const skills = parseJson(resume.skills) || [];
    const certifications = parseJson(resume.certifications) || [];
    const languages = parseJson(resume.languages) || [];
    const projects = parseJson(resume.projects) || [];
    const publications = parseJson(resume.publications) || [];
    const awards = parseJson(resume.awards) || [];
    const volunteerWork = parseJson(resume.volunteerWork) || [];

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.title} - Enoch Kwateh Dongbo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            padding: 0.75in;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            line-height: 1.5;
        }
        
        h1 {
            font-size: 26px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            color: #1a1a1a;
        }
        
        .contact-info {
            text-align: center;
            font-size: 11px;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        h2 {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 12px;
            margin-bottom: 8px;
            padding-bottom: 3px;
            border-bottom: 2px solid #333;
            color: #1a1a1a;
        }
        
        h3 {
            font-size: 11px;
            font-weight: bold;
            margin-top: 6px;
            margin-bottom: 2px;
        }
        
        p {
            font-size: 10px;
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        ul {
            margin-left: 20px;
            margin-bottom: 8px;
        }
        
        li {
            font-size: 10px;
            margin-bottom: 3px;
            line-height: 1.3;
        }
        
        .section {
            margin-bottom: 10px;
        }
        
        .entry {
            margin-bottom: 8px;
        }
        
        .entry-title {
            font-weight: bold;
            font-size: 10px;
        }
        
        .entry-subtitle {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
        }
        
        .entry-description {
            font-size: 10px;
            margin-bottom: 3px;
            line-height: 1.3;
        }
        
        strong {
            font-weight: bold;
        }
        
        em {
            font-style: italic;
        }
        
        a {
            color: #0066cc;
            text-decoration: none;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
                max-width: 100%;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${resume.fullName || 'Enoch Kwateh Dongbo'}</h1>
        <div class="contact-info">
            ${resume.email ? `📧 ${resume.email}` : ''} 
            ${resume.phone ? `| 📞 ${resume.phone}` : ''}
            ${resume.location ? `| 📍 ${resume.location}` : ''}
            <br/>
            ${resume.portfolioUrl ? `🔗 <a href="https://${resume.portfolioUrl}">${resume.portfolioUrl}</a>` : ''}
            ${resume.githubUrl ? `| 🐙 <a href="https://${resume.githubUrl}">${resume.githubUrl}</a>` : ''}
            ${resume.githubPersonalUrl ? `| 🐙 <a href="https://${resume.githubPersonalUrl}">${resume.githubPersonalUrl}</a>` : ''}
            ${resume.orcidUrl ? `| 🔬 <a href="https://${resume.orcidUrl}">ORCID: ${resume.orcidUrl.replace('orcid.org/', '')}</a>` : ''}
        </div>
        
        ${resume.summary ? `
        <h2>Professional Summary</h2>
        <p>${resume.summary}</p>
        ` : ''}
        
        ${experience && experience.length > 0 && experience[0].description && experience[0].description.length > 100 ? `
        <h2>Resume Details</h2>
        <div class="section" style="white-space: pre-wrap; font-size: 9px; line-height: 1.2;">
            ${experience[0].description}
        </div>
        ` : experience && experience.length > 0 ? `
        <h2>Work Experience</h2>
        <div class="section">
            ${experience.map(exp => `
            <div class="entry">
                <div class="entry-title">${exp.position || ''} ${exp.company ? `at ${exp.company}` : ''}</div>
                <div class="entry-subtitle">${exp.startDate || ''} ${exp.endDate ? `- ${exp.endDate}` : exp.currentlyWorking ? '- Present' : ''}</div>
                ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${education && education.length > 0 ? `
        <h2>Education</h2>
        <div class="section">
            ${education.map(edu => `
            <div class="entry">
                <div class="entry-title">${edu.degree || ''} ${edu.field ? `in ${edu.field}` : ''}</div>
                <div class="entry-subtitle">${edu.institution || ''}</div>
                <div class="entry-subtitle">${edu.graduationYear || ''}</div>
                ${edu.description ? `<div class="entry-description">${edu.description}</div>` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${skills && skills.length > 0 ? `
        <h2>Skills</h2>
        <div class="section">
            <ul>
                ${skills.map(skill => `<li>${skill.name || skill}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${certifications && certifications.length > 0 ? `
        <h2>Certifications</h2>
        <div class="section">
            ${certifications.map(cert => `
            <div class="entry">
                <div class="entry-title">${cert.name || cert.title || ''}</div>
                <div class="entry-subtitle">${cert.issuer || ''} ${cert.date ? `- ${cert.date}` : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${languages && languages.length > 0 ? `
        <h2>Languages</h2>
        <div class="section">
            <ul>
                ${languages.map(lang => `<li>${lang.name || lang}: ${lang.level || 'Fluent'}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${projects && projects.length > 0 ? `
        <h2>Projects</h2>
        <div class="section">
            ${projects.map(proj => `
            <div class="entry">
                <div class="entry-title">${proj.name || proj.title || ''}</div>
                ${proj.description ? `<div class="entry-description">${proj.description}</div>` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${publications && publications.length > 0 ? `
        <h2>Publications</h2>
        <div class="section">
            ${publications.map(pub => `
            <div class="entry">
                <div class="entry-title">${pub.title || ''}</div>
                <div class="entry-subtitle">${pub.publisher || ''} ${pub.year ? `- ${pub.year}` : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${awards && awards.length > 0 ? `
        <h2>Awards & Achievements</h2>
        <div class="section">
            ${awards.map(award => `
            <div class="entry">
                <div class="entry-title">${award.title || award.name || ''}</div>
                <div class="entry-subtitle">${award.awarder || award.organization || ''} ${award.date ? `- ${award.date}` : ''}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${volunteerWork && volunteerWork.length > 0 ? `
        <h2>Volunteer Work</h2>
        <div class="section">
            ${volunteerWork.map(vol => `
            <div class="entry">
                <div class="entry-title">${vol.position || vol.role || ''} ${vol.organization ? `at ${vol.organization}` : ''}</div>
                <div class="entry-subtitle">${vol.startDate || ''} ${vol.endDate ? `- ${vol.endDate}` : vol.currentlyVolunteering ? '- Present' : ''}</div>
                ${vol.description ? `<div class="entry-description">${vol.description}</div>` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <p style="font-size: 9px; text-align: right; margin-top: 20px; color: #999;">
            Generated from resume template: ${resume.title}
        </p>
    </div>
</body>
</html>
    `;
}

/**
 * GET /api/resumes-v2/:id
 * Get single resume by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const resume = await resumeService.getResumeById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resumes-v2/public/:slug
 * Get resume by slug (public access)
 */
router.get('/public/:slug', async (req, res) => {
    try {
        const { password } = req.query;
        const resume = await resumeService.getResumeBySlug(req.params.slug);

        // Record view
        await resumeService.recordView(resume.id);

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 403).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resumes-v2/share/:shareableLink
 * Get resume by shareable link
 */
router.get('/share/:shareableLink', async (req, res) => {
    try {
        const { password } = req.query;
        const resume = await resumeService.getResumeByShareableLink(
            req.params.shareableLink,
            password
        );

        // Record view
        await resumeService.recordView(resume.id);

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(error.message.includes('not found') || error.message.includes('Invalid password') ? 403 : 500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2
 * Create a new resume
 */
router.post('/', async (req, res) => {
    try {
        const resume = await resumeService.createResume(req.body);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /api/resumes-v2/:id
 * Update resume
 */
router.patch('/:id', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/resumes-v2/:id
 * Full update resume
 */
router.put('/:id', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/resumes-v2/:id
 * Soft delete resume
 */
router.delete('/:id', async (req, res) => {
    try {
        await resumeService.deleteResume(req.params.id);

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/restore
 * Restore deleted resume
 */
router.post('/:id/restore', async (req, res) => {
    try {
        const resume = await resumeService.restoreResume(req.params.id);

        res.json({
            success: true,
            message: 'Resume restored successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/clone
 * Clone/duplicate resume
 */
router.post('/:id/clone', async (req, res) => {
    try {
        const { newTitle } = req.body;
        const resume = await resumeService.cloneResume(req.params.id, newTitle);

        res.status(201).json({
            success: true,
            message: 'Resume cloned successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/publish
 * Publish resume
 */
router.post('/:id/publish', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublished: true,
            publishedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Resume published successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/unpublish
 * Unpublish resume
 */
router.post('/:id/unpublish', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublished: false
        });

        res.json({
            success: true,
            message: 'Resume unpublished successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/toggle-featured
 * Toggle featured status
 */
router.post('/:id/toggle-featured', async (req, res) => {
    try {
        const resume = await prisma.resumeContent.findUnique({
            where: { id: req.params.id }
        });

        const updated = await resumeService.updateResume(req.params.id, {
            isFeatured: !resume.isFeatured
        });

        res.json({
            success: true,
            message: `Resume ${updated.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/set-active
 * Set as active resume
 */
router.post('/:id/set-active', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isActive: true
        });

        res.json({
            success: true,
            message: 'Resume set as active successfully',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/make-public
 * Make resume publicly accessible
 */
router.post('/:id/make-public', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublic: true
        });

        res.json({
            success: true,
            message: 'Resume is now public',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/make-private
 * Make resume private
 */
router.post('/:id/make-private', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublic: false
        });

        res.json({
            success: true,
            message: 'Resume is now private',
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/download
 * Record download
 */
router.post('/:id/download', async (req, res) => {
    try {
        await resumeService.recordDownload(req.params.id);

        res.json({
            success: true,
            message: 'Download recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/resumes-v2/:id/share
 * Record share
 */
router.post('/:id/share', async (req, res) => {
    try {
        await resumeService.recordShare(req.params.id);

        res.json({
            success: true,
            message: 'Share recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/resumes-v2/stats/overview
 * Get resume statistics
 */
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await resumeService.getResumeStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
