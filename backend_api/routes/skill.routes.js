const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');

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

// Get all skills
router.get('/', async (req, res) => {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            count: skills.length,
            data: skills
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

        res.json({
            success: true,
            data: skill
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

module.exports = router;
