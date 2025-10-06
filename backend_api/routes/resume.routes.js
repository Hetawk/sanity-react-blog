const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');

const prisma = new PrismaClient();

// Configure multer for memory storage (we'll upload to assets server)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Get all resumes
router.get('/', async (req, res) => {
    try {
        const resumes = await prisma.resume.findMany({
            orderBy: { uploadedAt: 'desc' }
        });

        res.json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single resume by ID
router.get('/:id', async (req, res) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: { id: req.params.id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload new resume
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { title, description, isActive } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Upload file to EKD Digital Assets
        console.log('📤 Uploading resume to assets server...');
        const uploadResult = await assetUploader.uploadResume(req.file.buffer, req.file.originalname);

        console.log('✅ Resume uploaded successfully:', uploadResult.fileUrl);

        // If this resume is set as active, deactivate all others
        if (isActive === 'true' || isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        // Create resume record with assets server URL
        const resume = await prisma.resume.create({
            data: {
                title,
                description: description || '',
                fileUrl: uploadResult.fileUrl,
                fileName: req.file.originalname,
                isActive: isActive === 'true' || isActive === true
            }
        });

        res.status(201).json({
            success: true,
            data: resume,
            asset: {
                url: uploadResult.fileUrl,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ Resume upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update resume (mark as active/inactive)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, title, description } = req.body;

        // If setting this as active, deactivate all others
        if (isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        const resume = await prisma.resume.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete resume
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await prisma.resume.findUnique({
            where: { id }
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // Delete the physical file
        if (resume.fileUrl) {
            const filePath = path.join(__dirname, '..', resume.fileUrl);
            try {
                await fs.unlink(filePath);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }

        await prisma.resume.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
