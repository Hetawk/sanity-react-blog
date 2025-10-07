const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Configure multer for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all testimonials with filtering
// Query params:
// - featured=true: Get only featured testimonials
// - category=Technical: Filter by category
// - relationship=Supervisor: Filter by relationship type
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);

        // Add relationship filter if provided
        if (req.query.relationship) {
            where.relationship = req.query.relationship;
        }

        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy,
            queryOptions.sortOrder,
            queryOptions.featuredFirst
        );

        const testimonials = await prisma.testimonial.findMany({
            where,
            orderBy
        });

        res.json({
            success: true,
            count: testimonials.length,
            data: testimonials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single testimonial by ID
router.get('/:id', async (req, res) => {
    try {
        const testimonial = await prisma.testimonial.findUnique({
            where: { id: req.params.id }
        });

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: 'Testimonial not found'
            });
        }

        res.json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload avatar for testimonial
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No avatar file uploaded'
            });
        }

        console.log('📤 Uploading testimonial avatar to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Avatar uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                avatar: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Avatar upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload company logo for testimonial
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No logo file uploaded'
            });
        }

        console.log('📤 Uploading company logo to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Logo uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                companyLogo: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Logo upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new testimonial
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Validation
        if (!data.name || !data.testimonial) {
            return res.status(400).json({
                success: false,
                error: 'Name and testimonial are required'
            });
        }

        const testimonial = await prisma.testimonial.create({
            data
        });

        res.status(201).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update testimonial
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data
        });

        res.json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete testimonial
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await queryBuilder.softDelete(prisma, 'testimonial', id);

        res.json({
            success: true,
            message: 'Testimonial archived successfully',
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted testimonial
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await queryBuilder.restoreDeleted(prisma, 'testimonial', id);

        res.json({
            success: true,
            message: 'Testimonial restored successfully',
            data: testimonial
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
        const { id } = req.params;
        const testimonial = await queryBuilder.toggleFeatured(prisma, 'testimonial', id);

        res.json({
            success: true,
            message: `Testimonial ${testimonial.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: testimonial
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
        const { id } = req.params;
        const testimonial = await queryBuilder.togglePublished(prisma, 'testimonial', id);

        res.json({
            success: true,
            message: `Testimonial ${testimonial.isPublished ? 'published' : 'unpublished'} successfully`,
            data: testimonial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update display order
router.post('/reorder', async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items must be an array of {id, displayOrder} objects'
            });
        }

        await queryBuilder.updateDisplayOrder(prisma, 'testimonial', items);

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

// Get testimonial statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            total,
            published,
            featured,
            byCategory,
            byRelationship
        ] = await Promise.all([
            prisma.testimonial.count({ where: { deletedAt: null } }),
            prisma.testimonial.count({ where: { isPublished: true, deletedAt: null } }),
            prisma.testimonial.count({ where: { isFeatured: true, deletedAt: null } }),
            prisma.testimonial.groupBy({
                by: ['category'],
                where: { deletedAt: null, category: { not: null } },
                _count: true
            }),
            prisma.testimonial.groupBy({
                by: ['relationship'],
                where: { deletedAt: null, relationship: { not: null } },
                _count: true
            })
        ]);

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item.category] = item._count;
                    return acc;
                }, {}),
                byRelationship: byRelationship.reduce((acc, item) => {
                    acc[item.relationship] = item._count;
                    return acc;
                }, {})
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
