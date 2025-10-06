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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all leadership items with filtering
// Query params:
// - featured=true: Get only featured items
// - category=Entrepreneurship: Filter by category
// - isCurrent=true: Filter current positions
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);

        // Add isCurrent filter if provided
        if (req.query.isCurrent === 'true') {
            where.isCurrent = true;
        }

        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy || 'startDate',
            queryOptions.sortOrder || 'desc',
            queryOptions.featuredFirst
        );

        const leadership = await prisma.leadership.findMany({
            where,
            orderBy
        });

        // Parse JSON fields
        const jsonFields = ['impact', 'achievements', 'challenges', 'learnings'];
        const leadershipWithParsedFields = leadership.map(item =>
            queryBuilder.parseJsonFields(item, jsonFields)
        );

        res.json({
            success: true,
            count: leadership.length,
            data: leadershipWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single leadership item by ID
router.get('/:id', async (req, res) => {
    try {
        const leadership = await prisma.leadership.findUnique({
            where: { id: req.params.id }
        });

        if (!leadership) {
            return res.status(404).json({
                success: false,
                error: 'Leadership item not found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['impact', 'achievements', 'challenges', 'learnings'];
        const leadershipWithParsedFields = queryBuilder.parseJsonFields(leadership, jsonFields);

        res.json({
            success: true,
            data: leadershipWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload image for leadership
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        console.log('📤 Uploading leadership image to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Image uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                imgUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Image upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload logo for leadership
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No logo file uploaded'
            });
        }

        console.log('📤 Uploading leadership logo to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Logo uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                logoUrl: uploadResult.fileUrl,
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

// Create new leadership item
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Validation
        if (!data.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Serialize JSON fields
        const jsonFields = ['impact', 'achievements', 'challenges', 'learnings'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const leadership = await prisma.leadership.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(leadership, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update leadership item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['impact', 'achievements', 'challenges', 'learnings'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const leadership = await prisma.leadership.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(leadership, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete leadership item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const leadership = await queryBuilder.softDelete(prisma, 'leadership', id);

        res.json({
            success: true,
            message: 'Leadership item archived successfully',
            data: leadership
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted leadership item
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const leadership = await queryBuilder.restoreDeleted(prisma, 'leadership', id);

        res.json({
            success: true,
            message: 'Leadership item restored successfully',
            data: leadership
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
        const leadership = await queryBuilder.toggleFeatured(prisma, 'leadership', id);

        res.json({
            success: true,
            message: `Leadership item ${leadership.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: leadership
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
        const leadership = await queryBuilder.togglePublished(prisma, 'leadership', id);

        res.json({
            success: true,
            message: `Leadership item ${leadership.isPublished ? 'published' : 'unpublished'} successfully`,
            data: leadership
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

        await queryBuilder.updateDisplayOrder(prisma, 'leadership', items);

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

// Get leadership statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            total,
            published,
            featured,
            current,
            byCategory
        ] = await Promise.all([
            prisma.leadership.count({ where: { deletedAt: null } }),
            prisma.leadership.count({ where: { isPublished: true, deletedAt: null } }),
            prisma.leadership.count({ where: { isFeatured: true, deletedAt: null } }),
            prisma.leadership.count({ where: { isCurrent: true, deletedAt: null } }),
            prisma.leadership.groupBy({
                by: ['category'],
                where: { deletedAt: null, category: { not: null } },
                _count: true
            })
        ]);

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                current,
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item.category] = item._count;
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
