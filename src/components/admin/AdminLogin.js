import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Avatar, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';

const ADMIN_API_URL = 'http://localhost:5000/api/admins';

const AdminLogin = ({ setAdminAuthenticated, setAdmin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchProfile = async (token, adminId) => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/profile/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(response.data); // Store the fetched profile data
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      setError('Failed to fetch profile. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${ADMIN_API_URL}/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, adminId } = response.data;

      if (token && adminId) {
        // Store token and adminId in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminId', adminId);

        setAdminAuthenticated(true);

        // Fetch and set admin profile
        await fetchProfile(token, adminId);

        navigate('/dashboard');
      } else {
        throw new Error('Missing token or admin ID in response');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${ADMIN_API_URL}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setIsLoginMode(true); // Switch back to login mode after successful registration
      setError(''); // Clear any errors
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create an admin account.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (isLoginMode) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center' }}>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        {isLoginMode ? 'Admin Login' : 'Create Admin Account'}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        {!isLoginMode && (
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            autoFocus
          />
        )}
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          autoFocus={isLoginMode}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {isLoginMode ? 'Login' : 'Register'}
        </Button>
        <Link onClick={() => setIsLoginMode((prev) => !prev)} variant="body2" sx={{ cursor: 'pointer' }}>
          {isLoginMode ? 'Create an Admin Account' : 'Already have an account? Login'}
        </Link>
      </Box>
    </Box>
  );
};

export default AdminLogin;
