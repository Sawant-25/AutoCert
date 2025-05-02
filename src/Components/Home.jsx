import React from 'react'
import { NavLink, Outlet } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* <h1>Welcome to AutoCert</h1> */}
        {/* Optional Navigation inside Home */}
        {/* <nav>
        <NavLink to="student" style={{ marginRight: '10px' }}>Student</NavLink>
        <NavLink to="faculty" style={{ marginRight: '10px' }}>Faculty</NavLink>
        <NavLink to="higher-authority">Higher Authority</NavLink>
      </nav> */}

      {/* 👇 This renders nested child routes like /home/student */}
      <Outlet />
    </div>
  )
}

export default Home
