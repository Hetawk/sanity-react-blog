/**
 * GitHub Sync Routes
 * API endpoints to manage GitHub repository syncing
 */

const express = require('express');
const router = express.Router();
const { triggerManualSync, getSyncStatus } = require('../services/schedulerService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * POST /api/github-sync
 * Trigger manual sync of all repositories from both GitHub accounts
 */
router.post('/', async (req, res) => {
    try {
        console.log('🔄 Manual sync triggered via API');

        // Run sync immediately (non-blocking)
        const result = await triggerManualSync();

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'GitHub sync completed successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(409).json({
                success: false,
                message: result.message,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error during manual sync:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/github-sync/status
 * Get sync status and statistics including scheduler info
 */
router.get('/status', async (req, res) => {
    try {
        // Get scheduler status
        const schedulerStatus = getSyncStatus();

        const stats = await prisma.work.aggregate({
            where: {
                isGithubProject: true,
                deletedAt: null
            },
            _count: {
                id: true
            },
            _avg: {
                githubStars: true,
                githubForks: true
            },
            _sum: {
                githubStars: true,
                githubForks: true
            }
        });

        const recentlySynced = await prisma.work.findMany({
            where: {
                isGithubProject: true,
                deletedAt: null
            },
            select: {
                title: true,
                githubUrl: true,
                githubStars: true,
                githubForks: true,
                updatedAt: true,
                isPrivateRepo: true
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 10
        });

        const byCategory = await prisma.work.groupBy({
            by: ['projectCategory'],
            where: {
                isGithubProject: true,
                deletedAt: null
            },
            _count: {
                id: true
            }
        });

        const byLanguage = await prisma.work.findMany({
            where: {
                isGithubProject: true,
                deletedAt: null,
                languages: { not: null }
            },
            select: {
                languages: true
            }
        });

        // Parse and count languages
        const languageCounts = {};
        byLanguage.forEach(work => {
            try {
                const langs = JSON.parse(work.languages);
                langs.forEach(lang => {
                    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
                });
            } catch (error) {
                // Skip invalid JSON
            }
        });

        res.json({
            success: true,
            scheduler: schedulerStatus,
            data: {
                total: stats._count.id,
                totalStars: stats._sum.githubStars || 0,
                totalForks: stats._sum.githubForks || 0,
                avgStars: Math.round(stats._avg.githubStars || 0),
                avgForks: Math.round(stats._avg.githubForks || 0),
                recentlySynced,
                byCategory,
                topLanguages: Object.entries(languageCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([language, count]) => ({ language, count }))
            }
        });
    } catch (error) {
        console.error('Error getting sync status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/github-sync/projects
 * Get all GitHub projects with pagination and filtering
 */
router.get('/projects', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            language,
            isPrivate,
            hasTests,
            complexity,
            sort = '-githubStars'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            isGithubProject: true,
            deletedAt: null
        };

        if (category) {
            where.projectCategory = category;
        }

        if (isPrivate !== undefined) {
            where.isPrivateRepo = isPrivate === 'true';
        }

        if (hasTests !== undefined) {
            where.hasTests = hasTests === 'true';
        }

        if (complexity) {
            where.complexity = complexity;
        }

        if (language) {
            where.languages = {
                contains: language
            };
        }

        // Build order by
        const orderBy = {};
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortDirection = sort.startsWith('-') ? 'desc' : 'asc';
        orderBy[sortField] = sortDirection;

        // Fetch projects
        const [projects, total] = await Promise.all([
            prisma.work.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imgUrl: true,
                    githubUrl: true,
                    githubOwner: true,
                    githubRepo: true,
                    isPrivateRepo: true,
                    githubStars: true,
                    githubForks: true,
                    projectCategory: true,
                    projectSubCategory: true,
                    languages: true,
                    frameworks: true,
                    complexity: true,
                    hasTests: true,
                    hasDocs: true,
                    hasCI: true,
                    hasDocker: true,
                    githubCreatedAt: true,
                    githubUpdatedAt: true,
                    isPublished: true,
                    isDraft: true,
                    isFeatured: true
                }
            }),
            prisma.work.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    hasMore: skip + projects.length < total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/github-sync/projects/:id/publish
 * Publish a GitHub project (move from draft to published)
 */
router.post('/projects/:id/publish', async (req, res) => {
    try {
        const { id } = req.params;

        const work = await prisma.work.update({
            where: { id },
            data: {
                isPublished: true,
                isDraft: false,
                publishedAt: new Date()
            }
        });

        res.json({
            success: true,
            data: work,
            message: 'Project published successfully'
        });
    } catch (error) {
        console.error('Error publishing project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /api/github-sync/projects/:id
 * Update GitHub project (description, image, etc.)
 */
router.patch('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating GitHub-specific fields
        const allowedFields = [
            'description',
            'imgUrl',
            'projectLink',
            'isPublished',
            'isDraft',
            'isFeatured',
            'displayOrder',
            'category',
            'duration',
            'role',
            'impact'
        ];

        const filteredData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        const work = await prisma.work.update({
            where: { id },
            data: filteredData
        });

        res.json({
            success: true,
            data: work,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
