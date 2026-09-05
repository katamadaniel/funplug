import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material';
import UserStats from './UserStats';
import TicketStats from './TicketStats';
import EventStats from './EventStats';
import VenueStats from './VenueStats';
import PerformanceStats from './PerformanceStats';
import ServiceStats from './ServiceStats';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ marginTop: '2rem' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* User Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
            <Typography variant="h6" gutterBottom>
              User Statistics
            </Typography>
            <UserStats />
          </Paper>
        </Grid>

        {/* Ticket Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
            <Typography variant="h6" gutterBottom>
              Ticket Statistics
            </Typography>
            <TicketStats />
          </Paper>
        </Grid>

        {/* Event Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
            <Typography variant="h6" gutterBottom>
              Event Statistics
            </Typography>
            <EventStats />
          </Paper>
        </Grid>

        {/* Venue Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
            <Typography variant="h6" gutterBottom>
              Venue Statistics
            </Typography>
            <VenueStats />
          </Paper>
        </Grid>

        {/* Performance Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
            <Typography variant="h6" gutterBottom>
              Performance Statistics
            </Typography>
            <PerformanceStats />
          </Paper>
        </Grid>

        {/* Service Stats Card */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: '150px', border: 1, borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.72)' : 'rgba(255,255,255,0.58)', backdropFilter: 'blur(18px)' }}>
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
