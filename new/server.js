/*require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for all origins (for development)
app.use(cors());

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'certificates/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Endpoint to handle certificate sending
app.post('/send-certificates', upload.fields([
  { name: 'participantsFile', maxCount: 1 },
  { name: 'certificates', maxCount: 1000 }  // Increased max count for certificates
]), async (req, res) => {
  try {
    const participantsFile = req.files['participantsFile']?.[0];
    const certificateFiles = req.files['certificates'];

    if (!participantsFile) {
      return res.status(400).json({ error: 'No Excel file uploaded.' });
    }

    if (!certificateFiles || certificateFiles.length === 0) {
      return res.status(400).json({ error: 'No certificates uploaded.' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(participantsFile.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const participants = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Invalid Excel data.' });
    }

    // Debugging Info
    console.log('Participants:', participants);
    console.log('Uploaded Certificates:', certificateFiles.map(file => file.path));

    let successfulEmails = [];
    let failedEmails = [];

    // Send emails asynchronously
    const emailPromises = participants.map((participant, index) => {
      return new Promise((resolve) => {
        if (!participant.email) {
          console.log(`Skipping participant without email: ${participant['Participant Name']}`);
          return resolve({ email: participant['Participant Name'], status: 'skipped' });
        }

        const certificate = certificateFiles[index % certificateFiles.length]; // Handle mismatch in count

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: participant.email,
          subject: 'Your Certificate for the Event',
          text: `Dear ${participant['Participant Name'] || 'Participant'},\n\nCongratulations on your participation! Attached is your certificate.\n\nBest Regards,\nEvent Team`,
          attachments: [{ path: certificate.path }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Error sending email to ${participant.email}:`, error);
            failedEmails.push({ email: participant.email, error: error.message });
          } else {
            console.log(`Email sent to ${participant.email}:`, info.response);
            successfulEmails.push(participant.email);
          }
          resolve(); // Resolve after each email is processed
        });
      });
    });

    await Promise.all(emailPromises); // Wait for all emails to be sent

    // Cleanup uploaded files
    certificateFiles.forEach(file => fs.unlinkSync(file.path));
    fs.unlinkSync(participantsFile.path);

    res.json({
      message: 'Certificates sent successfully!',
      successfulEmails,
      failedEmails
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use(cors());

// PostgreSQL client setup
const pool = new Pool({
  user: 'sp',
  host: 'localhost',
  database: 'database1',
  password: 'sp123',
  port: 5432,
});

// Multer storage for uploaded certificate PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'certificates/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Endpoint to fetch college logo and all 4 signatures
app.get('/college-assets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT name, image_data
      FROM college_assets
      WHERE name IN ('kit', 'signature1', 'signature1', 'signature1', 'signature1')
    `);

    const assets = result.rows.reduce((acc, row) => {
      const base64 = Buffer.from(row.image_data).toString('base64');
      switch (row.name) {
        case 'kit':
          acc.logo = `data:image/png;base64,${base64}`;
          break;
        case 'signature1':
          acc.hodSignature = `data:image/png;base64,${base64}`;
          break;
        case 'signature1':
          acc.secretarySignature = `data:image/png;base64,${base64}`;
          break;
        case 'signature1':
          acc.presidentSignature = `data:image/png;base64,${base64}`;
          break;
        case 'signature1':
          acc.directorSignature = `data:image/png;base64,${base64}`;
          break;
      }
      return acc;
    }, {});

    res.json(assets);
  } catch (error) {
    console.error('Failed to fetch college assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to handle certificate PDF uploads and email them
app.post('/send-certificates', upload.array('certificates'), async (req, res) => {
  try {
    const participantsData = JSON.parse(req.body.participantsData);
    const certificateFiles = req.files;

    if (!participantsData?.length || !certificateFiles?.length) {
      return res.status(400).json({ error: 'Missing participant data or certificates.' });
    }

    const emailPromises = participantsData.map((participant, index) => {
      return new Promise((resolve) => {
        if (!participant.email) {
          console.log(`Skipping participant without email: ${participant['Participant Name']}`);
          return resolve();
        }

        const certificate = certificateFiles[index % certificateFiles.length];
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: participant.email,
          subject: 'Your Certificate for the Event',
          text: `Dear ${participant['Participant Name'] || 'Participant'},\n\nCongratulations on your participation! Attached is your certificate.\n\nBest Regards,\nEvent Team`,
          attachments: [{ path: certificate.path }]
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error(`Error sending email to ${participant.email}:`, error);
          }
          resolve();
        });
      });
    });

    await Promise.all(emailPromises);

    // Cleanup uploaded files
    certificateFiles.forEach(file => fs.unlinkSync(file.path));

    res.json({ message: 'Certificates sent successfully!' });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


/*require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for all origins (for development)
app.use(cors());

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'certificates/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Endpoint to handle certificate sending
app.post('/send-certificates', upload.fields([
  { name: 'participantsFile', maxCount: 1 },
  { name: 'certificates', maxCount: 1000 }
]), async (req, res) => {
  try {
    const participantsFile = req.files['participantsFile']?.[0];
    const certificateFiles = req.files['certificates'];

    if (!participantsFile) {
      return res.status(400).json({ error: 'No Excel file uploaded.' });
    }

    if (!certificateFiles || certificateFiles.length === 0) {
      return res.status(400).json({ error: 'No certificates uploaded.' });
    }

    const workbook = XLSX.readFile(participantsFile.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const participants = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Invalid Excel data.' });
    }

    console.log('Participants:', participants);
    console.log('Uploaded Certificates:', certificateFiles.map(file => file.path));

    let successfulEmails = [];
    let failedEmails = [];

    const emailPromises = participants.map((participant, index) => {
      return new Promise((resolve) => {
        if (!participant.email) {
          console.log(`Skipping participant without email: ${participant['Participant Name']}`);
          return resolve({ email: participant['Participant Name'], status: 'skipped' });
        }

        const certificate = certificateFiles[index % certificateFiles.length];

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: participant.email,
          subject: 'Your Certificate for the Event',
          text: `Dear ${participant['Participant Name'] || 'Participant'},\n\nCongratulations on your participation! Attached is your certificate.\n\nBest Regards,\nEvent Team`,
          attachments: [{ path: certificate.path }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`Error sending email to ${participant.email}:`, error);
            failedEmails.push({ email: participant.email, error: error.message });
          } else {
            console.log(`Email sent to ${participant.email}:`, info.response);
            successfulEmails.push(participant.email);
          }
          resolve();
        });
      });
    });

    await Promise.all(emailPromises);

    certificateFiles.forEach(file => fs.unlinkSync(file.path));
    fs.unlinkSync(participantsFile.path);

    res.json({
      message: 'Certificates sent successfully!',
      successfulEmails,
      failedEmails
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: 'Internal server error.',
      details: error.message,
      stack: error.stack
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/ 