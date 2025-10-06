const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');

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

// Get all works
router.get('/', async (req, res) => {
    try {
        const works = await prisma.work.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Parse tags JSON string to array
        const worksWithParsedTags = works.map(work => ({
            ...work,
            tags: work.tags ? JSON.parse(work.tags) : []
        }));

        res.json({
            success: true,
            count: works.length,
            data: worksWithParsedTags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single work by ID
router.get('/:id', async (req, res) => {
    try {
        const work = await prisma.work.findUnique({
            where: { id: req.params.id }
        });

        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Work not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...work,
                tags: work.tags ? JSON.parse(work.tags) : []
            }
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

module.exports = router;
