const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Configure multer for memory storage (we'll upload to assets server)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Get all resumes with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            targetType,
            isActive,
            includeUnpublished,
            includeDrafts,
            sortBy = 'uploadedAt',
            sortOrder = 'desc',
            featuredFirst = true,
            limit,
            skip
        } = queryBuilder.parseQueryParams(req.query);

        // Build where clause
        const where = {
            ...queryBuilder.buildWhereClause({
                featured,
                includeUnpublished,
                includeDrafts
            }),
        };

        // Add targetType filter
        if (targetType) {
            where.targetType = targetType;
        }

        // Add isActive filter
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        // Build order
        const orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, featuredFirst);

        const resumes = await prisma.resume.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        // Parse JSON fields
        const jsonFields = ['keywords'];
        const parsedResumes = resumes.map(resume =>
            queryBuilder.parseJsonFields(resume, jsonFields)
        );

        res.json({
            success: true,
            count: resumes.length,
            data: parsedResumes,
            filters: {
                targetType,
                isActive,
                featured: featured || false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// View resume as HTML/PDF in browser
router.get('/:id/view-pdf', async (req, res) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Create HTML version of resume for viewing
        const htmlContent = createLegacyResumeHtml(resume);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(htmlContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download resume as PDF
router.get('/:id/download-pdf', async (req, res) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Increment downloads count
        await prisma.resume.update({
            where: { id: req.params.id },
            data: { downloads: { increment: 1 } }
        });

        // Create HTML version and serve
        const htmlContent = createLegacyResumeHtml(resume);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resume.title.replace(/\s+/g, '-')}.pdf"`);
        res.send(htmlContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function to create HTML for legacy resumes
function createLegacyResumeHtml(resume) {
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
        
        .info {
            text-align: center;
            font-size: 11px;
            margin-bottom: 15px;
            line-height: 1.3;
            color: #555;
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
        
        p {
            font-size: 10px;
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        .entry {
            margin-bottom: 8px;
        }
        
        .meta {
            font-size: 9px;
            text-align: right;
            margin-top: 20px;
            color: #999;
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
        <h1>Enoch Kwateh Dongbo</h1>
        <div class="info">
            📧 ekd@ekddigital.com | 📍 China | 🔗 ekdportfolio.ekddigital.com
            <br/>
            🐙 github.com/ekddigital | github.com/hetawk
        </div>
        
        <h2>${resume.targetType || 'Professional'} Resume</h2>
        <p class="entry">${resume.description || ''}</p>
        
        ${resume.targetRole ? `<p><strong>Target Role:</strong> ${resume.targetRole}</p>` : ''}
        ${resume.targetIndustry ? `<p><strong>Target Industry:</strong> ${resume.targetIndustry}</p>` : ''}
        
        <div class="meta">
            Generated resume template: <strong>${resume.title}</strong>
            <br/>View more at ekdportfolio.ekddigital.com
        </div>
    </div>
</body>
</html>
    `;
}

// Get single resume by ID
router.get('/:id', async (req, res) => {
    try {
        const { incrementViews } = req.query;

        const resume = await prisma.resume.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Increment views if requested
        if (incrementViews === 'true') {
            await queryBuilder.incrementField(prisma, 'resume', req.params.id, 'views');
            resume.views += 1;
        }

        // Parse JSON fields
        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload new resume
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { title, description, isActive } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Upload file to EKD Digital Assets
        console.log('📤 Uploading resume to assets server...');
        const uploadResult = await assetUploader.uploadResume(req.file.buffer, req.file.originalname);

        console.log('✅ Resume uploaded successfully:', uploadResult.fileUrl);

        // If this resume is set as active, deactivate all others
        if (isActive === 'true' || isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        // Create resume record with assets server URL
        const resume = await prisma.resume.create({
            data: {
                title,
                description: description || '',
                fileUrl: uploadResult.fileUrl,
                fileName: req.file.originalname,
                isActive: isActive === 'true' || isActive === true
            }
        });

        res.status(201).json({
            success: true,
            data: resume,
            asset: {
                url: uploadResult.fileUrl,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Resume upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create resume (without file upload)
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // If this resume is set as active, deactivate all others
        if (data.isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        // Serialize JSON fields
        const jsonFields = ['keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const resume = await prisma.resume.create({
            data: serializedData
        });

        // Parse for response
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update resume (mark as active/inactive)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, title, description } = req.body;

        // If setting this as active, deactivate all others
        if (isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        const resume = await prisma.resume.update({
            where: { id },
            data: updateData
        });

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

// Full update resume (PUT)
router.put('/:id', async (req, res) => {
    try {
        const data = req.body;

        // If setting this as active, deactivate all others
        if (data.isActive === true) {
            await prisma.resume.updateMany({
                where: {
                    isActive: true,
                    NOT: { id: req.params.id }
                },
                data: { isActive: false }
            });
        }

        // Serialize JSON fields
        const jsonFields = ['keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const resume = await prisma.resume.update({
            where: { id: req.params.id },
            data: serializedData
        });

        // Parse for response
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete resume
router.delete('/:id', async (req, res) => {
    try {
        await queryBuilder.softDelete(prisma, 'resume', req.params.id);

        res.json({
            success: true,
            message: 'Resume archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore deleted resume
router.post('/:id/restore', async (req, res) => {
    try {
        const resume = await queryBuilder.restoreDeleted(prisma, 'resume', req.params.id);

        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            message: 'Resume restored successfully',
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle featured status
router.post('/:id/toggle-featured', async (req, res) => {
    try {
        const resume = await queryBuilder.toggleFeatured(prisma, 'resume', req.params.id);

        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            message: `Resume ${resume.isFeatured ? 'featured' : 'unfeatured'}`,
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle published status
router.post('/:id/toggle-published', async (req, res) => {
    try {
        const resume = await queryBuilder.togglePublished(prisma, 'resume', req.params.id);

        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            message: `Resume ${resume.isPublished ? 'published' : 'unpublished'}`,
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Set resume as active (only one can be active at a time)
router.post('/:id/set-active', async (req, res) => {
    try {
        // Deactivate all others
        await prisma.resume.updateMany({
            where: {
                isActive: true,
                NOT: { id: req.params.id }
            },
            data: { isActive: false }
        });

        // Activate this one
        const resume = await prisma.resume.update({
            where: { id: req.params.id },
            data: { isActive: true }
        });

        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            message: 'Resume set as active',
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Track resume download
router.post('/:id/download', async (req, res) => {
    try {
        await queryBuilder.incrementField(prisma, 'resume', req.params.id, 'downloads');

        res.json({
            success: true,
            message: 'Download tracked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update display order (batch)
router.post('/reorder', async (req, res) => {
    try {
        const { items } = req.body; // [{ id, displayOrder }, ...]

        await queryBuilder.updateDisplayOrder(prisma, 'resume', items);

        res.json({
            success: true,
            message: 'Display order updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get active resume (for public download)
router.get('/active/current', async (req, res) => {
    try {
        const resume = await prisma.resume.findFirst({
            where: {
                isActive: true,
                isPublished: true,
                deletedAt: null
            }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'No active resume found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['keywords'];
        const parsedResume = queryBuilder.parseJsonFields(resume, jsonFields);

        res.json({
            success: true,
            data: parsedResume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get resume statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            total,
            published,
            featured,
            active,
            totalDownloads,
            totalViews,
            byTargetType
        ] = await Promise.all([
            prisma.resume.count({
                where: { deletedAt: null }
            }),
            prisma.resume.count({
                where: {
                    deletedAt: null,
                    isPublished: true
                }
            }),
            prisma.resume.count({
                where: {
                    deletedAt: null,
                    isPublished: true,
                    isFeatured: true
                }
            }),
            prisma.resume.count({
                where: {
                    deletedAt: null,
                    isActive: true
                }
            }),
            prisma.resume.aggregate({
                where: { deletedAt: null },
                _sum: { downloads: true }
            }),
            prisma.resume.aggregate({
                where: { deletedAt: null },
                _sum: { views: true }
            }),
            prisma.resume.groupBy({
                by: ['targetType'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            })
        ]);

        // Group by target type
        const targetTypeCounts = {};
        byTargetType.forEach(group => {
            targetTypeCounts[group.targetType || 'General'] = group._count;
        });

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                active,
                drafts: total - published,
                totalDownloads: totalDownloads._sum.downloads || 0,
                totalViews: totalViews._sum.views || 0,
                byTargetType: targetTypeCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
