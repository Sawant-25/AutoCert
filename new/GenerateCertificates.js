/*import React from 'react';
import { jsPDF } from 'jspdf';

const generateCertificate = (data, template) => {
  const doc = new jsPDF();
  doc.addImage(template, 'JPEG', 10, 10, 180, 130); // Place template image

  doc.setFontSize(20);
  doc.text(`Event: ${data['Event Name'] || 'N/A'}`, 20, 60);
  doc.text(`Date: ${data['Date'] || 'N/A'}`, 20, 80);
  doc.text(`Participant: ${data['Participant Name'] || 'Unknown'}`, 20, 100);
  doc.text(`Status: ${data['Status'] || 'N/A'}`, 20, 120);

  return doc;
};

const GenerateCertificates = ({ participants, template }) => {
  const handleGenerateAll = () => {
    const certificateFiles = [];

    participants.forEach((participant, index) => {
      const doc = generateCertificate(participant, template);
      const fileName = `${participant['Participant Name']}_certificate_${index + 1}.pdf`;

      const pdfData = doc.output('arraybuffer');
      certificateFiles.push({
        fileName,
        pdfData
      });
    });

    // Send the generated certificates along with participant info to the backend
    sendCertificates(certificateFiles, participants);
  };

  const sendCertificates = (certificateFiles, participants) => {
    const formData = new FormData();

    // Assuming the Excel file was already uploaded before
    // You need to send the Excel file again or handle it properly on the server
    // For simplicity, let's assume the Excel file is still accessible

    // Append certificate files
    certificateFiles.forEach(file => {
      const blob = new Blob([file.pdfData], { type: 'application/pdf' });
      formData.append('certificates', blob, file.fileName);
    });

    // Send participant details as JSON
    formData.append('participantsData', JSON.stringify(participants));

    // Send POST request to the backend
    fetch('http://localhost:5000/send-certificates', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log('Certificates sent successfully:', data);
      })
      .catch(error => {
        console.error('Error sending certificates:', error);
      });
  };

  return (
    <div>
      <button onClick={handleGenerateAll}>Generate and Send Certificates</button>
    </div>
  );
};

export default GenerateCertificates;
*/
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';

const generateCertificate = (
  data,
  template,
  logoData,
  signatures = {},
  sponsors = {}
) => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Background template
  if (template) {
    doc.addImage(template, 'PNG', 0, 0, pageWidth, pageHeight);
  }

  // College logo and KIT College of Engineering text
  if (logoData) {
    const logoX = 10;
    const logoY = 10;
    const logoWidth = 70;
    const logoHeight = 40;
    doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);

    doc.setFont('Times', 'bold');
    doc.setFontSize(16);
    doc.text('KIT College of Engineering', logoX + logoWidth + 10, logoY + 25);
  }

  // Certificate title
  doc.setFont('Arial', 'bold');
  doc.setFontSize(30);
  doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 60, { align: 'center' });

  // Body content
  doc.setFont('Times', 'normal');
  doc.setFontSize(18);

  const participantName = data['Participant Name'] || 'Unknown';
  const status = data['Status'] || 'N/A';
  const eventName = data['Event Name'] || 'N/A';
  const eventDate = data['Date'] || 'N/A';

  const content = [
    `This is to certify that ${participantName},`,
    `${status} in the Event "${eventName} during "PIONEER 2024", ",`,
    `organized on ${eventDate} under ACSES.`,
  ];

  content.forEach((line, i) => {
    doc.text(line, pageWidth / 2, 90 + i * 20, { align: 'center' });
  });

  // Signatures
  const signatureRoles = [
    { role: 'Secretary', name: 'Mr. R. Singh', image: signatures.hod },
    { role: 'President', name: 'Ms. P. Verma', image: signatures.hod },
    { role: 'Director', name: 'Dr. K. R. Iyer', image: signatures.hod },
    { role: 'Head of Department', name: 'Dr. A. B. Sharma', image: signatures.hod }
  ];

  const totalSignatures = signatureRoles.length;
  const spacing = pageWidth / (totalSignatures + 1);
  const sigY = pageHeight - 80;
  const sigHeight = 15;
  const sigWidth = 30;

  signatureRoles.forEach((sig, index) => {
    const x = spacing * (index + 1) - sigWidth / 2;

    if (sig.image) {
      doc.addImage(sig.image, 'PNG', x, sigY, sigWidth, sigHeight);
    }

    doc.setFont('Times', 'italic');
    doc.setFontSize(12);
    doc.text(sig.name, x + sigWidth / 2, sigY + sigHeight + 8, { align: 'center' });
    doc.text(sig.role, x + sigWidth / 2, sigY + sigHeight + 18, { align: 'center' });
  });

  // Sponsored by
  doc.setFont('Arial', 'bold');
  doc.setFontSize(16);
  doc.text('Sponsored by', pageWidth / 2, pageHeight - 30, { align: 'center' });

  const sponsorY = pageHeight - 25;
  const sponsorWidth = 40;
  const sponsorHeight = 20;
  const sponsorSpacing = pageWidth / 4;

  const sponsorImages = [sponsors.sponsor1, sponsors.sponsor2, sponsors.sponsor3];
  sponsorImages.forEach((sponsor, index) => {
    const x = sponsorSpacing * (index + 1) - sponsorWidth / 2;
    if (sponsor) {
      doc.addImage(sponsor, 'PNG', x, sponsorY, sponsorWidth, sponsorHeight);
    }
  });

  return doc;
};

const GenerateCertificates = ({ participants, template }) => {
  const [assets, setAssets] = useState({
    logo: null,
    signatures: {
      secretary: null,
      president: null,
      director: null,
      hod: null
    },
    sponsors: {
      sponsor1: null,
      sponsor2: null,
      sponsor3: null
    }
  });

  useEffect(() => {
    fetch('http://localhost:5000/college-assets')
      .then(response => response.json())
      .then(data => {
        setAssets({
          logo: data.logo,
          signatures: {
            secretary: data.hodSignature,
            president: data.hodSignature,
            director: data.hodSignature,
            hod: data.hodSignature
          },
          sponsors: {
            sponsor1: data.sponsor1,
            sponsor2: data.sponsor2,
            sponsor3: data.sponsor3
          }
        });
      })
      .catch(error => {
        console.error('Error fetching college assets:', error);
      });
  }, []);

  const handleGenerateAll = () => {
    const certificateFiles = participants.map((participant, index) => {
      const doc = generateCertificate(
        participant,
        template,
        assets.logo,
        assets.signatures,
        assets.sponsors
      );
      const fileName = `${participant['Participant Name']}_certificate_${index + 1}.pdf`;
      const pdfData = doc.output('arraybuffer');
      return { fileName, pdfData };
    });

    sendCertificates(certificateFiles, participants);
  };

  const sendCertificates = (certificateFiles, participants) => {
    const formData = new FormData();
    certificateFiles.forEach(file => {
      const blob = new Blob([file.pdfData], { type: 'application/pdf' });
      formData.append('certificates', blob, file.fileName);
    });
    formData.append('participantsData', JSON.stringify(participants));

    fetch('http://localhost:5000/send-certificates', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Certificates sent successfully:', data);
        alert('Certificates sent successfully!');
      })
      .catch(error => {
        console.error('Error sending certificates:', error);
        alert('Failed to send certificates.');
      });
  };

  return (
    <div>
      <button
        onClick={handleGenerateAll}
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
          marginBottom: '50px',
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
        Generate and Send Certificates
      </button>
    </div>
  );
};

export default GenerateCertificates; 