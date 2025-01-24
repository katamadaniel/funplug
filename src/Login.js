import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchProfile } from './services/userService';
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
    } else {
      setErrors({});
      setError('');
      try {
        const { token } = await login(formData);
        localStorage.setItem('token', token);

        // Fetch and set user profile
        const profile = await fetchProfile(token);
        
        // Check for warnings and banned status
        if (profile.warningCount >= 3) {
          setError('Your account has been banned due to multiple warnings. Please contact support.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          return;
        }

        setUser(profile);
        setIsAuthenticated(true);
        navigate('/profile'); // Redirect to profile after successful login
      } catch (error) {
        console.error('Error logging in:', error);
        setError(error.response?.data?.message || 'Error logging in');
      }
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
                <IconButton onClick={togglePasswordVisibility} edge="end">
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Login
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
