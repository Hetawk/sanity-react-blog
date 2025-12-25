const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Get all experiences with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            category,
            isCurrent,
            includeUnpublished,
            includeDrafts,
            sortBy = 'year',
            sortOrder = 'desc',
            featuredFirst = true,
            limit,
            skip,
            startYear,
            endYear
        } = queryBuilder.parseQueryParams(req.query);

        // Build where clause
        const where = {
            ...queryBuilder.buildWhereClause({
                featuredOnly: featured,
                includeUnpublished,
                includeDrafts
            }),
        };

        // Add category filter
        if (category) {
            where.category = category;
        }

        // Add isCurrent filter
        if (isCurrent !== undefined) {
            where.isCurrent = isCurrent === 'true';
        }

        // Add year range filter
        if (startYear || endYear) {
            where.year = {};
            if (startYear) where.year.gte = startYear;
            if (endYear) where.year.lte = endYear;
        }

        // Build order
        const orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, featuredFirst);

        const experiences = await prisma.experience.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        // Parse JSON fields
        const jsonFields = ['works', 'achievements'];
        const parsedExperiences = experiences.map(exp =>
            queryBuilder.parseJsonFields(exp, jsonFields)
        );

        res.json({
            success: true,
            count: experiences.length,
            data: parsedExperiences,
            filters: {
                category,
                isCurrent,
                startYear,
                endYear,
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

// Get single experience by ID
router.get('/:id', async (req, res) => {
    try {
        const experience = await prisma.experience.findUnique({
            where: { id: req.params.id }
        });

        if (!experience) {
            return res.status(404).json({
                success: false,
                error: 'Experience not found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['works', 'achievements'];
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.json({
            success: true,
            data: parsedExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new experience
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['works', 'achievements'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const experience = await prisma.experience.create({
            data: serializedData
        });

        // Parse for response
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.status(201).json({
            success: true,
            message: 'Experience created successfully',
            data: parsedExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update experience
router.put('/:id', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['works', 'achievements'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const experience = await prisma.experience.update({
            where: { id: req.params.id },
            data: serializedData
        });

        // Parse for response
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.json({
            success: true,
            message: 'Experience updated successfully',
            data: parsedExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete experience
router.delete('/:id', async (req, res) => {
    try {
        await queryBuilder.softDelete(prisma, 'experience', req.params.id);

        res.json({
            success: true,
            message: 'Experience archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore deleted experience
router.post('/:id/restore', async (req, res) => {
    try {
        const experience = await queryBuilder.restoreDeleted(prisma, 'experience', req.params.id);

        const jsonFields = ['works', 'achievements'];
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.json({
            success: true,
            message: 'Experience restored successfully',
            data: parsedExperience
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
        const experience = await queryBuilder.toggleFeatured(prisma, 'experience', req.params.id);

        const jsonFields = ['works', 'achievements'];
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.json({
            success: true,
            message: `Experience ${experience.isFeatured ? 'featured' : 'unfeatured'}`,
            data: parsedExperience
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
        const experience = await queryBuilder.togglePublished(prisma, 'experience', req.params.id);

        const jsonFields = ['works', 'achievements'];
        const parsedExperience = queryBuilder.parseJsonFields(experience, jsonFields);

        res.json({
            success: true,
            message: `Experience ${experience.isPublished ? 'published' : 'unpublished'}`,
            data: parsedExperience
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

        await queryBuilder.updateDisplayOrder(prisma, 'experience', items);

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

// Get experience statistics and overview
router.get('/stats/overview', async (req, res) => {
    try {
        const [total, published, featured, current, byCategory] = await Promise.all([
            prisma.experience.count({
                where: { deletedAt: null }
            }),
            prisma.experience.count({
                where: {
                    deletedAt: null,
                    isPublished: true
                }
            }),
            prisma.experience.count({
                where: {
                    deletedAt: null,
                    isPublished: true,
                    isFeatured: true
                }
            }),
            prisma.experience.count({
                where: {
                    deletedAt: null,
                    isCurrent: true
                }
            }),
            prisma.experience.groupBy({
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
                current,
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

// Get experience timeline (grouped by year)
router.get('/timeline', async (req, res) => {
    try {
        const experiences = await prisma.experience.findMany({
            where: {
                deletedAt: null,
                isPublished: true
            },
            orderBy: { year: 'desc' }
        });

        // Parse JSON fields
        const jsonFields = ['works', 'achievements'];
        const parsed = experiences.map(exp =>
            queryBuilder.parseJsonFields(exp, jsonFields)
        );

        // Group by year
        const timeline = {};
        parsed.forEach(exp => {
            const year = exp.year;
            if (!timeline[year]) {
                timeline[year] = [];
            }
            timeline[year].push(exp);
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
