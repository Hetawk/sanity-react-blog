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

// Get all awards
router.get('/', async (req, res) => {
    try {
        const { year } = req.query;

        let awards;
        if (year) {
            awards = await prisma.award.findMany({
                where: { date: { contains: year } },
                orderBy: { date: 'desc' }
            });
        } else {
            awards = await prisma.award.findMany({
                orderBy: { date: 'desc' }
            });
        }

        res.json({
            success: true,
            count: awards.length,
            data: awards
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

// Get awards grouped by year
router.get('/stats/by-year', async (req, res) => {
    try {
        const awards = await prisma.award.findMany();

        const groupedByYear = awards.reduce((acc, award) => {
            const year = award.date ? award.date.substring(0, 4) : 'Unknown';
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(award);
            return acc;
        }, {});

        res.json({
            success: true,
            data: groupedByYear
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload image for award
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        console.log('📤 Uploading award image to assets server...');
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
