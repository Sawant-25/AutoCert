const express = require('express');
const router = express.Router();
const pool = require('../db'); // adjust if your pool is in a different file

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  // console.log("Request body:", req.body);
  
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing username, password, or role' });
  }

  let tableName;
  switch (role) {
    case 'student':
      tableName = 'volunteers';
      break;
    case 'faculty':
      tableName = 'faculty';
      break;
    case 'higher_authority':
      tableName = 'authorities';
      break;
    default:
      return res.status(400).json({ message: 'Invalid role selected' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: role,
        email:user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
