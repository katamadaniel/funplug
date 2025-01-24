import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';

const USERS_API_URL = 'http://localhost:5000/api/users';

const VerifyEmail = () => {
  const { token } = useParams(); // Extract token from the URL
  const navigate = useNavigate(); // Navigation hook
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [success, setSuccess] = useState(false); // Track success status

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/verify-email/${token}`);
        setMessage(response.data.message);
        setSuccess(true); // Email verification successful
      } catch (error) {
        setMessage(error.response?.data?.message || 'Email verification failed.');
        setSuccess(false); // Email verification failed
      } finally {
        setLoading(false); // Stop loading once the API call is complete
      }
    };

    verifyEmail();
  }, [token]);

  const handleNavigateToLogin = () => {
    navigate('/login'); // Navigate to the login page
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom>
          Email Verification
        </Typography>
        <Alert severity={success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
        {success && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToLogin}
          >
            Go to Login
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;