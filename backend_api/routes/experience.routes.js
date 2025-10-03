const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all experiences
router.get('/', async (req, res) => {
    try {
        const experiences = await prisma.experience.findMany({
            orderBy: { year: 'desc' }
        });

        // Parse works JSON string to array
        const experiencesWithParsedWorks = experiences.map(exp => ({
            ...exp,
            works: exp.works ? JSON.parse(exp.works) : []
        }));

        res.json({
            success: true,
            count: experiences.length,
            data: experiencesWithParsedWorks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single experience by ID
router.get('/:id', async (req, res) => {
    try {
        const experience = await prisma.experience.findUnique({
            where: { id: req.params.id }
        });

        if (!experience) {
            return res.status(404).json({
                success: false,
                error: 'Experience not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...experience,
                works: experience.works ? JSON.parse(experience.works) : []
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
