const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

module.exports = router;
