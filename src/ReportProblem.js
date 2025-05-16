import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axiosInstance from './services/axiosInstance';
import { fetchProfile } from './services/userService';

const API_URL = process.env.REACT_APP_API_URL;
const PROBLEM_API_URL = `${API_URL}/api/report/problem`;

const ReportProblem = () => {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [userId, setUserId] = useState(null);

    // Get authenticated user profile
    useEffect(() => {
      const getUser = async () => {
        try {
          const user = await fetchProfile();
          setUserId(user._id);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };
      getUser();
    }, []);
  
  const handleReportProblem = async () => {
    if (!problem.trim()) {
      setAlertMessage('Please describe the problem.');
      setAlertSeverity('warning');
      return;
    }

    if (!userId) {
      setAlertMessage('User not logged in. Please log in to report an issue.');
      setAlertSeverity('error');
      return;
    }

    setLoading(true);
    setAlertMessage('');

    try {
      const response = await axiosInstance.post(PROBLEM_API_URL, {
        userId,
        problemDescription: problem.trim(),
      });

      if (response.status === 201) {
        setAlertMessage('Problem reported successfully!');
        setAlertSeverity('success');
        setProblem('');
      } else {
        setAlertMessage('Something went wrong. Please try again.');
        setAlertSeverity('error');
      }
    } catch (error) {
      console.error('Error reporting problem:', error);
      setAlertMessage(
        error?.response?.data?.message || 'Failed to report the problem.'
      );
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Report a Problem
      </Typography>
      {alertMessage && (
        <Box mb={2}>
          <Alert severity={alertSeverity}>{alertMessage}</Alert>
        </Box>
      )}
      <TextField
        label="Describe the problem"
        multiline
        rows={6}
        variant="outlined"
        fullWidth
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Describe the issue you are facing"
      />
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          sx={{ display: 'block', margin: '20px auto' }}
          onClick={handleReportProblem}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Reporting...' : 'Report Problem'}
        </Button>
      </Box>
    </Container>
  );
};

export default ReportProblem;
