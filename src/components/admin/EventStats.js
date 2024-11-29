import React, { useContext } from 'react';
import { EventsContext } from '../../contexts/EventsContext';
import { Typography, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const EventStats = () => {
  const { highestSellingEvents, loading, error } = useContext(EventsContext);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6">Top 10 Highest Selling Events</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Title</TableCell>
              <TableCell align="right">Regular Tickets Sold</TableCell>
              <TableCell align="right">VIP Tickets Sold</TableCell>
              <TableCell align="right">VVIP Tickets Sold</TableCell>
              <TableCell align="right">Total Revenue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {highestSellingEvents.map(event => (
              <TableRow key={event.eventId}>
                <TableCell>{event.title}</TableCell>
                <TableCell align="right">{event.totalRegularTickets}</TableCell>
                <TableCell align="right">{event.totalVipTickets}</TableCell>
                <TableCell align="right">{event.totalVvipTickets}</TableCell>
                <TableCell align="right">
                  Ksh.{event.totalRevenue ? event.totalRevenue.toFixed(2) : '0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EventStats;
