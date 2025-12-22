const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');
const queryBuilder = require('../utils/queryBuilder');
const { handleMulterError, createUploadErrorResponse } = require('../utils/uploadErrorHandler');

const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit (multer catches before upload)
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'));
        }
    }
});

// Get all awards with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            category,
            level,
            year,
            includeUnpublished,
            includeDrafts,
            sortBy = 'year',
            sortOrder = 'desc',
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

        // Add level filter
        if (level) {
            where.level = level;
        }

        // Add year filter
        if (year) {
            where.year = parseInt(year);
        }

        // Build order - prioritize date over year for better sorting
        let orderBy = [];

        if (featuredFirst) {
            orderBy.push({ isFeatured: 'desc' });
        }

        if (sortBy === 'year' || sortBy === 'date') {
            // Sort by date first (if exists), then year, then displayOrder
            orderBy.push(
                { date: sortOrder },
                { year: sortOrder },
                { displayOrder: 'asc' }
            );
        } else {
            orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, featuredFirst);
        }

        const awards = await prisma.award.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        res.json({
            success: true,
            count: awards.length,
            data: awards,
            filters: {
                category,
                level,
                year,
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

// Get single award by ID
router.get('/:id', async (req, res) => {
    try {
        const award = await prisma.award.findUnique({
            where: { id: req.params.id }
        });

        if (!award) {
            return res.status(404).json({
                success: false,
                error: 'Award not found'
            });
        }

        res.json({
            success: true,
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload image for award
router.post('/upload-image', upload.single('image'), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded',
                message: 'Please select an image file to upload'
            });
        }

        console.log(`📤 Uploading award image to assets server... (${(req.file.size / 1024).toFixed(2)} KB)`);
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Award image uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                imgUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Award image upload error:', error);
        const errorResponse = createUploadErrorResponse(error, 'award image');
        res.status(errorResponse.status).json(errorResponse.json);
    }
});

// Upload issuer logo for award
router.post('/upload-logo', upload.single('logo'), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No logo file uploaded',
                message: 'Please select a logo file to upload'
            });
        }

        console.log(`📤 Uploading issuer logo to assets server... (${(req.file.size / 1024).toFixed(2)} KB)`);
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Issuer logo uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                issuerLogo: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Issuer logo upload error:', error);
        const errorResponse = createUploadErrorResponse(error, 'issuer logo');
        res.status(errorResponse.status).json(errorResponse.json);
    }
});

// Create new award
router.post('/', async (req, res) => {
    try {
        const award = await prisma.award.create({
            data: req.body
        });

        res.status(201).json({
            success: true,
            message: 'Award created successfully',
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update award
router.put('/:id', async (req, res) => {
    try {
        const award = await prisma.award.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json({
            success: true,
            message: 'Award updated successfully',
            data: award
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete award
router.delete('/:id', async (req, res) => {
    try {
        await queryBuilder.softDelete(prisma, 'award', req.params.id);

        res.json({
            success: true,
            message: 'Award archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore deleted award
router.post('/:id/restore', async (req, res) => {
    try {
        const award = await queryBuilder.restoreDeleted(prisma, 'award', req.params.id);

        res.json({
            success: true,
            message: 'Award restored successfully',
            data: award
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
        const award = await queryBuilder.toggleFeatured(prisma, 'award', req.params.id);

        res.json({
            success: true,
            message: `Award ${award.isFeatured ? 'featured' : 'unfeatured'}`,
            data: award
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
        const award = await queryBuilder.togglePublished(prisma, 'award', req.params.id);

        res.json({
            success: true,
            message: `Award ${award.isPublished ? 'published' : 'unpublished'}`,
            data: award
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

        await queryBuilder.updateDisplayOrder(prisma, 'award', items);

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

// Get award statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [total, published, featured, byCategory, byLevel, byYear] = await Promise.all([
            prisma.award.count({
                where: { deletedAt: null }
            }),
            prisma.award.count({
                where: {
                    deletedAt: null,
                    isPublished: true
                }
            }),
            prisma.award.count({
                where: {
                    deletedAt: null,
                    isPublished: true,
                    isFeatured: true
                }
            }),
            prisma.award.groupBy({
                by: ['category'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            }),
            prisma.award.groupBy({
                by: ['level'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            }),
            prisma.award.groupBy({
                by: ['year'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true,
                orderBy: { year: 'desc' }
            })
        ]);

        // Group by category
        const categoryCounts = {};
        byCategory.forEach(group => {
            categoryCounts[group.category || 'Uncategorized'] = group._count;
        });

        // Group by level
        const levelCounts = {};
        byLevel.forEach(group => {
            levelCounts[group.level || 'Uncategorized'] = group._count;
        });

        // Group by year
        const yearCounts = {};
        byYear.forEach(group => {
            yearCounts[group.year || 'Unknown'] = group._count;
        });

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                drafts: total - published,
                byCategory: categoryCounts,
                byLevel: levelCounts,
                byYear: yearCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get awards grouped by year (timeline)
router.get('/timeline', async (req, res) => {
    try {
        const awards = await prisma.award.findMany({
            where: {
                deletedAt: null,
                isPublished: true
            },
            orderBy: { year: 'desc' }
        });

        // Group by year
        const timeline = {};
        awards.forEach(award => {
            const year = award.year || 'Unknown';
            if (!timeline[year]) {
                timeline[year] = [];
            }
            timeline[year].push(award);
        });

        res.json({
            success: true,
            data: timeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
