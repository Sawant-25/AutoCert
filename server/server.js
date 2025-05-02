// // server/server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const pool = require('./db'); // Import the database pool

// const app = express();
// const PORT = process.env.PORT || 5001; // Use port from .env or default

// // --- Middleware ---
// // Enable CORS for requests from your React app (adjust origin in production)
// app.use(cors({ origin: 'http://localhost:3000' })); // Assuming React runs on 3000
// // Parse JSON request bodies
// app.use(express.json());

// // --- Routes ---
// app.get('/', (req, res) => {
//   res.send('AutoCert Backend is Running!');
// });

// // Login Endpoint
// app.post('/api/login', async (req, res) => {
//   const { username, password, role } = req.body;

//   console.log('Login attempt:', { username, role }); // Log attempt for debugging

//   if (!username || !password || !role) {
//     return res.status(400).json({ success: false, message: 'Missing username, password, or role' });
//   }

//   let tableName;
//   switch (role) {
//     case 'student':
//       tableName = 'students'; // MAKE SURE THIS MATCHES YOUR TABLE NAME
//       break;
//     case 'faculty':
//       tableName = 'faculty';  // MAKE SURE THIS MATCHES YOUR TABLE NAME
//       break;
//     case 'higher_authority':
//       tableName = 'higher_authorities'; // MAKE SURE THIS MATCHES YOUR TABLE NAME
//       break;
//     default:
//       return res.status(400).json({ success: false, message: 'Invalid role selected' });
//   }

//   // --- IMPORTANT: Security Note ---
//   // Directly using tableName like this can be risky if 'role' isn't strictly controlled.
//   // Ensure the 'role' values come *only* from your trusted dropdown.
//   // Parameterizing table names isn't directly supported by `pg`,
//   // so validation (like the switch case) is crucial.

//   try {
//     // Query to find the user by username in the correct table
//     // Adjust 'password_hash' to your actual password column name
//     const queryText = `SELECT username, password_hash FROM ${tableName} WHERE username = $1`;
//     const result = await pool.query(queryText, [username]);

//     if (result.rows.length === 0) {
//       console.log(`User not found: ${username} in table ${tableName}`);
//       return res.status(401).json({ success: false, message: 'Invalid username or password' });
//     }

//     const user = result.rows[0];
//     const storedPasswordHash = user.password_hash; // Get the stored hash

//     // Compare the submitted password with the stored hash
//     const passwordMatches = await bcrypt.compare(password, storedPasswordHash);

//     if (passwordMatches) {
//       console.log(`Login successful for: ${username}`);
//       // In a real app, you'd generate a JWT or session here
//       return res.json({ success: true, message: 'Login successful' });
//     } else {
//       console.log(`Password mismatch for: ${username}`);
//       return res.status(401).json({ success: false, message: 'Invalid username or password' });
//     }

//   } catch (error) {
//     console.error('Login error:', error);
//     // Don't send detailed database errors to the client
//     return res.status(500).json({ success: false, message: 'An internal server error occurred' });
//   }
// });


// // --- Start Server ---
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// const pool = require('./server/db');

// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('DB Connection Error:', err);
//   } else {
//     console.log('DB Connected at:', res.rows[0].now);
//   }
// });
// server/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const requestRoutes = require('./routes/requests');
// const facultyRoutes = require('./routes/faculty');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api',authRoutes);    // for login (e.g. /api/login)
app.use('/api',emailRoutes);      // for email (e.g. /api/send-email)
app.use('/api/requests', requestRoutes); // Mount the requests route for creating new requests
// app.use('/api/faculty', facultyRoutes); 

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Example DB test route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Database error');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
