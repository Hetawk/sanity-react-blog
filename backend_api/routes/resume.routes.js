const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all resumes
router.get('/', async (req, res) => {
    try {
        const resumes = await prisma.resume.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Parse JSON fields
        const resumesWithParsedData = resumes.map(resume => ({
            ...resume,
            experience: resume.experience ? JSON.parse(resume.experience) : [],
            education: resume.education ? JSON.parse(resume.education) : [],
            skills: resume.skills ? JSON.parse(resume.skills) : []
        }));

        res.json({
            success: true,
            count: resumes.length,
            data: resumesWithParsedData
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
            data: {
                ...resume,
                experience: resume.experience ? JSON.parse(resume.experience) : [],
                education: resume.education ? JSON.parse(resume.education) : [],
                skills: resume.skills ? JSON.parse(resume.skills) : []
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
