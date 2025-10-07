const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Get all work experiences with advanced filtering
router.get('/', async (req, res) => {
    try {
        const {
            featured,
            company,
            position,
            employmentType,
            isCurrent,
            includeUnpublished,
            includeDrafts,
            sortBy = 'startDate',
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

        // Add specific filters
        if (company) {
            where.company = { contains: company, mode: 'insensitive' };
        }

        if (position) {
            where.position = { contains: position, mode: 'insensitive' };
        }

        if (employmentType) {
            where.employmentType = employmentType;
        }

        if (isCurrent !== undefined) {
            where.isCurrent = isCurrent === 'true';
        }

        // Build order
        const orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, featuredFirst);

        const workExperiences = await prisma.workExperience.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        // Parse JSON fields
        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperiences = workExperiences.map(work =>
            queryBuilder.parseJsonFields(work, jsonFields)
        );

        res.json({
            success: true,
            count: workExperiences.length,
            data: parsedWorkExperiences,
            filters: {
                company,
                position,
                employmentType,
                isCurrent,
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

// Get single work experience by ID
router.get('/:id', async (req, res) => {
    try {
        const workExperience = await prisma.workExperience.findUnique({
            where: { id: req.params.id }
        });

        if (!workExperience) {
            return res.status(404).json({
                success: false,
                error: 'Work experience not found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.json({
            success: true,
            data: parsedWorkExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new work experience
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const workExperience = await prisma.workExperience.create({
            data: serializedData
        });

        // Parse for response
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.status(201).json({
            success: true,
            message: 'Work experience created successfully',
            data: parsedWorkExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update work experience
router.put('/:id', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const workExperience = await prisma.workExperience.update({
            where: { id: req.params.id },
            data: serializedData
        });

        // Parse for response
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.json({
            success: true,
            message: 'Work experience updated successfully',
            data: parsedWorkExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete work experience
router.delete('/:id', async (req, res) => {
    try {
        await queryBuilder.softDelete(prisma, 'workExperience', req.params.id);

        res.json({
            success: true,
            message: 'Work experience archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore deleted work experience
router.post('/:id/restore', async (req, res) => {
    try {
        const workExperience = await queryBuilder.restoreDeleted(prisma, 'workExperience', req.params.id);

        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.json({
            success: true,
            message: 'Work experience restored successfully',
            data: parsedWorkExperience
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
        const workExperience = await queryBuilder.toggleFeatured(prisma, 'workExperience', req.params.id);

        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.json({
            success: true,
            message: `Work experience ${workExperience.isFeatured ? 'featured' : 'unfeatured'}`,
            data: parsedWorkExperience
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
        const workExperience = await queryBuilder.togglePublished(prisma, 'workExperience', req.params.id);

        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperience = queryBuilder.parseJsonFields(workExperience, jsonFields);

        res.json({
            success: true,
            message: `Work experience ${workExperience.isPublished ? 'published' : 'unpublished'}`,
            data: parsedWorkExperience
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

        await queryBuilder.updateDisplayOrder(prisma, 'workExperience', items);

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

// Upload company logo
router.post('/upload-logo', async (req, res) => {
    try {
        // Assuming multer or similar middleware for file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Company logo uploaded successfully',
            data: {
                url: logoUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get work experience statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [total, published, featured, current, byCompany, byEmploymentType] = await Promise.all([
            prisma.workExperience.count({
                where: { deletedAt: null }
            }),
            prisma.workExperience.count({
                where: {
                    deletedAt: null,
                    isPublished: true
                }
            }),
            prisma.workExperience.count({
                where: {
                    deletedAt: null,
                    isPublished: true,
                    isFeatured: true
                }
            }),
            prisma.workExperience.count({
                where: {
                    deletedAt: null,
                    isCurrent: true
                }
            }),
            prisma.workExperience.groupBy({
                by: ['company'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            }),
            prisma.workExperience.groupBy({
                by: ['employmentType'],
                where: {
                    deletedAt: null,
                    isPublished: true
                },
                _count: true
            })
        ]);

        // Group by company
        const companyCounts = {};
        byCompany.forEach(group => {
            companyCounts[group.company || 'Uncategorized'] = group._count;
        });

        // Group by employment type
        const employmentTypeCounts = {};
        byEmploymentType.forEach(group => {
            employmentTypeCounts[group.employmentType || 'Uncategorized'] = group._count;
        });

        res.json({
            success: true,
            data: {
                total,
                published,
                featured,
                current,
                drafts: total - published,
                byCompany: companyCounts,
                byEmploymentType: employmentTypeCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get work experience timeline (chronological)
router.get('/timeline', async (req, res) => {
    try {
        const workExperiences = await prisma.workExperience.findMany({
            where: {
                deletedAt: null,
                isPublished: true
            },
            orderBy: { startDate: 'desc' }
        });

        // Parse JSON fields
        const jsonFields = ['responsibilities', 'achievements', 'technologies'];
        const parsedWorkExperiences = workExperiences.map(work =>
            queryBuilder.parseJsonFields(work, jsonFields)
        );

        // Group by year (using startDate)
        const timeline = {};
        parsedWorkExperiences.forEach(work => {
            const year = work.startDate ? new Date(work.startDate).getFullYear() : 'Unknown';
            if (!timeline[year]) {
                timeline[year] = [];
            }
            timeline[year].push(work);
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
