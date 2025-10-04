const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/resumes');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

        // If this resume is set as active, deactivate all others
        if (isActive === 'true' || isActive === true) {
            await prisma.resume.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        // Create the file URL (adjust this based on how you serve static files)
        const fileUrl = `/uploads/resumes/${req.file.filename}`;

        const resume = await prisma.resume.create({
            data: {
                title,
                description: description || '',
                fileUrl,
                fileName: req.file.originalname,
                isActive: isActive === 'true' || isActive === true
            }
        });

        res.status(201).json({
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
