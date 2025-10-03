const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all works
router.get('/', async (req, res) => {
    try {
        const works = await prisma.work.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Parse tags JSON string to array
        const worksWithParsedTags = works.map(work => ({
            ...work,
            tags: work.tags ? JSON.parse(work.tags) : []
        }));

        res.json({
            success: true,
            count: works.length,
            data: worksWithParsedTags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single work by ID
router.get('/:id', async (req, res) => {
    try {
        const work = await prisma.work.findUnique({
            where: { id: req.params.id }
        });

        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Work not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...work,
                tags: work.tags ? JSON.parse(work.tags) : []
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get works by tag
router.get('/tag/:tag', async (req, res) => {
    try {
        const works = await prisma.work.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const filteredWorks = works
            .map(work => ({
                ...work,
                tags: work.tags ? JSON.parse(work.tags) : []
            }))
            .filter(work => work.tags.includes(req.params.tag));

        res.json({
            success: true,
            count: filteredWorks.length,
            data: filteredWorks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
