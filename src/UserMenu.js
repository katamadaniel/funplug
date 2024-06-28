import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from './services/userService';
import './UserMenu.css';

const UserMenu = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser(); // Assuming you have a logout function in userService
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="user-menu">
      <div className="logo">
        <img src="/path/to/logo.png" alt="App Logo" />
      </div>
      <div className="nav-links">
        <Link to="/profile">Profile</Link>
        <Link to="/events">Events</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/notifications">Notifications</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="user-info">
        <img src={user.avatar} alt={`${user.username}'s avatar`} className="avatar" />
        <span>{user.username}</span>
      </div>
    </div>
  );
};

export default UserMenu;
