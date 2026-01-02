const express = require('express');
const router = express.Router();
const resumeService = require('../services/resumeService');

const {
    PrismaClient
}

    = require('@prisma/client');

const prisma = new PrismaClient();

// ==================== COUNTRIES ====================

/**
 * GET /api/resume-countries
 * Get all resume countries
 */
router.get('/countries', async (req, res) => {
    try {
        const {
            activeOnly
        }

            = req.query;
        const countries = await resumeService.getAllCountries(activeOnly === 'true');

        res.json({
            success: true,
            data: countries,
            count: countries.length
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
            }

            );
        }

        res.json({
            success: true,
            data: country
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * PUT /api/resume-countries/:id
 * Update country
 */
router.put('/countries/:id', async (req, res) => {
    try {
        const country = await prisma.resumeCountry.update({
            where: {
                id: req.params.id
            }

            ,
            data: req.body
        }

        );

        res.json({
            success: true,
            message: 'Country updated successfully',
            data: country
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
            }

            );
        }

        res.json({
            success: true,
            data: template
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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

        // Check if this is a download request (auto-trigger print)
        const autoDownload = req.query.download === 'true';

        // Create HTML version of resume for viewing
        const htmlContent = createResumeHtmlFromData(resume, autoDownload);

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
 * Download resume as actual PDF using Puppeteer
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

        // Generate HTML content (without toolbar for PDF)
        const htmlContent = createResumeHtmlFromData(resume, false, true); // forPdf = true

        // Use Puppeteer to generate PDF
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
        });

        await browser.close();

        // Send PDF
        const filename = resume.title.replace(/\s+/g, '-') + '.pdf';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Helper function to create HTML from resume data
 * @param {Object} resume - Resume data from database
 * @param {boolean} autoDownload - If true, auto-trigger print dialog on load
 * @param {boolean} forPdf - If true, skip toolbar for PDF generation
 */
function createResumeHtmlFromData(resume, autoDownload = false, forPdf = false) {
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
    const references = parseJson(resume.references) || [];

    // Helper to clean URLs - handles corrupted data with spaces
    const cleanUrl = (url) => {
        if (!url) return '';
        // Remove any existing protocol and spaces, then normalize
        return url.replace(/^https?:\s*\/\//, '').replace(/^https?:\/\//, '').trim();
    };

    // Helper to format dates consistently
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Handle ISO dates like "2022-01-01T00:00:00.000Z"
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
        }
        // Handle dates with dashes like "2022-01-01"
        if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.length > 7) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
        }
        // Return as-is for year-only or pre-formatted dates
        return dateStr;
    };
    // Auto-print script if download was requested
    const autoDownloadScript = autoDownload ? `
    <script>
        window.onload = function() {
            // Small delay to ensure page is fully rendered
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resume.title} - Enoch Kwateh Dongbo</title>${autoDownloadScript}
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            line-height: 1.5;
            /* A4 page visualization */
            min-height: 11in;
            position: relative;
        }
        /* Visual page break indicators for A4 */
        .container::after {
            content: '';
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: repeating-linear-gradient(90deg, #ccc, #ccc 5px, transparent 5px, transparent 10px);
            pointer-events: none;
        }
        .page-marker {
            position: relative;
        }
        .page-marker::before {
            content: '--- Page Break ---';
            display: block;
            text-align: center;
            color: #999;
            font-size: 10px;
            padding: 5px 0;
            border-top: 1px dashed #ccc;
            margin: 10px 0;
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
        ul { margin-left: 20px; margin-bottom: 8px; }
        li { font-size: 10px; margin-bottom: 3px; line-height: 1.3; }
        .section { margin-bottom: 10px; }
        .entry { margin-bottom: 8px; }
        .entry-title { font-weight: bold; font-size: 10px; }
        .entry-subtitle { font-size: 9px; color: #666; margin-bottom: 2px; }
        .entry-description { font-size: 10px; margin-bottom: 3px; line-height: 1.3; }
        strong { font-weight: bold; }
        em { font-style: italic; }
        a { color: #0066cc; text-decoration: none; }
        /* Page break control for multi-page resumes */
        .section { page-break-inside: auto; }
        .entry { page-break-inside: avoid; break-inside: avoid; }
        h2 { page-break-after: avoid; break-after: avoid; }
        .page-break { page-break-before: always; break-before: page; }
        @media print {
            @page { size: A4; margin: 15mm 20mm; }
            body { padding: 0; background: white; }
            .container { box-shadow: none; max-width: 100%; margin: 0; min-height: auto; }
            .container::after { display: none; }
            .page-marker::before { display: none; }
            .section { page-break-inside: auto; }
            .entry { page-break-inside: avoid; break-inside: avoid; }
            h2 { page-break-after: avoid; break-after: avoid; orphans: 3; widows: 3; }
            .download-toolbar { display: none; }
        }
        /* Download toolbar - only visible on screen */
        .download-toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        .download-toolbar h3 {
            color: white;
            font-size: 14px;
            margin: 0;
        }
        .toolbar-buttons {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .toolbar-hint {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            margin-left: 10px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #4CAF50;
            color: white;
        }
        .btn-primary:hover {
            background: #45a049;
        }
        .btn-secondary {
            background: #2196F3;
            color: white;
        }
        .btn-secondary:hover {
            background: #1976D2;
        }
        body.has-toolbar {
            padding-top: 70px;
        }
    </style>
</head>
<body${forPdf ? '' : ' class="has-toolbar"'}>
    ${forPdf ? '' : `<div class="download-toolbar">
        <h3>📄 ${resume.title}</h3>
        <div class="toolbar-buttons">
            <button class="btn btn-secondary" onclick="window.print();">🖨️ Print</button>
            <a href="/api/resumes-v2/${resume.id}/download-pdf" class="btn btn-primary">⬇️ Download PDF</a>
        </div>
    </div>`}
    <div class="container">
        <h1>${resume.fullName || 'Enoch Kwateh Dongbo'}</h1>
        <div class="contact-info">
            ${resume.email ? `📧 ${resume.email}` : ''}
            ${resume.phone ? `| 📞 ${resume.phone}` : ''}
            ${resume.location ? `| 📍 ${resume.location}` : ''}
            <br/>
            ${resume.portfolioUrl ? (() => {
            const url = cleanUrl(resume.portfolioUrl);
            return `🔗 <a href="https://${url}">${url}</a>`;
        })() : ''}
            ${resume.githubUrl ? (() => {
            const url = cleanUrl(resume.githubUrl);
            return `| 🐙 <a href="https://${url}">${url}</a>`;
        })() : ''}
            ${resume.githubPersonalUrl ? (() => {
            const url = cleanUrl(resume.githubPersonalUrl);
            return `| 🐙 <a href="https://${url}">${url}</a>`;
        })() : ''}
            ${resume.orcidUrl ? (() => {
            const url = cleanUrl(resume.orcidUrl);
            const orcidId = url.replace('orcid.org/', '');
            return `| 🔬 <a href="https://${url}">ORCID: ${orcidId}</a>`;
        })() : ''}
        </div>
        ${resume.summary ? `<h2>Professional Summary</h2><p>${resume.summary}</p>` : ''}
        ${experience && experience.length > 0
            ? `<h2>Work Experience</h2><div class="section">${experience.filter(exp => {
                // Filter out entries with no meaningful content
                const hasPosition = exp.position || exp.role || exp.title;
                const hasCompany = exp.company || exp.organization;
                const hasDescription = exp.description;
                return hasPosition || hasCompany || hasDescription;
            }).map(exp => {
                // Handle both experience and leadership field schemas
                const position = exp.position || exp.role || exp.title || '';
                const company = exp.company || exp.organization || '';
                // Use the global formatDate function
                let dateDisplay = '';
                if (exp.period) {
                    dateDisplay = exp.period;
                } else if (exp.startDate) {
                    const start = formatDate(exp.startDate);
                    const end = exp.endDate ? formatDate(exp.endDate) : (exp.currentlyWorking || exp.isCurrent ? 'Present' : '');
                    dateDisplay = start + (end ? ` - ${end}` : '');
                }
                return `
                <div class="entry">
                    <div class="entry-title">${position}${company ? ` at ${company}` : ''}</div>
                    ${dateDisplay ? `<div class="entry-subtitle">${dateDisplay}</div>` : ''}
                    ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
                </div>`;
            }).join('')}</div>`
            : ''}
        ${education && education.length > 0 ? `<h2>Education</h2><div class="section">${education.filter(edu => {
                // Filter out entries with no meaningful content
                const hasDegree = edu.degree || edu.title;
                const hasInstitution = edu.institution || edu.school || edu.organization;
                return hasDegree || hasInstitution;
            }).map(edu => {
                const degree = edu.degree || edu.title || '';
                const field = edu.field || edu.major || '';
                const institution = edu.institution || edu.school || edu.organization || '';
                // Use global formatDate function
                let dateDisplay = '';
                if (edu.period) {
                    dateDisplay = edu.period;
                } else if (edu.graduationYear) {
                    dateDisplay = edu.graduationYear;
                } else if (edu.startDate) {
                    const start = formatDate(edu.startDate);
                    const end = edu.endDate ? formatDate(edu.endDate) : (edu.isCurrent ? 'Present' : '');
                    dateDisplay = start + (end ? ` - ${end}` : '');
                }
                return `
            <div class="entry">
                <div class="entry-title">${degree}${field ? ` in ${field}` : ''}</div>
                <div class="entry-subtitle">${institution}</div>
                ${dateDisplay ? `<div class="entry-subtitle">${dateDisplay}</div>` : ''}
                ${edu.location ? `<div class="entry-subtitle">${edu.location}</div>` : ''}
                ${edu.description ? `<div class="entry-description">${edu.description}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${skills && skills.length > 0 ? `<h2>Skills</h2><div class="section"><ul>${skills.filter(skill => {
                const name = typeof skill === 'string' ? skill : (skill.name || skill.title || skill.skill);
                return name && name.trim();
            }).map(skill => {
                const name = typeof skill === 'string' ? skill : (skill.name || skill.title || skill.skill || '');
                return `<li>${name}</li>`;
            }).join('')}</ul></div>` : ''}
        ${certifications && certifications.length > 0 ? `<h2>Certifications</h2><div class="section">${certifications.filter(cert => {
                const hasName = cert.name || cert.title;
                return hasName;
            }).map(cert => {
                const name = cert.name || cert.title || '';
                const issuer = cert.issuer || cert.organization || '';
                const date = formatDate(cert.date || cert.issueDate || '');
                return `
            <div class="entry">
                <div class="entry-title">${name}</div>
                ${issuer || date ? `<div class="entry-subtitle">${issuer}${date ? ` - ${date}` : ''}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${languages && languages.length > 0 ? `<h2>Languages</h2><div class="section"><ul>${languages.filter(lang => {
                const name = typeof lang === 'string' ? lang : (lang.name || lang.language);
                return name && name.trim();
            }).map(lang => {
                const name = typeof lang === 'string' ? lang : (lang.name || lang.language || '');
                const level = typeof lang === 'string' ? '' : (lang.level || lang.proficiency || 'Fluent');
                return `<li>${name}${level ? `: ${level}` : ''}</li>`;
            }).join('')}</ul></div>` : ''}
        ${projects && projects.length > 0 ? `<h2>Projects</h2><div class="section">${projects.filter(proj => {
                const hasTitle = proj.name || proj.title;
                const hasDescription = proj.description;
                return hasTitle || hasDescription;
            }).map(proj => {
                const title = proj.name || proj.title || '';
                const role = proj.role || proj.position || '';
                const dateDisplay = proj.period || '';
                return `
            <div class="entry">
                <div class="entry-title">${title}${role ? ` - ${role}` : ''}</div>
                ${dateDisplay ? `<div class="entry-subtitle">${dateDisplay}</div>` : ''}
                ${proj.description ? `<div class="entry-description">${proj.description}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${publications && publications.length > 0 ? `<h2>Publications</h2><div class="section">${publications.filter(pub => {
                return pub.title;
            }).map(pub => {
                const venue = pub.venue || pub.publisher || pub.journal || '';
                const year = pub.year || '';
                const status = pub.status && pub.status !== 'Published' ? ` (${pub.status})` : '';
                return `
            <div class="entry">
                <div class="entry-title">${pub.title || ''}${status}</div>
                ${venue || year ? `<div class="entry-subtitle">${venue}${year ? ` - ${year}` : ''}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${awards && awards.length > 0 ? `<h2>Awards & Achievements</h2><div class="section">${awards.filter(award => {
                const hasTitle = award.title || award.name;
                return hasTitle;
            }).map(award => {
                const title = award.title || award.name || '';
                const awarder = award.awarder || award.issuer || award.organization || '';
                const date = formatDate(award.date || award.year || '');
                return `
            <div class="entry">
                <div class="entry-title">${title}</div>
                ${awarder || date ? `<div class="entry-subtitle">${awarder}${date ? ` - ${date}` : ''}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${volunteerWork && volunteerWork.length > 0 ? `<h2>Volunteer Work</h2><div class="section">${volunteerWork.filter(vol => {
                // Filter out entries with no meaningful content
                const hasRole = vol.position || vol.role || vol.title;
                const hasOrg = vol.organization || vol.company;
                const hasDescription = vol.description;
                return hasRole || hasOrg || hasDescription;
            }).map(vol => {
                const role = vol.position || vol.role || vol.title || '';
                const organization = vol.organization || vol.company || '';
                // Use global formatDate function
                let dateDisplay = '';
                if (vol.period) {
                    dateDisplay = vol.period;
                } else if (vol.startDate) {
                    const start = formatDate(vol.startDate);
                    const end = vol.endDate ? formatDate(vol.endDate) : (vol.currentlyVolunteering || vol.isCurrent ? 'Present' : '');
                    dateDisplay = start + (end ? ` - ${end}` : '');
                }
                return `
            <div class="entry">
                <div class="entry-title">${role}${organization ? ` at ${organization}` : ''}</div>
                ${dateDisplay ? `<div class="entry-subtitle">${dateDisplay}</div>` : ''}
                ${vol.description ? `<div class="entry-description">${vol.description}</div>` : ''}
            </div>`;
            }).join('')}</div>` : ''}
        ${references && references.length > 0 ? `<h2>References</h2><div class="section">${references.filter(ref => {
                // Filter out entries with no meaningful content
                return ref.name;
            }).map(ref => {
                const name = ref.name || '';
                const title = ref.title || ref.position || '';
                const organization = ref.organization || ref.company || '';
                const relationship = ref.relationship || '';
                const email = ref.email || '';
                const phone = ref.phone || '';
                return `
            <div class="entry">
                <div class="entry-title">${name}</div>
                ${title || organization ? `<div class="entry-subtitle">${title}${organization ? ` at ${organization}` : ''}</div>` : ''}
                ${relationship ? `<div class="entry-description"><em>${relationship}</em></div>` : ''}
                <div class="entry-description">
                    ${email ? `📧 ${email}` : ''}${phone ? ` | 📞 ${phone}` : ''}
                </div>
            </div>`;
            }).join('')}</div>` : ''}
    </div>
</body>
</html>`;
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
            }

            );
        }

        res.json({
            success: true,
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * GET /api/resumes-v2/public/:slug
 * Get resume by slug (public access)
 */
router.get('/public/:slug', async (req, res) => {
    try {
        const {
            password
        }

            = req.query;
        const resume = await resumeService.getResumeBySlug(req.params.slug);

        // Record view
        await resumeService.recordView(resume.id);

        res.json({
            success: true,
            data: resume
        }

        );
    }

    catch (error) {
        res.status(error.message.includes('not found') ? 404 : 403).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * GET /api/resumes-v2/share/:shareableLink
 * Get resume by shareable link
 */
router.get('/share/:shareableLink', async (req, res) => {
    try {
        const {
            password
        }

            = req.query;
        const resume = await resumeService.getResumeByShareableLink(req.params.shareableLink,
            password);

        // Record view
        await resumeService.recordView(resume.id);

        res.json({
            success: true,
            data: resume
        }

        );
    }

    catch (error) {
        res.status(error.message.includes('not found') || error.message.includes('Invalid password') ? 403 : 500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/clone
 * Clone/duplicate resume
 */
router.post('/:id/clone', async (req, res) => {
    try {
        const {
            newTitle
        }

            = req.body;
        const resume = await resumeService.cloneResume(req.params.id, newTitle);

        res.status(201).json({
            success: true,
            message: 'Resume cloned successfully',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/publish
 * Publish resume
 */
router.post('/:id/publish', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublished: true,
            publishedAt: new Date()
        }

        );

        res.json({
            success: true,
            message: 'Resume published successfully',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/unpublish
 * Unpublish resume
 */
router.post('/:id/unpublish', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublished: false
        }

        );

        res.json({
            success: true,
            message: 'Resume unpublished successfully',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/toggle-featured
 * Toggle featured status
 */
router.post('/:id/toggle-featured', async (req, res) => {
    try {
        const resume = await prisma.resumeContent.findUnique({
            where: {
                id: req.params.id
            }
        }

        );

        const updated = await resumeService.updateResume(req.params.id, {
            isFeatured: !resume.isFeatured
        }

        );

        res.json({

            success: true,
            message: `Resume $ {
                        updated.isFeatured ? 'featured' : 'unfeatured'
                    }

                    successfully`,
            data: updated
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/set-active
 * Set as active resume
 */
router.post('/:id/set-active', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isActive: true
        }

        );

        res.json({
            success: true,
            message: 'Resume set as active successfully',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/make-public
 * Make resume publicly accessible
 */
router.post('/:id/make-public', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublic: true
        }

        );

        res.json({
            success: true,
            message: 'Resume is now public',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

/**
 * POST /api/resumes-v2/:id/make-private
 * Make resume private
 */
router.post('/:id/make-private', async (req, res) => {
    try {
        const resume = await resumeService.updateResume(req.params.id, {
            isPublic: false
        }

        );

        res.json({
            success: true,
            message: 'Resume is now private',
            data: resume
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

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
        }

        );
    }

    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        }

        );
    }
}

);

module.exports = router;