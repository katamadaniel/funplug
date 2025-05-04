import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchProfile, resendVerification } from './services/userService';
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setErrors({});
    setError('');
    setResendMessage('');
    setLoading(true);
  
    try {
      const { token } = await login(formData);
      localStorage.setItem('token', token);
  
      const profile = await fetchProfile(token);
  
      if (profile.warningCount >= 3) {
        setError('Your account has been banned due to multiple warnings. Please contact support.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return;
      }
  
      if (!profile.isVerified) {
        const createdAt = new Date(profile.createdAt);
        const hoursSinceSignup = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  
        if (hoursSinceSignup > 24) {
          // Token expired — trigger resend
          await resendVerification(formData.email);
          setError('Your verification link has expired. A new verification email has been sent.');
          setResendMessage('Please check your inbox and verify your account before logging in.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          return;
        }
      }
  
      setUser(profile);
      setIsAuthenticated(true);
      navigate('/profile');
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.response?.data?.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && (
          <Typography color="error" sx={{ mt: 1, mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {resendMessage && (
          <Typography color="primary" sx={{ mt: 1, mb: 2 }}>
            {resendMessage}
          </Typography>
        )}

        <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Login'}
        </Button>

      </Box>
      {/* <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
        Login with Google
      </Button> */}
      <Typography align="center" sx={{ mt: 2 }}>
        Don't have an account? <a href="/signup">Signup here</a>
      </Typography>
      <Typography align="center" sx={{ mt: 1 }}>
        <a href="/reset">Forgot Password?</a>
      </Typography>
    </Container>
  );
};

export default Login;
