const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

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

// Get all contacts (Admin only - you might want to add auth later)
router.get('/', async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a contact
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

module.exports = router;
