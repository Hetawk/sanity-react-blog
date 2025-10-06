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

// Get all abouts with advanced filtering
// Query params:
// - featured=true: Get only featured items
// - sectionType=research: Filter by section type
// - includeUnpublished=true: Include unpublished (for admin)
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);
        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy,
            queryOptions.sortOrder,
            queryOptions.featuredFirst
        );

        const abouts = await prisma.about.findMany({
            where,
            orderBy
        });

        // Parse JSON fields
        const jsonFields = ['metrics', 'tags', 'competencies', 'achievements'];
        const aboutsWithParsedFields = abouts.map(about =>
            queryBuilder.parseJsonFields(about, jsonFields)
        );

        res.json({
            success: true,
            count: abouts.length,
            data: aboutsWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single about by ID
router.get('/:id', async (req, res) => {
    try {
        const about = await prisma.about.findUnique({
            where: { id: req.params.id }
        });

        if (!about) {
            return res.status(404).json({
                success: false,
                error: 'About not found'
            });
        }

        // Parse JSON fields
        const jsonFields = ['metrics', 'tags', 'competencies', 'achievements'];
        const aboutWithParsedFields = queryBuilder.parseJsonFields(about, jsonFields);

        res.json({
            success: true,
            data: aboutWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new about
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Validation
        if (!data.title || !data.description) {
            return res.status(400).json({
                success: false,
                error: 'Title and description are required'
            });
        }

        // Serialize JSON fields
        const jsonFields = ['metrics', 'tags', 'competencies', 'achievements'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const about = await prisma.about.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(about, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update about
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['metrics', 'tags', 'competencies', 'achievements'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const about = await prisma.about.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(about, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete about
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const about = await queryBuilder.softDelete(prisma, 'about', id);

        res.json({
            success: true,
            message: 'About archived successfully',
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted about
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const about = await queryBuilder.restoreDeleted(prisma, 'about', id);

        res.json({
            success: true,
            message: 'About restored successfully',
            data: about
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
        const about = await queryBuilder.toggleFeatured(prisma, 'about', id);

        res.json({
            success: true,
            message: `About ${about.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: about
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
        const about = await queryBuilder.togglePublished(prisma, 'about', id);

        res.json({
            success: true,
            message: `About ${about.isPublished ? 'published' : 'unpublished'} successfully`,
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update display order for multiple abouts
router.post('/reorder', async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items must be an array of {id, displayOrder} objects'
            });
        }

        await queryBuilder.updateDisplayOrder(prisma, 'about', items);

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

// Upload image for about
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        console.log('📤 Uploading about image to assets server...');
        const uploadResult = await assetUploader.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ About image uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                imgUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ About image upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
