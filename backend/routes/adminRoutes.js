const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const complaintModel = require('../models/complaintModel');

// Middleware to verify JWT token and Admin role
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = user;
        next();
    });
};

// Get dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const stats = await complaintModel.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get all complaints (with filters)
router.get('/complaints', authenticateAdmin, async (req, res) => {
    try {
        const complaints = await complaintModel.getAllComplaints(req.query);
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Update complaint status
router.put('/complaints/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: 'Status is required' });

        const success = await complaintModel.updateStatus(id, status);
        if (!success) return res.status(404).json({ error: 'Complaint not found' });

        res.json({ message: 'Complaint status updated' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
