const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Configure multer for memory storage
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

// Get all works with advanced filtering
// Query params:
// - featured=true: Get only featured works
// - category=Research: Filter by category
// - includeUnpublished=true: Include unpublished (for admin)
// - sortBy=displayOrder: Sort field (displayOrder, createdAt, views, title)
// - sortOrder=asc: Sort direction
// - limit=10: Limit results
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);
        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy,
            queryOptions.sortOrder,
            queryOptions.featuredFirst
        );

        const findOptions = {
            where,
            orderBy
        };

        if (queryOptions.limit) {
            findOptions.take = queryOptions.limit;
        }

        if (queryOptions.skip) {
            findOptions.skip = queryOptions.skip;
        }

        const works = await prisma.work.findMany(findOptions);

        // Parse JSON fields
        const jsonFields = ['tags', 'techStack', 'keywords'];
        const worksWithParsedFields = works.map(work =>
            queryBuilder.parseJsonFields(work, jsonFields)
        );

        res.json({
            success: true,
            count: works.length,
            data: worksWithParsedFields,
            filters: {
                category: queryOptions.category,
                featured: queryOptions.featuredOnly,
                published: !queryOptions.includeUnpublished
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single work by ID or slug
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { incrementViews } = req.query;

        // Try to find by ID first, then by slug
        let work = await prisma.work.findUnique({
            where: { id }
        });

        if (!work) {
            work = await prisma.work.findUnique({
                where: { slug: id }
            });
        }

        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Work not found'
            });
        }

        // Increment views if requested (for public viewing)
        if (incrementViews === 'true') {
            await queryBuilder.incrementField(prisma, 'work', work.id, 'views');
            work.views = (work.views || 0) + 1;
        }

        // Parse JSON fields
        const jsonFields = ['tags', 'techStack', 'keywords'];
        const workWithParsedFields = queryBuilder.parseJsonFields(work, jsonFields);

        res.json({
            success: true,
            data: workWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get works by tag
router.get('/tag/:tag', async (req, res) => {
    try {
        const works = await prisma.work.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const filteredWorks = works
            .map(work => ({
                ...work,
                tags: work.tags ? JSON.parse(work.tags) : []
            }))
            .filter(work => work.tags.includes(req.params.tag));

        res.json({
            success: true,
            count: filteredWorks.length,
            data: filteredWorks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload image for work
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        console.log('📤 Uploading work image to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Work image uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                imgUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Work image upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new work
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['tags', 'techStack', 'keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const work = await prisma.work.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(work, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update work
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['tags', 'techStack', 'keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const work = await prisma.work.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(work, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete work
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const work = await queryBuilder.softDelete(prisma, 'work', id);

        res.json({
            success: true,
            message: 'Work archived successfully',
            data: work
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted work
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const work = await queryBuilder.restoreDeleted(prisma, 'work', id);

        res.json({
            success: true,
            message: 'Work restored successfully',
            data: work
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
        const work = await queryBuilder.toggleFeatured(prisma, 'work', id);

        res.json({
            success: true,
            message: `Work ${work.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: work
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
        const work = await queryBuilder.togglePublished(prisma, 'work', id);

        res.json({
            success: true,
            message: `Work ${work.isPublished ? 'published' : 'unpublished'} successfully`,
            data: work
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Increment likes
router.post('/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        await queryBuilder.incrementField(prisma, 'work', id, 'likes');

        const work = await prisma.work.findUnique({ where: { id } });

        res.json({
            success: true,
            message: 'Work liked successfully',
            data: { likes: work.likes }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update display order for multiple works
router.post('/reorder', async (req, res) => {
    try {
        const { items } = req.body; // [{id, displayOrder}, ...]

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items must be an array of {id, displayOrder} objects'
            });
        }

        await queryBuilder.updateDisplayOrder(prisma, 'work', items);

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

// Get work statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            total,
            published,
            featured,
            drafts,
            byCategory
        ] = await Promise.all([
            prisma.work.count({ where: { deletedAt: null } }),
            prisma.work.count({ where: { isPublished: true, deletedAt: null } }),
            prisma.work.count({ where: { isFeatured: true, deletedAt: null } }),
            prisma.work.count({ where: { isDraft: true, deletedAt: null } }),
            prisma.work.groupBy({
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
                drafts,
                unpublished: total - published,
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
