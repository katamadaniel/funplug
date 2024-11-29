import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import './Header.css';

const DEFAULT_AVATAR_URL = '/default-avatar.png'; 

const Header = ({ isAuthenticated, onLogout, user }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for menu
  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget); // Open menu at clicked element
  };

  const handleCloseSettings = () => {
    setAnchorEl(null); // Close the menu
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleCloseSettings(); // Close menu after clicking an option
  };

  return (
    <header className="header">
      <div className="logo">FunPlug</div>
      <nav className="nav">
        {!isAuthenticated ? (
          <>
            <button className="nav-button" onClick={handleLogin}>Login</button>
            <button className="nav-button" onClick={handleSignup}>Signup</button>
          </>
        ) : (
          <>
            <button className="nav-button" onClick={handleLogout}>Logout</button>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleSettingsClick}>
                  <Avatar
                    src={user.avatar ? `data:image/png;base64,${user.avatar}` : DEFAULT_AVATAR_URL}
                    alt={user.username ? `${user.username}'s avatar` : 'User avatar'}
                    sx={{ width: 40, height: 40 }}
                  />
                </IconButton>
                <IconButton onClick={handleSettingsClick}>
                  <SettingsIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseSettings}
                >
                  <MenuItem onClick={() => handleMenuItemClick('/change-password')}>Change Password</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('/delete-account')}>Delete Account</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('/terms-and-agreement')}>Terms and Agreement</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('/report-problem')}>Report a Problem</MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('/contact-support')}>Contact Support</MenuItem>
                </Menu>
              </Box>
            )}
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
