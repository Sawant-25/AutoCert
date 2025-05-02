const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming db.js handles database connection



router.get('/faculty-emails', async (req, res) => {
  try {
    // Fetch all faculty emails from the faculty table
    const result = await pool.query('SELECT email FROM faculty');
    console.log("Faculty query result:", result.rows);

    // If no faculty found, return an empty array
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No faculty found' });
    }

    // Return the list of faculty emails
    res.status(200).json({ facultyEmails: result.rows.map(row => row.email) });
  } catch (error) {
    console.error('Error fetching faculty emails:', error);
    res.status(500).json({ message: 'Failed to fetch faculty emails', error: error.message });
  }
});

router.get('/authority-emails', async (req, res) => {
  try {
    // Fetch emails from the authorities table
    const result = await pool.query('SELECT email FROM authorities');
    console.log("Authority query result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No authorities found' });
    }

    // Return just the list of emails
    res.status(200).json({ authorityEmails: result.rows.map(row => row.email) });
  } catch (error) {
    console.error('Error fetching authority emails:', error);
    res.status(500).json({ message: 'Failed to fetch authority emails', error: error.message });
  }
});
// POST request to store a new email request
// GET requests for a specific student
router.get('/:student_email', async (req, res) => {
    const { student_email } = req.params;
  
    try {
      const query = `SELECT * FROM requests WHERE student_email = $1 ORDER BY created_at DESC`;
      const result = await pool.query(query, [student_email]);
  
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching requests for student:', error);
      res.status(500).json({ message: 'Failed to fetch requests', error });
    }
  });

  // ✅ Faculty: Get requests for this faculty
router.get('/faculty/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM requests WHERE faculty_email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No requests found for this faculty' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Faculty: Approve request and forward to authority
router.post('/faculty/approve', async (req, res) => {
  const { requestId, authority_email } = req.body;
  try {
   const result= await pool.query(
      `UPDATE requests 
       SET status='Pending' , faculty_status = 'Approved', is_forwarded_to_authority = true, authority_email = $1, updated_at = NOW()
       WHERE id = $2`,
      [authority_email, requestId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: 'Request forwarded to authority' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// router.post('/faculty/reject', async (req, res) => {
 
//   try {
//     const { requestId } = req.body;
//     console.log('Rejecting request with ID:', requestId); 
  

//     if (!requestId) {
//       return res.status(400).json({ error: "requestId is required" });
//     }


//     // Update the request status to 'Rejected'
//     await db.query('UPDATE requests SET faculty_status = $1 WHERE id = $2', ['Rejected', requestId]);
//     res.status(200).send('Request Rejected');
//   } catch (err) {
//     res.status(500).send('Error rejecting request');
//   }
// });

router.post('/faculty/reject', async (req, res) => {
  try {
    console.log("Incoming reject request body:", req.body);

    const { requestId, rejection_reason } = req.body;


    if (!requestId) {
      console.log("Missing requestId");
      return res.status(400).json({ error: "requestId is required" });
    }

    const result = await pool.query(
      "UPDATE requests SET status=$1 , faculty_status = $2, rejection_reason = $4 WHERE id = $3",
      ['Rejected','Rejected', requestId,rejection_reason]
    );

    console.log("Update result:", result);
    res.status(200).json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("Server error in faculty/reject route:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


// ✅ Authority: Get all requests forwarded to this authority
router.get('/authority/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM requests 
       WHERE authority_email = $1 AND is_forwarded_to_authority = true`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No forwarded requests found for this authority' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Authority: Accept or reject request
router.post('/authority/decision', async (req, res) => {
  const { requestId, decision } = req.body;
  try {
    await pool.query(
      `UPDATE requests 
       SET authority_status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [decision, requestId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: `Request ${decision}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resend-request', async (req, res) => {
  

  try {
    const { requestId, faculty_email } = req.body;
    console.log("Resend request received with ID:", requestId);

    const currentTimestamp = new Date();

    // Update the request status back to "Pending" or "Faculty Pending"
    const result = await pool.query(
      `UPDATE requests
       SET status = $1, faculty_status = $2,authority_status = 'Pending',is_forwarded_to_authority = false, updated_at = $3, rejection_reason = NULL
       WHERE id = $4 AND faculty_email = $5
       RETURNING *`,
      ['Pending', 'Pending', currentTimestamp, requestId, faculty_email]
    );
    console.log("Update result:", result);
    if (result.rows.length === 0) {
      console.log("No request found with the given ID");
      return res.status(404).json({ message: 'Request not found or unauthorized.' });
    }

    const requestData = result.rows[0];

    // Send the email to faculty again
    const student_email = requestData.student_email;
    const mailOptions = {
      from: student_email,
      to: faculty_email,
      subject: `Resent Request for ${requestData.event_name}`,
      text: `The request for event "${requestData.event_name}" has been resent for your approval.`
    };

    const transporter = createTransporter('volunteer');
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Request resent successfully and email sent.' });
  } catch (error) {
    console.error('Error resending request:', error);
    res.status(500).json({ message: 'Failed to resend request', error: error.message });
  }
});


module.exports = router;
