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
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for logos
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all brands with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            category,
            relationship,
            includeUnpublished,
            includeDrafts,
            sortBy = 'displayOrder',
            sortOrder = 'asc',
            featuredFirst = true,
            limit,
            skip
        } = queryBuilder.parseQueryParams(req.query);

        // Build where clause
        const where = {
            ...queryBuilder.buildWhereClause({
                featured,
                category,
                includeUnpublished,
                includeDrafts
            }),
        };

        // Add relationship filter
        if (relationship) {
            where.relationship = { contains: relationship, mode: 'insensitive' };
        }

        // Build order
        const orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, featuredFirst);

        const brands = await prisma.brand.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        res.json({
            success: true,
            count: brands.length,
            data: brands,
            filters: {
                category,
                relationship,
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

// Get single brand by ID
router.get('/:id', async (req, res) => {
    try {
        const brand = await prisma.brand.findUnique({
            where: { id: req.params.id }
        });

        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found'
            });
        }

        res.json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload logo for brand
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No logo file uploaded'
            });
        }

        console.log('📤 Uploading brand logo to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Brand logo uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                imgUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Brand logo upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new brand
router.post('/', async (req, res) => {
    try {
        const brand = await prisma.brand.create({
            data: req.body
        });

        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update brand
router.put('/:id', async (req, res) => {
    try {
        const brand = await prisma.brand.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json({
            success: true,
            message: 'Brand updated successfully',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete brand
router.delete('/:id', async (req, res) => {
    try {
        await queryBuilder.softDelete(prisma, 'brand', req.params.id);

        res.json({
            success: true,
            message: 'Brand archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore deleted brand
router.post('/:id/restore', async (req, res) => {
    try {
        const brand = await queryBuilder.restoreDeleted(prisma, 'brand', req.params.id);

        res.json({
            success: true,
            message: 'Brand restored successfully',
            data: brand
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
        const brand = await queryBuilder.toggleFeatured(prisma, 'brand', req.params.id);

        res.json({
            success: true,
            message: `Brand ${brand.isFeatured ? 'featured' : 'unfeatured'}`,
            data: brand
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
        const brand = await queryBuilder.togglePublished(prisma, 'brand', req.params.id);

        res.json({
            success: true,
            message: `Brand ${brand.isPublished ? 'published' : 'unpublished'}`,
            data: brand
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

        await queryBuilder.updateDisplayOrder(prisma, 'brand', items);

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

// Get brand statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [total, published, featured, byCategory] = await Promise.all([
            prisma.brand.count({
                where: { deletedAt: null }
            }),
            prisma.brand.count({
                where: {
                    deletedAt: null,
                    isPublished: true
                }
            }),
            prisma.brand.count({
                where: {
                    deletedAt: null,
                    isPublished: true,
                    isFeatured: true
                }
            }),
            prisma.brand.groupBy({
                by: ['category'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            })
        ]);

        // Group by category
        const categoryCounts = {};
        byCategory.forEach(group => {
            categoryCounts[group.category || 'Uncategorized'] = group._count;
        });

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                drafts: total - published,
                byCategory: categoryCounts
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
