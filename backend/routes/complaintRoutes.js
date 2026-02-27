const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const complaintModel = require('../models/complaintModel');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Create a new complaint
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { category, description, priority } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!category || !description || !priority) {
            return res.status(400).json({ error: 'Category, description, and priority are required' });
        }

        const complaintId = await complaintModel.createComplaint({
            userId: req.user.userId,
            category,
            description,
            priority,
            imagePath
        });

        res.status(201).json({ message: 'Complaint created successfully', id: complaintId });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
});

// Get complaints for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const complaints = await complaintModel.getComplaintsByUser(req.user.userId);
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

module.exports = router;
