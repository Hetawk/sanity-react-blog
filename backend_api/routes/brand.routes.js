const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all brands
router.get('/', async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single brand by ID
router.get('/:id', async (req, res) => {
    try {
        const brand = await prisma.brand.findUnique({
            where: { id: req.params.id }
        });

        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found'
            });
        }

        res.json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
