/**
 * Query Builder Utilities for Content Management
 * Provides reusable query filters and sorting for all models
 */

/**
 * Build a WHERE clause for published content with optional filters
 * @param {Object} options - Query options
 * @param {boolean} options.includeUnpublished - Include unpublished items (default: false)
 * @param {boolean} options.includeDrafts - Include drafts (default: false)
 * @param {boolean} options.featuredOnly - Only featured items (default: false)
 * @param {string} options.category - Filter by category
 * @param {string} options.sectionType - Filter by section type (About model)
 * @returns {Object} Prisma WHERE clause
 */
const buildWhereClause = (options = {}) => {
    const where = {
        deletedAt: null // Always exclude soft-deleted items
    };

    // Publishing filters
    if (!options.includeUnpublished) {
        where.isPublished = true;
    }

    if (!options.includeDrafts && options.isDraft !== undefined) {
        where.isDraft = false;
    }

    if (options.featuredOnly) {
        where.isFeatured = true;
    }

    // Category filters
    if (options.category) {
        where.category = options.category;
    }

    if (options.sectionType) {
        where.sectionType = options.sectionType;
    }

    return where;
};

/**
 * Build an ORDER BY clause for content
 * @param {string} sortBy - Field to sort by (default: 'displayOrder')
 * @param {string} sortOrder - 'asc' or 'desc' (default: 'asc')
 * @param {boolean} featuredFirst - Show featured items first (default: true)
 * @returns {Array} Prisma orderBy array
 */
const buildOrderBy = (sortBy = 'displayOrder', sortOrder = 'asc', featuredFirst = true) => {
    const orderBy = [];

    if (featuredFirst) {
        orderBy.push({ isFeatured: 'desc' }); // Featured first
    }

    if (sortBy === 'displayOrder') {
        orderBy.push({ displayOrder: sortOrder });
    } else if (sortBy) {
        orderBy.push({ [sortBy]: sortOrder });
    }

    return orderBy;
};

/**
 * Parse query parameters from request
 * @param {Object} query - Express req.query object
 * @returns {Object} Parsed query options
 */
const parseQueryParams = (query) => {
    return {
        includeUnpublished: query.includeUnpublished === 'true',
        includeDrafts: query.includeDrafts === 'true',
        featuredOnly: query.featured === 'true',
        category: query.category,
        sectionType: query.sectionType,
        sortBy: query.sortBy || 'displayOrder',
        sortOrder: query.sortOrder || 'asc',
        featuredFirst: query.featuredFirst !== 'false', // true by default
        limit: query.limit ? parseInt(query.limit) : undefined,
        skip: query.skip ? parseInt(query.skip) : undefined
    };
};

/**
 * Parse JSON fields in a model
 * @param {Object} item - Database item
 * @param {Array<string>} jsonFields - Fields that contain JSON strings
 * @returns {Object} Item with parsed JSON fields
 */
const parseJsonFields = (item, jsonFields = []) => {
    if (!item) return item;

    const parsed = { ...item };
    jsonFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                // Keep as string if parsing fails
                console.warn(`Failed to parse JSON field ${field}:`, e.message);
            }
        }
    });

    return parsed;
};

/**
 * Serialize JSON fields before saving to database
 * @param {Object} data - Data to save
 * @param {Array<string>} jsonFields - Fields that should be JSON strings
 * @returns {Object} Data with serialized JSON fields
 */
const serializeJsonFields = (data, jsonFields = []) => {
    const serialized = { ...data };
    jsonFields.forEach(field => {
        if (serialized[field] && typeof serialized[field] === 'object') {
            serialized[field] = JSON.stringify(serialized[field]);
        }
    });

    return serialized;
};

/**
 * Increment a numeric field (views, downloads, likes, etc.)
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name (e.g., 'work', 'skill')
 * @param {string} id - Item ID
 * @param {string} field - Field to increment (e.g., 'views', 'likes')
 * @param {number} amount - Amount to increment by (default: 1)
 */
const incrementField = async (prisma, model, id, field, amount = 1) => {
    try {
        await prisma[model].update({
            where: { id },
            data: {
                [field]: {
                    increment: amount
                }
            }
        });
    } catch (error) {
        console.error(`Failed to increment ${field} for ${model} ${id}:`, error.message);
    }
};

/**
 * Soft delete an item
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name
 * @param {string} id - Item ID
 * @returns {Object} Updated item
 */
const softDelete = async (prisma, model, id) => {
    return await prisma[model].update({
        where: { id },
        data: { deletedAt: new Date() }
    });
};

/**
 * Restore a soft-deleted item
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name
 * @param {string} id - Item ID
 * @returns {Object} Updated item
 */
const restoreDeleted = async (prisma, model, id) => {
    return await prisma[model].update({
        where: { id },
        data: { deletedAt: null }
    });
};

/**
 * Toggle featured status
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name
 * @param {string} id - Item ID
 * @returns {Object} Updated item
 */
const toggleFeatured = async (prisma, model, id) => {
    const item = await prisma[model].findUnique({ where: { id } });
    const newFeaturedStatus = !item.isFeatured;

    return await prisma[model].update({
        where: { id },
        data: {
            isFeatured: newFeaturedStatus,
            featuredAt: newFeaturedStatus ? new Date() : null
        }
    });
};

/**
 * Toggle published status
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name
 * @param {string} id - Item ID
 * @returns {Object} Updated item
 */
const togglePublished = async (prisma, model, id) => {
    const item = await prisma[model].findUnique({ where: { id } });
    const newPublishedStatus = !item.isPublished;

    // Only Work and ResearchStatement models have publishedAt field
    const modelsWithPublishedAt = ['work', 'researchStatement'];
    const shouldIncludePublishedAt = modelsWithPublishedAt.includes(model);

    const updateData = {
        isPublished: newPublishedStatus
    };

    // Add publishedAt only for models that have this field
    if (shouldIncludePublishedAt) {
        updateData.publishedAt = newPublishedStatus ? new Date() : null;
    }

    return await prisma[model].update({
        where: { id },
        data: updateData
    });
};

/**
 * Update display order for multiple items
 * @param {Object} prisma - Prisma client instance
 * @param {string} model - Model name
 * @param {Array<{id: string, displayOrder: number}>} items - Items with new order
 * @returns {Array} Updated items
 */
const updateDisplayOrder = async (prisma, model, items) => {
    const updates = items.map(item =>
        prisma[model].update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder }
        })
    );

    return await Promise.all(updates);
};

module.exports = {
    buildWhereClause,
    buildOrderBy,
    parseQueryParams,
    parseJsonFields,
    serializeJsonFields,
    incrementField,
    softDelete,
    restoreDeleted,
    toggleFeatured,
    togglePublished,
    updateDisplayOrder
};
