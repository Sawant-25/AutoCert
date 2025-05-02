import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const FileUpload = ({ onFileUpload }) => {
  const [excelFile, setExcelFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Required headers - must match exactly
      const requiredHeaders = ['event name', 'date', 'participant name', 'email', 'status'];

      // Extract headers from the first row of the file
      const uploadedHeaders = json.length > 0 ? Object.keys(json[0]).map(h => h.trim().toLowerCase()) : [];

      // Check for missing headers
      const missingHeaders = requiredHeaders.filter(header => !uploadedHeaders.includes(header));

      if (missingHeaders.length > 0) {
        alert(`Missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      console.log(json);
      onFileUpload(json);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '25vh', textAlign: 'center' }}>
      <p style={{ maxWidth: '600px', fontSize: '16px', marginBottom: '20px', color: '#333' }}>
        Please upload an Excel file with any number of columns, but it must include the following headers <strong>exactly as shown</strong>: <em>event name</em>, <em>date</em>, <em>participant name</em>, <em>email</em>, and <em>status</em>.
      </p>

      <input
        type="file"
        id="fileUpload"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => document.getElementById('fileUpload').click()}
        style={{
          backgroundColor: 'navy',
          color: 'white',
          border: '4px solid royalblue',
          padding: '12px 24px',
          fontSize: '18px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'royalblue';
          e.target.style.borderColor = 'navy';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'navy';
          e.target.style.borderColor = 'royalblue';
        }}
      >
        Choose Excel File
      </button>
    </div>
  );
};

export default FileUpload;


/*import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const FileUpload = ({ onFileUpload }) => {
  const [excelFile, setExcelFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      console.log(json);
      onFileUpload(json);
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadToServer = async () => {
    if (!excelFile) {
      alert('Please upload an Excel file first.');
      return;
    }

    const formData = new FormData();
    formData.append('participantsFile', excelFile);

    try {
      const response = await fetch('http://localhost:5000/send-certificates', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Server Response:', result);
      alert(result.message);
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload files.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '15vh' }}>
      <div>
        <input
          type="file"
          id="fileUpload"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('fileUpload').click()}
          style={{
            backgroundColor: 'navy',
            color: 'white',
            border: '4px solid royalblue',
            padding: '12px 24px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            marginBottom: '50px', // Added margin to reduce space from navbar
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'royalblue';
            e.target.style.borderColor = 'navy';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'navy';
            e.target.style.borderColor = 'royalblue';
          }}
        >
          Choose Excel File
        </button>
      </div>
    </div>
  );
};


export default FileUpload;*/
/*import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const FileUpload = ({ onFileUpload }) => {
  const [excelFile, setExcelFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      console.log(json);
      onFileUpload(json);
    };
    reader.readAsBinaryString(file);
  };

  const handleUploadToServer = async () => {
    if (!excelFile) {
      alert('Please upload an Excel file first.');
      return;
    }

    const formData = new FormData();
    formData.append('participantsFile', excelFile);

    try {
      const response = await fetch('http://localhost:5000/send-certificates', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('Raw Server Response:', text);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = JSON.parse(text);
      console.log('Parsed Server Response:', result);
      alert('Certificates sent successfully!');
    } catch (error) {
      console.error('Upload Error:', error);
      alert(`Failed to upload files: ${error.message}`);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleUploadToServer}>Upload to Server</button>
    </div>
  );
};

export default FileUpload;
*/ 