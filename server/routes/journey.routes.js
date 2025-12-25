const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Get all journey sections with filtering
// Query params:
// - featured=true: Get only featured sections
// - category=Education: Filter by category
// - partNumber=1: Filter by part number
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);

        // Add category filter if provided
        if (req.query.category) {
            where.category = req.query.category;
        }

        // Add partNumber filter if provided
        if (req.query.partNumber) {
            where.partNumber = parseInt(req.query.partNumber);
        }

        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy || 'partNumber',
            queryOptions.sortOrder || 'asc',
            queryOptions.featuredFirst
        );

        const sections = await prisma.journeySection.findMany({
            where,
            orderBy
        });

        res.json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single journey section by ID
router.get('/:id', async (req, res) => {
    try {
        const section = await prisma.journeySection.findUnique({
            where: { id: req.params.id }
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Journey section not found'
            });
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all unique categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await prisma.journeySection.findMany({
            where: {
                deletedAt: null,
                isPublished: true,
                category: { not: null }
            },
            select: { category: true },
            distinct: ['category']
        });

        res.json({
            success: true,
            data: categories.map(c => c.category)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create a new journey section
router.post('/', async (req, res) => {
    try {
        const {
            partNumber,
            title,
            subtitle,
            content,
            summary,
            organization,
            role,
            location,
            duration,
            category,
            icon,
            imgUrl,
            websiteUrl,
            isPublished = true,
            isFeatured = false,
            displayOrder = 0
        } = req.body;

        // Validate required fields
        if (!title || !partNumber) {
            return res.status(400).json({
                success: false,
                error: 'Title and partNumber are required'
            });
        }

        const section = await prisma.journeySection.create({
            data: {
                partNumber: parseInt(partNumber),
                title,
                subtitle,
                content,
                summary,
                organization,
                role,
                location,
                duration,
                category,
                icon,
                imgUrl,
                websiteUrl,
                isPublished,
                isFeatured,
                displayOrder: parseInt(displayOrder)
            }
        });

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update a journey section
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Convert numeric fields
        if (updateData.partNumber) {
            updateData.partNumber = parseInt(updateData.partNumber);
        }
        if (updateData.displayOrder !== undefined) {
            updateData.displayOrder = parseInt(updateData.displayOrder);
        }

        const section = await prisma.journeySection.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Journey section not found'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle published status
router.post('/:id/toggle-published', async (req, res) => {
    try {
        const section = await prisma.journeySection.findUnique({
            where: { id: req.params.id }
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Journey section not found'
            });
        }

        const updated = await prisma.journeySection.update({
            where: { id: req.params.id },
            data: { isPublished: !section.isPublished }
        });

        res.json({
            success: true,
            data: updated,
            message: `Section ${updated.isPublished ? 'published' : 'unpublished'}`
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
        const section = await prisma.journeySection.findUnique({
            where: { id: req.params.id }
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Journey section not found'
            });
        }

        const updated = await prisma.journeySection.update({
            where: { id: req.params.id },
            data: { isFeatured: !section.isFeatured }
        });

        res.json({
            success: true,
            data: updated,
            message: `Section ${updated.isFeatured ? 'featured' : 'unfeatured'}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete a journey section
router.delete('/:id', async (req, res) => {
    try {
        const section = await prisma.journeySection.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });

        res.json({
            success: true,
            message: 'Journey section deleted successfully',
            data: section
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Journey section not found'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Bulk import journey sections
router.post('/bulk-import', async (req, res) => {
    try {
        const { sections } = req.body;

        if (!Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'sections array is required'
            });
        }

        // Delete all existing sections first (optional, based on clearExisting flag)
        if (req.body.clearExisting) {
            await prisma.journeySection.deleteMany({});
        }

        const created = await prisma.journeySection.createMany({
            data: sections.map((s, index) => ({
                partNumber: s.partNumber || index + 1,
                title: s.title,
                subtitle: s.subtitle,
                content: s.content,
                summary: s.summary,
                organization: s.organization,
                role: s.role,
                location: s.location,
                duration: s.duration,
                category: s.category,
                icon: s.icon,
                imgUrl: s.imgUrl,
                websiteUrl: s.websiteUrl,
                isPublished: s.isPublished !== false,
                isFeatured: s.isFeatured || false,
                displayOrder: s.displayOrder || index
            }))
        });

        res.status(201).json({
            success: true,
            count: created.count,
            message: `Successfully imported ${created.count} journey sections`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
