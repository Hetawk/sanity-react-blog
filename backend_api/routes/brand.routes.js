const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');

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

// Get all brands
router.get('/', async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            count: brands.length,
            data: brands
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

module.exports = router;
