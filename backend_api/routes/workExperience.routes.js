const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all work experiences
router.get('/', async (req, res) => {
    try {
        const workExperiences = await prisma.workExperience.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: workExperiences.length,
            data: workExperiences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single work experience by ID
router.get('/:id', async (req, res) => {
    try {
        const workExperience = await prisma.workExperience.findUnique({
            where: { id: req.params.id }
        });

        if (!workExperience) {
            return res.status(404).json({
                success: false,
                error: 'Work experience not found'
            });
        }

        res.json({
            success: true,
            data: workExperience
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
