const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

module.exports = router;
