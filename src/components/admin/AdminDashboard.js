import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography } from '@mui/material';
import UserStats from './UserStats';
import TicketStats from './TicketStats';
import EventStats from './EventStats';
import VenueStats from './VenueStats';
import PerformanceStats from './PerformanceStats';
import ServiceStats from './ServiceStats';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <Container maxWidth="lg" sx={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4}>
        {/* User Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              User Statistics
            </Typography>
            <UserStats />
          </Paper>
        </Grid>

        {/* Ticket Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Ticket Statistics
            </Typography>
            <TicketStats />
          </Paper>
        </Grid>

        {/* Event Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Event Statistics
            </Typography>
            <EventStats />
          </Paper>
        </Grid>

        {/* Venue Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Venue Statistics
            </Typography>
            <VenueStats />
          </Paper>
        </Grid>

        {/* Performance Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Performance Statistics
            </Typography>
            <PerformanceStats />
          </Paper>
        </Grid>

        {/* Service Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={3} sx={{ padding: '1.5rem', minHeight: '150px' }}>
            <Typography variant="h6" gutterBottom>
              Service Statistics
            </Typography>
            <ServiceStats />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
