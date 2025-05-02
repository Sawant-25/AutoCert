import React from 'react';

const CertificateGrid = ({ onSelectTemplate }) => {
  const certificateFormats = [
    // Example certificate template images or components
    'CD.png', 
    'DB.png',
    'MG.png',
    'ML.png',
    'c1.png', 
    'c2.png',
    'c3.png',
    'c4.png',
    // Add more templates as needed
  ];
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {certificateFormats.map((format, index) => (
        <div
          key={index}
          style={{ borderRadius: '10px', border: '2px solid #ddd', padding: '10px', cursor: 'pointer' }}
          onClick={() => onSelectTemplate(format)}
        >
          <img src={format} alt={`certificate-template-${index}`} style={{ width: '100%', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
};

export default CertificateGrid;
