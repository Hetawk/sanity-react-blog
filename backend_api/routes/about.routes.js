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

// Get all abouts
router.get('/', async (req, res) => {
    try {
        const abouts = await prisma.about.findMany({
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            count: abouts.length,
            data: abouts
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

        res.json({
            success: true,
            data: about
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
        const { title, description, imgUrl } = req.body;

        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Title and description are required'
            });
        }

        const about = await prisma.about.create({
            data: {
                title,
                description,
                imgUrl: imgUrl || ''
            }
        });

        res.status(201).json({
            success: true,
            data: about
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
        const { title, description, imgUrl } = req.body;

        // Check if about exists
        const existingAbout = await prisma.about.findUnique({
            where: { id: req.params.id }
        });

        if (!existingAbout) {
            return res.status(404).json({
                success: false,
                error: 'About not found'
            });
        }

        // Update about
        const about = await prisma.about.update({
            where: { id: req.params.id },
            data: {
                title: title || existingAbout.title,
                description: description || existingAbout.description,
                imgUrl: imgUrl !== undefined ? imgUrl : existingAbout.imgUrl
            }
        });

        res.json({
            success: true,
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete about
router.delete('/:id', async (req, res) => {
    try {
        // Check if about exists
        const existingAbout = await prisma.about.findUnique({
            where: { id: req.params.id }
        });

        if (!existingAbout) {
            return res.status(404).json({
                success: false,
                error: 'About not found'
            });
        }

        await prisma.about.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'About deleted successfully'
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
