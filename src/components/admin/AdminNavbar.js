import React, { useEffect } from 'react'
import { AppBar, Toolbar, Typography, Avatar, Box, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const PROFILE_API_URL = `${API_URL}/api/admins/profile`;

const AdminNavbar = ({ admin, setAdminAuthenticated, setAdmin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setAdminAuthenticated(false);
          navigate('/admin');
          return;
        }

        const response = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(response.data); // Set fetched admin data
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        if (error.response && error.response.status === 401) {
          // If unauthorized, log out and navigate to the admin login page
          handleLogout();
        }
      }
    };

    if (!admin) {
      fetchAdminProfile(); // Fetch admin profile only if not already set
    }
  }, [admin, setAdmin, setAdminAuthenticated, navigate]);

  const handleLogout = () => {
    // Clear the admin token from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setAdminAuthenticated(false); // Update authentication state
    setAdmin(null);
    navigate('/admin');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.dark' }}>
        <Toolbar>
        {/* Logo or Title on the left */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Portal
        </Typography>

        {/* Avatar and Logout Button on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          {/* Admin Avatar */}
          <Avatar
            alt={admin?.name || 'Admin'}
            src={admin?.avatarUrl ? `${API_URL}${admin.avatarUrl}` : '/default-avatar.png'}
            sx={{ mr: 2, bgcolor: 'secondary.main', width: 40, height: 40 }}
          />

          {/* Logout Button */}
          <Button
            color="inherit"
            onClick={handleLogout}  // Use the new handleLogout function
            startIcon={<LogoutIcon />}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
