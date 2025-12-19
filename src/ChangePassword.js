import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from './services/userService';
import { Container, Typography, TextField, Button } from '@mui/material';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateNewPassword = () => {
    let validationError = '';

    if (!newPassword) {
      validationError = 'Password is required';
    } else if (newPassword.length < 8) {
      validationError = 'Password must be at least 8 characters long';
    } else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      validationError = 'Password must contain both letters and numbers';
    }

    return validationError;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate new password
    const passwordError = validateNewPassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Password successfully changed');

      // Log the user out by removing the token and redirecting to the login page
      localStorage.removeItem('token');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Optional delay to show success message
    } catch (error) {
      setError('Error changing password: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Change Password
      </Typography>
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      {success && <Typography color="primary" variant="body2">{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          helperText="Password must be at least 8 characters long and contain both letters and numbers"
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ display: 'block', margin: '20px auto' }}>
          Change Password
        </Button>
      </form>
    </Container>
  );
};

export default ChangePassword;
