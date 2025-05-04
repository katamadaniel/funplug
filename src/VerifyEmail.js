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

const API_URL = process.env.REACT_APP_API_URL;

const VerifyEmail = () => {
  const { token } = useParams(); // Extract token from the URL
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false); 

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}api/users/verify-email/${token}`);
        setMessage(response.data.message);
        setSuccess(true);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Email verification failed.');
        setSuccess(false);
      } finally {
        setLoading(false); 
      }
    };

    verifyEmail();
  }, [token]);

  const handleNavigateToLogin = () => {
    navigate('/login');
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