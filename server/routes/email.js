// const express = require('express');
// const nodemailer = require('nodemailer');
// const router=express.Router();
// // const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get('/', (req, res) => {
//   res.send('Server is up!');
// });
// app.post('/send-email', async (req, res) => {
//   const { to, subject, text } = req.body;

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER, // Your email
//       pass: process.env.EMAIL_PASS  // App password or real password (if less secure apps allowed)
//     }
//   });
//   // console.log('Using Email:', process.env.EMAIL_USER);
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Email error:', error);
//     res.status(500).json({ message: 'Failed to send email' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const pool=require('../db');

const createTransporter=(fromRole)=>{
  let transporter;
if (fromRole === 'volunteer') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.VOLUNTEER_EMAIL_USER,
      pass: process.env.VOLUNTEER_EMAIL_PASS
    }
  });
} else if (fromRole === 'faculty') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.FACULTY_EMAIL_USER,
      pass: process.env.FACULTY_EMAIL_PASS
    }
  });
} else if (fromRole === 'higher_authority') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTHORITY_EMAIL_USER,
      pass: process.env.AUTHORITY_EMAIL_PASS
    }
  });
}
return transporter;
}

router.post('/send-email', async (req, res) => {
  const { 
    student_email,
    faculty_email,
     subject,
     message,
     event_name,
     event_date,
     fromRole } = req.body;
     console.log('Received request body:', req.body);
       // Set default values for remaining fields
  const authority_email = null; // initially unknown, faculty will fill later
  const faculty_status = 'Pending';
  const authority_status = 'Pending';
  const is_forwarded_to_authority = false;

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // });

  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to:faculty_email,
  //   subject:subject,
  //   text:message
  // };
// Set transporter based on role (for Option 1)
const transporter=createTransporter(fromRole);

if (!transporter) {
  // Log the failure and return an error response
  console.error(`Failed to create transporter for role: ${fromRole}. Check role value and .env variables.`);
  return res.status(500).json({ message: 'Internal server error: Could not configure email sender.' });
}

const mailOptions = {
  from: transporter.options.auth.user,
  to: faculty_email,
  subject: `Request from ${student_email} (${fromRole}) - ${subject}`,
  text: `${message} \n\n Sent by: ${student_email} (Role: ${fromRole})`
};

  try {
    // step1-Send Email
    await transporter.sendMail(mailOptions);
    // Step 2: Insert into requests table with status "Pending" 
    const currentTimestamp = new Date();
    const result = await pool.query(
      `INSERT INTO requests 
        (student_email, faculty_email, subject, message, status, created_at, updated_at,authority_email,event_name, event_date,faculty_status, authority_status, is_forwarded_to_authority)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [student_email, faculty_email, subject, message, 'Pending', currentTimestamp, currentTimestamp,authority_email,
        event_name,
        event_date,
        faculty_status,
        authority_status,
        is_forwarded_to_authority]
    );

    res.status(200).json({ message: 'Email sent successfully',request:result.rows[0] });
  } catch (error) {
    // ✅ Debug: Log the insert failure and data
    console.error('Insert failed. Data sent:', {
      student_email,
      faculty_email,
      subject,
      message,
      event_name,
      event_date
    });
    // console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email or save request' ,error:error.message});
  }
});
router.post('/reject-request', async (req, res) => {
  const { requestId, faculty_email, reason } = req.body; // `requestId` is passed to identify the request
  
  try {
    const currentTimestamp = new Date();

    // Update the request status to "Rejected"
    const result = await pool.query(
      `UPDATE requests
       SET status = $1, faculty_status = $2, updated_at = $3, rejection_reason = $4
       WHERE id = $5 AND faculty_email = $6
       RETURNING *`,
      ['Rejected', 'Rejected', currentTimestamp, reason, requestId, faculty_email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found or unauthorized.' });
    }

    // Send rejection email to student
    const student_email = result.rows[0].student_email;
    const mailOptions = {
      from: faculty_email, // Faculty email as the sender
      to: student_email,
      subject: 'Request Rejected',
      text: `Your request for the event "${result.rows[0].event_name}" has been rejected.\n\nReason: ${reason}`
    };

    const transporter = createTransporter('faculty');
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Request rejected successfully and email sent.' });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
});
module.exports = router;
