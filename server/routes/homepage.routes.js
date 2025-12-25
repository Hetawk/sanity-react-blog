const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { cache, CACHE_TTL } = require('../utils/cache');

const prisma = new PrismaClient();

/**
 * GET /api/homepage
 * Returns all data needed for the homepage in a single request
 * Dramatically reduces initial load time by combining 6+ API calls into 1
 */
router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cacheKey = 'homepage:all';
        const cached = cache.get(cacheKey);

        if (cached) {
            // Set cache headers for browser
            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
            res.set('X-Cache', 'HIT');
            return res.json(cached);
        }

        // Fetch all homepage data in parallel
        const [abouts, works, skills, experiences, awards, brands] = await Promise.all([
            // About section
            prisma.about.findMany({
                where: { published: true },
                orderBy: { order: 'asc' },
                take: 10
            }),

            // Works section (limited for homepage)
            prisma.work.findMany({
                where: { published: true },
                orderBy: { createdAt: 'desc' },
                take: 12,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imgUrl: true,
                    projectLink: true,
                    codeLink: true,
                    tags: true,
                    source: true
                }
            }),

            // Skills
            prisma.skill.findMany({
                where: { published: true },
                orderBy: { order: 'asc' }
            }),

            // Featured experiences with works
            prisma.experience.findMany({
                where: {
                    published: true,
                    featured: true
                },
                orderBy: { year: 'desc' },
                take: 4,
                include: {
                    works: true
                }
            }),

            // Featured awards
            prisma.award.findMany({
                where: {
                    published: true,
                    featured: true
                },
                orderBy: { date: 'desc' },
                take: 6
            }),

            // Brands
            prisma.brand.findMany({
                where: { published: true },
                orderBy: { order: 'asc' }
            })
        ]);

        const responseData = {
            success: true,
            data: {
                abouts,
                works,
                skills,
                experiences,
                awards,
                brands
            },
            meta: {
                timestamp: new Date().toISOString(),
                counts: {
                    abouts: abouts.length,
                    works: works.length,
                    skills: skills.length,
                    experiences: experiences.length,
                    awards: awards.length,
                    brands: brands.length
                }
            }
        };

        // Cache the response
        cache.set(cacheKey, responseData, CACHE_TTL.MEDIUM);

        // Set cache headers for browser
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
        res.set('X-Cache', 'MISS');

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch homepage data',
            message: error.message
        });
    }
});

/**
 * POST /api/homepage/invalidate
 * Invalidates the homepage cache (call after content updates)
 */
router.post('/invalidate', async (req, res) => {
    try {
        cache.invalidatePattern('homepage');
        res.json({
            success: true,
            message: 'Homepage cache invalidated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
