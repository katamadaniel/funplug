// Header.js
import React from 'react';
import {useNavigate} from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };
  const handleSignup = () => {
    navigate('/signup');
  };
  
  return (
    <header className="header">
      <div alt="Logo" className="logo">FunPlug</div>
      <nav className="nav">
        <button className="nav-button" onClick={handleLogin}>Login</button>
        <button className="nav-button" onClick={handleSignup}>Signup</button>
      </nav>
    </header>
  );
};

export default Header;
