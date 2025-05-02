// server/routes/faculty.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET endpoint to fetch all faculty members
router.get('/', async (req, res) => {
    // TODO: Add Authentication - Ensure only logged-in users (e.g., students) can fetch this list
    try {
        // Adjust 'username' to 'name' if you have a different column for display name
        const query = 'SELECT id, username, email FROM faculty ORDER BY username ASC';
        const result = await pool.query(query);
        res.status(200).json(result.rows); // Send array of {id, username, email}
    } catch (error) {
        console.error('Error fetching faculty list:', error);
        res.status(500).json({ message: 'Failed to fetch faculty list', error: error.message });
    }
});

module.exports = router;