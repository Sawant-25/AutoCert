/*import React from 'react';
import Sidebar from './Sidebar';
import './App.css';
import About from './About';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <About/>
      <div className="content">
        <h1>Welcome to the Sidebar Application!</h1>
        <p>Click the tabs on the sidebar to explore different sections.</p>
      </div>
    </div>
  );
}

export default App;*/
/*import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { TemplateSelector } from './TemplateSelector';
import { CertificateGenerator } from './CertificateGenerator';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [template, setTemplate] = useState(null);

  const handleFileUpload = (fileData) => {
    setData(fileData);
  };

  const handleTemplateSelect = (selectedTemplate) => {
    setTemplate(selectedTemplate);
  };

  return (
    <div className="App">
      <h1>Event Certificate Generator</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <TemplateSelector onTemplateSelect={handleTemplateSelect} />
      {data.length > 0 && template && (
        <CertificateGenerator participants={data} template={template} />
      )}
    </div>
  );
};

export default App;

*/
// App.js
import React, { useState } from 'react';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import CertificateGrid from './components/CertificateGrid';
import GenerateCertificates from './components/GenerateCertificates';

function Home() {
  return <h2>Welcome to AutoCert!</h2>;
}

function About() {
  return <h2>About AutoCert</h2>;
}

function Contact() {
  return <h2>Contact Us</h2>;
}

function Login() {
  return <h2>Login Page</h2>;
}

function App() {
  const [participants, setParticipants] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [assets, setAssets] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/college-assets')
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error('Error loading assets:', err));
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <h1>AutoCert</h1>
        <FileUpload onFileUpload={setParticipants} />
        {participants.length > 0 && (
          <>
            <CertificateGrid onSelectTemplate={setSelectedTemplate} />
            {selectedTemplate && (
              <GenerateCertificates participants={participants} template={selectedTemplate} />
            )}
          </>
        )}
      </div>
      </BrowserRouter>
  );
}

export default App;
