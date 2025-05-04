import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Avatar, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { loginAdmin, registerAdmin, fetchAdminProfile } from '../../services/adminService';

const AdminLogin = ({ setAdminAuthenticated, setAdmin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const { token } = await loginAdmin(formData.email, formData.password);
      
      if (!token) throw new Error('Missing token in login response.');

      // Fetch and set admin profile
      const adminProfile = await fetchAdminProfile();
      setAdmin(adminProfile);
      setAdminAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleRegister = async () => {
    try {
      await registerAdmin(formData.name, formData.email, formData.password);
      setIsLoginMode(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
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
