// src/Components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Navbar />
      
        <Outlet /> {/* This will load the child route component */}
      
    </>
  );
};

export default Layout;
