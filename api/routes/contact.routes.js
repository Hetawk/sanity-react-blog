const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const queryBuilder = require('../utils/queryBuilder');

const prisma = new PrismaClient();

// Create a new contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and message are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        const contact = await prisma.contact.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim()
            }
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully! Thank you for contacting me.',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all contacts with advanced filtering (Admin only - add auth later)
router.get('/', async (req, res) => {
    try {
        const {
            isRead,
            isReplied,
            status,
            category,
            priority,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limit,
            skip
        } = queryBuilder.parseQueryParams(req.query);

        // Build where clause
        const where = {};

        if (isRead !== undefined) {
            where.isRead = isRead === 'true';
        }

        if (isReplied !== undefined) {
            where.isReplied = isReplied === 'true';
        }

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (priority) {
            where.priority = priority;
        }

        // Build order
        const orderBy = queryBuilder.buildOrderBy(sortBy, sortOrder, false);

        const contacts = await prisma.contact.findMany({
            where,
            orderBy,
            ...(limit && { take: parseInt(limit) }),
            ...(skip && { skip: parseInt(skip) })
        });

        res.json({
            success: true,
            count: contacts.length,
            data: contacts,
            filters: {
                isRead,
                isReplied,
                status,
                category,
                priority
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single contact by ID
router.get('/:id', async (req, res) => {
    try {
        const contact = await prisma.contact.findUnique({
            where: { id: req.params.id }
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update contact (mark as read, add reply, etc.)
router.put('/:id', async (req, res) => {
    try {
        const data = req.body;

        // If marking as replied, add repliedAt timestamp
        if (data.isReplied && !data.repliedAt) {
            data.repliedAt = new Date();
        }

        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data
        });

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark contact as read
router.post('/:id/mark-read', async (req, res) => {
    try {
        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data: { isRead: true }
        });

        res.json({
            success: true,
            message: 'Contact marked as read',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark contact as unread
router.post('/:id/mark-unread', async (req, res) => {
    try {
        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data: { isRead: false }
        });

        res.json({
            success: true,
            message: 'Contact marked as unread',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Reply to contact
router.post('/:id/reply', async (req, res) => {
    try {
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({
                success: false,
                error: 'Reply message is required'
            });
        }

        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data: {
                reply,
                isReplied: true,
                repliedAt: new Date(),
                status: 'resolved'
            }
        });

        res.json({
            success: true,
            message: 'Reply added successfully',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a contact (permanent delete for admin)
router.delete('/:id', async (req, res) => {
    try {
        await prisma.contact.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get contact statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            total,
            unread,
            read,
            replied,
            unreplied,
            byStatus,
            byCategory,
            byPriority
        ] = await Promise.all([
            prisma.contact.count(),
            prisma.contact.count({ where: { isRead: false } }),
            prisma.contact.count({ where: { isRead: true } }),
            prisma.contact.count({ where: { isReplied: true } }),
            prisma.contact.count({ where: { isReplied: false } }),
            prisma.contact.groupBy({
                by: ['status'],
                _count: true
            }),
            prisma.contact.groupBy({
                by: ['category'],
                _count: true
            }),
            prisma.contact.groupBy({
                by: ['priority'],
                _count: true
            })
        ]);

        // Group by status
        const statusCounts = {};
        byStatus.forEach(group => {
            statusCounts[group.status || 'Uncategorized'] = group._count;
        });

        // Group by category
        const categoryCounts = {};
        byCategory.forEach(group => {
            categoryCounts[group.category || 'Uncategorized'] = group._count;
        });

        // Group by priority
        const priorityCounts = {};
        byPriority.forEach(group => {
            priorityCounts[group.priority || 'normal'] = group._count;
        });

        res.json({
            success: true,
            data: {
                total,
                unread,
                read,
                replied,
                unreplied,
                byStatus: statusCounts,
                byCategory: categoryCounts,
                byPriority: priorityCounts
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
