import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from './services/userService';
import { parseApiError } from './utils/errorHandler';
import { 
  Container, 
  Typography, 
  TextField, 
  Button,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validatePasswords = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain lowercase letters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase letters';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain numbers';
    } else if (!/[@$!%*?&]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain a special character (@$!%*?&)';
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate passwords
    const passwordErrors = validatePasswords();
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      showToast('Please fix the errors below', 'warning');
      return;
    }

    setLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      console.error('Error changing password:', error);
      const parsedError = parseApiError(error);

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

  const handleChange = (field, value) => {
    if (field === 'currentPassword') setCurrentPassword(value);
    else if (field === 'newPassword') setNewPassword(value);
    else if (field === 'confirmNewPassword') setConfirmNewPassword(value);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Change Password
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={currentPassword}
          onChange={(e) => handleChange('currentPassword', e.target.value)}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => handleChange('newPassword', e.target.value)}
          error={!!errors.newPassword}
          helperText={errors.newPassword || 'Min 8 chars, uppercase, lowercase, number, special char (@$!%*?&)'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={confirmNewPassword}
          onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
          error={!!errors.confirmNewPassword}
          helperText={errors.confirmNewPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
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
    </Container>
  );
};

export default ChangePassword;
