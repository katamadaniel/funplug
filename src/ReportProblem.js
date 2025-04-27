import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;
const PROBLEM_API_URL = `${API_URL}/api/report/problem`;

const ReportProblem = () => {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Assuming the user ID is stored in localStorage after login
  const userId = localStorage.getItem('userId');

  const handleReportProblem = async () => {
    if (!problem) {
      setAlertMessage('Please describe the problem.');
      return;
    }

    setLoading(true);
    setAlertMessage('');

    try {
      const response = await axios.post(PROBLEM_API_URL, {
        userId, // Use the logged-in user ID
        problemDescription: problem,
      });

      if (response.status === 201) {
        setAlertMessage('Problem reported successfully!');
        setProblem(''); // Clear the input field
      } else {
        setAlertMessage('Failed to report the problem');
      }
    } catch (error) {
      console.error('Error reporting problem:', error);
      setAlertMessage('Error reporting problem');
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
          <Alert severity="info">{alertMessage}</Alert>
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
