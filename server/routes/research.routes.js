const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const assetUploader = require('../utils/assetUploader');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Configure multer for PDF uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// ============================================================================
// RESEARCH STATEMENT ENDPOINTS
// ============================================================================

// Get all research statements
router.get('/', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);
        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy,
            queryOptions.sortOrder,
            queryOptions.featuredFirst
        );

        const statements = await prisma.researchStatement.findMany({
            where,
            orderBy
        });

        // Parse JSON fields
        const jsonFields = ['currentFocus', 'phdInterests', 'researchGoals', 'futureDirections', 'publications', 'collaborations'];
        const statementsWithParsedFields = statements.map(statement =>
            queryBuilder.parseJsonFields(statement, jsonFields)
        );

        res.json({
            success: true,
            count: statements.length,
            data: statementsWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single research statement by ID
router.get('/:id', async (req, res) => {
    try {
        const { incrementViews } = req.query;

        const statement = await prisma.researchStatement.findUnique({
            where: { id: req.params.id }
        });

        if (!statement) {
            return res.status(404).json({
                success: false,
                error: 'Research statement not found'
            });
        }

        // Increment views if requested
        if (incrementViews === 'true') {
            await queryBuilder.incrementField(prisma, 'researchStatement', statement.id, 'views');
            statement.views = (statement.views || 0) + 1;
        }

        // Parse JSON fields
        const jsonFields = ['currentFocus', 'phdInterests', 'researchGoals', 'futureDirections', 'publications', 'collaborations'];
        const statementWithParsedFields = queryBuilder.parseJsonFields(statement, jsonFields);

        res.json({
            success: true,
            data: statementWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload PDF for research statement
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded'
            });
        }

        console.log('📤 Uploading research statement PDF to assets server...');
        const uploadResult = await assetUploader.uploadDocument(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ PDF uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                pdfUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ PDF upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new research statement
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['currentFocus', 'phdInterests', 'researchGoals', 'futureDirections', 'publications', 'collaborations'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const statement = await prisma.researchStatement.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(statement, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update research statement
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['currentFocus', 'phdInterests', 'researchGoals', 'futureDirections', 'publications', 'collaborations'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const statement = await prisma.researchStatement.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(statement, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete research statement
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const statement = await queryBuilder.softDelete(prisma, 'researchStatement', id);

        res.json({
            success: true,
            message: 'Research statement archived successfully',
            data: statement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted research statement
router.post('/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const statement = await queryBuilder.restoreDeleted(prisma, 'researchStatement', id);

        res.json({
            success: true,
            message: 'Research statement restored successfully',
            data: statement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle featured status
router.post('/:id/toggle-featured', async (req, res) => {
    try {
        const { id } = req.params;
        const statement = await queryBuilder.toggleFeatured(prisma, 'researchStatement', id);

        res.json({
            success: true,
            message: `Research statement ${statement.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: statement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle published status
router.post('/:id/toggle-published', async (req, res) => {
    try {
        const { id } = req.params;
        const statement = await queryBuilder.togglePublished(prisma, 'researchStatement', id);

        res.json({
            success: true,
            message: `Research statement ${statement.isPublished ? 'published' : 'unpublished'} successfully`,
            data: statement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Increment downloads for research statement
router.post('/statement/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        await queryBuilder.incrementField(prisma, 'researchStatement', id, 'downloads');

        const statement = await prisma.researchStatement.findUnique({ where: { id } });

        res.json({
            success: true,
            message: 'Download tracked successfully',
            data: { downloads: statement.downloads }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// PUBLICATION ENDPOINTS
// ============================================================================

// Get all publications with filtering
// Query params:
// - featured=true: Get only featured publications
// - type=Journal: Filter by publication type (Journal, Conference, Workshop, Preprint)
// - category=AI: Filter by research category
// - year=2024: Filter by year
// - sortBy=year: Sort field (default: year desc)
router.get('/publications', async (req, res) => {
    try {
        const queryOptions = queryBuilder.parseQueryParams(req.query);
        const where = queryBuilder.buildWhereClause(queryOptions);

        // Add additional filters
        if (req.query.type) {
            where.type = req.query.type;
        }
        if (req.query.year) {
            where.year = parseInt(req.query.year);
        }

        const orderBy = queryBuilder.buildOrderBy(
            queryOptions.sortBy || 'year',
            queryOptions.sortOrder || 'desc',
            queryOptions.featuredFirst
        );

        const publications = await prisma.publication.findMany({
            where,
            orderBy
        });

        // Parse JSON fields
        const jsonFields = ['authors', 'keywords'];
        const publicationsWithParsedFields = publications.map(pub =>
            queryBuilder.parseJsonFields(pub, jsonFields)
        );

        res.json({
            success: true,
            count: publications.length,
            data: publicationsWithParsedFields,
            filters: {
                type: req.query.type,
                year: req.query.year,
                category: queryOptions.category
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single publication by ID
router.get('/publications/:id', async (req, res) => {
    try {
        const { incrementViews } = req.query;

        const publication = await prisma.publication.findUnique({
            where: { id: req.params.id }
        });

        if (!publication) {
            return res.status(404).json({
                success: false,
                error: 'Publication not found'
            });
        }

        // Increment views if requested
        if (incrementViews === 'true') {
            await queryBuilder.incrementField(prisma, 'publication', publication.id, 'views');
            publication.views = (publication.views || 0) + 1;
        }

        // Parse JSON fields
        const jsonFields = ['authors', 'keywords'];
        const publicationWithParsedFields = queryBuilder.parseJsonFields(publication, jsonFields);

        res.json({
            success: true,
            data: publicationWithParsedFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload PDF for publication
router.post('/publications/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded'
            });
        }

        console.log('📤 Uploading publication PDF to assets server...');
        const uploadResult = await assetUploader.uploadDocument(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('✅ PDF uploaded successfully:', uploadResult.fileUrl);

        res.status(200).json({
            success: true,
            data: {
                pdfUrl: uploadResult.fileUrl,
                filename: uploadResult.filename,
                size: uploadResult.size
            }
        });
    } catch (error) {
        console.error('❌ PDF upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new publication
router.post('/publications', async (req, res) => {
    try {
        const data = req.body;

        // Validation
        if (!data.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // Serialize JSON fields
        const jsonFields = ['authors', 'keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const publication = await prisma.publication.create({
            data: serializedData
        });

        res.status(201).json({
            success: true,
            data: queryBuilder.parseJsonFields(publication, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update publication
router.put('/publications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Serialize JSON fields
        const jsonFields = ['authors', 'keywords'];
        const serializedData = queryBuilder.serializeJsonFields(data, jsonFields);

        const publication = await prisma.publication.update({
            where: { id },
            data: serializedData
        });

        res.json({
            success: true,
            data: queryBuilder.parseJsonFields(publication, jsonFields)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Soft delete publication
router.delete('/publications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const publication = await queryBuilder.softDelete(prisma, 'publication', id);

        res.json({
            success: true,
            message: 'Publication archived successfully',
            data: publication
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Restore soft-deleted publication
router.post('/publications/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;
        const publication = await queryBuilder.restoreDeleted(prisma, 'publication', id);

        res.json({
            success: true,
            message: 'Publication restored successfully',
            data: publication
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle featured status for publication
router.post('/publications/:id/toggle-featured', async (req, res) => {
    try {
        const { id } = req.params;
        const publication = await queryBuilder.toggleFeatured(prisma, 'publication', id);

        res.json({
            success: true,
            message: `Publication ${publication.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: publication
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Toggle published status for publication
router.post('/publications/:id/toggle-published', async (req, res) => {
    try {
        const { id } = req.params;
        const publication = await queryBuilder.togglePublished(prisma, 'publication', id);

        res.json({
            success: true,
            message: `Publication ${publication.isPublished ? 'published' : 'unpublished'} successfully`,
            data: publication
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Increment downloads for publication
router.post('/publications/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        await queryBuilder.incrementField(prisma, 'publication', id, 'downloads');

        const publication = await prisma.publication.findUnique({ where: { id } });

        res.json({
            success: true,
            message: 'Download tracked successfully',
            data: { downloads: publication.downloads }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update citations count for publication
router.put('/publications/:id/citations', async (req, res) => {
    try {
        const { id } = req.params;
        const { citations } = req.body;

        if (typeof citations !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Citations must be a number'
            });
        }

        const publication = await prisma.publication.update({
            where: { id },
            data: { citations }
        });

        res.json({
            success: true,
            message: 'Citations updated successfully',
            data: { citations: publication.citations }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update display order for publications
router.post('/publications/reorder', async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items must be an array of {id, displayOrder} objects'
            });
        }

        await queryBuilder.updateDisplayOrder(prisma, 'publication', items);

        res.json({
            success: true,
            message: 'Display order updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// COMPREHENSIVE RESEARCH STATISTICS
// ============================================================================

// Get comprehensive research statistics
// Combines research statement, publications, and overall research metrics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            // Research Statement stats
            totalStatements,
            publishedStatements,
            statementViews,
            statementDownloads,

            // Publication stats
            totalPublications,
            publishedPublications,
            featuredPublications,
            publicationsByType,
            publicationsByYear,
            totalCitations,
            totalPublicationDownloads,
            totalPublicationViews
        ] = await Promise.all([
            // Research Statement queries
            prisma.researchStatement.count({ where: { deletedAt: null } }),
            prisma.researchStatement.count({ where: { isPublished: true, deletedAt: null } }),
            prisma.researchStatement.aggregate({
                where: { deletedAt: null },
                _sum: { views: true }
            }),
            prisma.researchStatement.aggregate({
                where: { deletedAt: null },
                _sum: { downloads: true }
            }),

            // Publication queries
            prisma.publication.count({ where: { deletedAt: null } }),
            prisma.publication.count({ where: { isPublished: true, deletedAt: null } }),
            prisma.publication.count({ where: { isFeatured: true, deletedAt: null } }),
            prisma.publication.groupBy({
                by: ['type'],
                where: { deletedAt: null, type: { not: null } },
                _count: true
            }),
            prisma.publication.groupBy({
                by: ['year'],
                where: { deletedAt: null, year: { not: null } },
                _count: true,
                orderBy: { year: 'desc' }
            }),
            prisma.publication.aggregate({
                where: { deletedAt: null },
                _sum: { citations: true }
            }),
            prisma.publication.aggregate({
                where: { deletedAt: null },
                _sum: { downloads: true }
            }),
            prisma.publication.aggregate({
                where: { deletedAt: null },
                _sum: { views: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                researchStatement: {
                    total: totalStatements,
                    published: publishedStatements,
                    totalViews: statementViews._sum.views || 0,
                    totalDownloads: statementDownloads._sum.downloads || 0
                },
                publications: {
                    total: totalPublications,
                    published: publishedPublications,
                    featured: featuredPublications,
                    totalCitations: totalCitations._sum.citations || 0,
                    totalDownloads: totalPublicationDownloads._sum.downloads || 0,
                    totalViews: totalPublicationViews._sum.views || 0,
                    byType: publicationsByType.reduce((acc, item) => {
                        acc[item.type] = item._count;
                        return acc;
                    }, {}),
                    byYear: publicationsByYear.reduce((acc, item) => {
                        acc[item.year] = item._count;
                        return acc;
                    }, {})
                },
                overall: {
                    totalResearchOutputs: totalPublications,
                    totalCitations: totalCitations._sum.citations || 0,
                    hIndex: 0, // Can be calculated if needed
                    totalEngagement: (statementViews._sum.views || 0) + (totalPublicationViews._sum.views || 0)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get publications by year (for timeline visualization)
router.get('/publications/timeline', async (req, res) => {
    try {
        const publications = await prisma.publication.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
                year: { not: null }
            },
            select: {
                id: true,
                title: true,
                year: true,
                type: true,
                venue: true,
                citations: true,
                isFeatured: true
            },
            orderBy: [
                { year: 'desc' },
                { isFeatured: 'desc' }
            ]
        });

        // Group by year
        const timeline = publications.reduce((acc, pub) => {
            const year = pub.year;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(pub);
            return acc;
        }, {});

        res.json({
            success: true,
            data: timeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get featured research (combines statement + top publications)
router.get('/featured', async (req, res) => {
    try {
        const [statement, publications] = await Promise.all([
            prisma.researchStatement.findFirst({
                where: {
                    isPublished: true,
                    isFeatured: true,
                    deletedAt: null
                },
                orderBy: { displayOrder: 'asc' }
            }),
            prisma.publication.findMany({
                where: {
                    isPublished: true,
                    isFeatured: true,
                    deletedAt: null
                },
                orderBy: [
                    { displayOrder: 'asc' },
                    { citations: 'desc' }
                ],
                take: 5
            })
        ]);

        // Parse JSON fields
        const jsonFields = ['currentFocus', 'phdInterests', 'researchGoals', 'futureDirections', 'publications', 'collaborations'];
        const parsedStatement = statement ? queryBuilder.parseJsonFields(statement, jsonFields) : null;

        const pubJsonFields = ['authors', 'keywords'];
        const parsedPublications = publications.map(pub =>
            queryBuilder.parseJsonFields(pub, pubJsonFields)
        );

        res.json({
            success: true,
            data: {
                statement: parsedStatement,
                publications: parsedPublications
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
