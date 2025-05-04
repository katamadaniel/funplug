import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { fetchAdminProfile } from '../../services/adminService';

const API_URL = process.env.REACT_APP_API_URL;

const AdminNavbar = ({ admin, setAdminAuthenticated, setAdmin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setAdminAuthenticated(false);
          navigate('/admin');
          return;
        }

        const adminData = await fetchAdminProfile();
        setAdmin(adminData);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        handleLogout(); // If token is invalid or expired
      }
    };

    if (!admin) {
      loadProfile();
    }
  }, [admin, setAdmin, setAdminAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setAdminAuthenticated(false);
    setAdmin(null);
    navigate('/admin');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.dark' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Portal
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Avatar
            alt={admin?.name || 'Admin'}
            src={admin?.avatarUrl ? `${API_URL}${admin.avatarUrl}` : '/default-avatar.png'}
            sx={{ mr: 2, bgcolor: 'secondary.main', width: 40, height: 40 }}
          />

          <Button
            color="inherit"
            onClick={handleLogout}
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
