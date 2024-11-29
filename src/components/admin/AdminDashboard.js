import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography } from '@mui/material';
import UserStats from './UserStats';
import TicketStats from './TicketStats';
import EventStats from './EventStats';
import VenueStats from './VenueStats';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  return (
    <Container maxWidth="lg" sx={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4}>
        {/* User Stats Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              User Statistics
            </Typography>
            <UserStats />
          </Paper>
        </Grid>

        {/* Ticket Stats Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Ticket Statistics
            </Typography>
            <TicketStats />
          </Paper>
        </Grid>

        {/* Event Stats Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Event Statistics
            </Typography>
            <EventStats />
          </Paper>
        </Grid>

        {/* Venue Stats Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Venue Statistics
            </Typography>
            <VenueStats />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
