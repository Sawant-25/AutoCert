import React from 'react'
import { Link ,NavLink} from 'react-router-dom';
import './Navbar.css'

const Navbar = () => {
  return (
    // <a> tag refresh whole webpage everytime so we use either Link tag or NavLink tag from react.
//     The <NavLink> component gives you the isActive prop out of the box, which makes it super convenient for:

// Highlighting the currently active route

// Adding active styles dynamically

// Writing cleaner code without manually checking the route


    
    <nav className='main-navbar'>
      <ul>
        <li>
            {/* <Link to='/'> Home </Link> */}
            <NavLink to='/' className={({isActive})=> isActive? "active-link":""}> Login </NavLink>
        </li>
        <li>
            {/* <Link to='/dashboard'> Dashboard </Link> */}
            <NavLink to='/home' className={({isActive})=> isActive? "active-link":""}> Home </NavLink>
        </li>
        <li>
            {/* <Link to='/about'> About Us </Link> */}
            <NavLink to='/about' className={({isActive})=> isActive? "active-link":""}> About Us </NavLink>
        </li>
        <li>
            {/* <Link to='/contact'> Contact Us </Link> */}
            <NavLink to='/contact' className={({isActive})=> isActive? "active-link":""}> Contact Us </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
