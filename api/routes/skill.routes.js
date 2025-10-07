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
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for icons
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all skills with advanced filtering
// Query params:
// - featured=true: Get only featured skills
// - category=Programming: Filter by category
// - sortBy=proficiencyLevel: Sort by proficiency
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);
        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy || 'proficiencyLevel',
            queryOptions.sortOrder || 'desc',
            queryOptions.featuredFirst
        );

        const skills = await prisma.skill.findMany({
            where,
            orderBy
        });

        // Parse JSON fields
        const jsonFields = ['projectsUsed', 'certifications'];
        const skillsWithParsedFields = skills.map(skill =>
            queryBuilder.parseJsonFields(skill, jsonFields)
        );

        res.json({
            success: true,
            count: skills.length,
            data: skillsWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single skill by ID
router.get('/:id', async (req, res) => {
    try {
        const skill = await prisma.skill.findUnique({
            where: { id: req.params.id }
        });

        if (!skill) {
            return res.status(404).json({
                success: false,
                error: 'Skill not found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['projectsUsed', 'certifications'];
        const skillWithParsedFields = queryBuilder.parseJsonFields(skill, jsonFields);

        res.json({
            success: true,
            data: skillWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload icon for skill
router.post('/upload-icon', upload.single('icon'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No icon file uploaded'
            });
        }

        console.log('📤 Uploading skill icon to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ Skill icon uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                icon: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Skill icon upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new skill
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['projectsUsed', 'certifications'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const skill = await prisma.skill.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(skill, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update skill
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['projectsUsed', 'certifications'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const skill = await prisma.skill.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(skill, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete skill
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await queryBuilder.softDelete(prisma, 'skill', id);

        res.json({
            success: true,
            message: 'Skill archived successfully',
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted skill
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await queryBuilder.restoreDeleted(prisma, 'skill', id);

        res.json({
            success: true,
            message: 'Skill restored successfully',
            data: skill
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
        const skill = await queryBuilder.toggleFeatured(prisma, 'skill', id);

        res.json({
            success: true,
            message: `Skill ${skill.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: skill
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
        const skill = await queryBuilder.togglePublished(prisma, 'skill', id);

        res.json({
            success: true,
            message: `Skill ${skill.isPublished ? 'published' : 'unpublished'} successfully`,
            data: skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Increment endorsements
router.post('/:id/endorse', async (req, res) => {
    try {
        const { id } = req.params;
        await queryBuilder.incrementField(prisma, 'skill', id, 'endorsements');

        const skill = await prisma.skill.findUnique({ where: { id } });

        res.json({
            success: true,
            message: 'Skill endorsed successfully',
            data: { endorsements: skill.endorsements }
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

        await queryBuilder.updateDisplayOrder(prisma, 'skill', items);

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

// Get skill statistics by category
router.get('/stats/by-category', async (req, res) => {
    try {
        const byCategory = await prisma.skill.groupBy({
            by: ['category'],
            where: { deletedAt: null, category: { not: null } },
            _count: true,
            _avg: {
                proficiencyLevel: true
            }
        });

        res.json({
            success: true,
            data: byCategory.map(item => ({
                category: item.category,
                count: item._count,
                avgProficiency: Math.round(item._avg.proficiencyLevel || 0)
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
