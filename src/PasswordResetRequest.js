import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './services/axiosInstance';
import { parseApiError } from './utils/errorHandler';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const navigate = useNavigate();

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await axiosInstance.post(`${USERS_API_URL}/request-password-reset`, { email });
      showToast('Password reset link has been sent to your email', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      const parsedError = parseApiError(err);
      
      if (parsedError.isValidationError) {
        setErrors(parsedError.fieldErrors);
        showToast(parsedError.message, 'warning');
      } else {
        showToast(parsedError.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <Typography variant="h4" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Enter your email address to receive a password reset link
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: '100%' }}
        >
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Box>

        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PasswordResetRequest;
