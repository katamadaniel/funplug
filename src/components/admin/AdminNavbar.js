import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Button, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate } from 'react-router-dom';
import { fetchAdminProfile } from '../../services/adminService';
import { useThemeMode } from '../../theme/ThemeContext';

const API_URL = process.env.REACT_APP_API_URL;

const AdminNavbar = ({ admin, setAdminAuthenticated, setAdmin }) => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

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
        handleLogout();
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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: (theme) => theme.palette.mode === "dark"
          ? "rgba(18,26,45,0.82)"
          : "rgba(20,15,45,0.94)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Portal
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              sx={{ mr: 1 }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

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
