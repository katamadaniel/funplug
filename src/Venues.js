import React, { useState, useEffect, useCallback } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Box, Button, CircularProgress, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse,
  TextField, Card, CardContent, IconButton, Snackbar, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Delete, Edit, Call, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import VenueFormModal from './VenueFormModal';
import { fetchMyVenues, createVenue, updateVenue, deleteVenue, fetchVenueBookings } from './services/venuesService';
import { exportBookingsToCSV } from './components/admin/adminHelpers';

const Venues = ({ token }) => {
  const [venues, setVenues] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingsByVenue, setBookingsByVenue] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load venues
  const loadVenues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyVenues(token);
      setVenues(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching venues', severity: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load bookings per venue
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const results = {};
      for (const venue of venues) {
        const venueBookings = await fetchVenueBookings(venue._id);
        results[venue._id] = venueBookings.filter(
          (b) => b.paymentStatus === 'Success')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      setBookingsByVenue(results);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching bookings', severity: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [venues]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    if (showBookings) loadBookings();
  }, [showBookings, loadBookings]);

  const handleSubmit = async (venue) => {
    try {
      const formData = new FormData();
      Object.keys(venue).forEach((key) => {
        if (key === 'images') {
          venue.images.forEach((img) => formData.append('images', img));
        } else {
          formData.append(key, venue[key]);
        }
      });

      if (isEditing) {
        await updateVenue(currentVenue._id, formData, token);
        setSnackbar({ open: true, message: 'Venue updated successfully', severity: 'success' });
      } else {
        await createVenue(formData, token);
        setSnackbar({ open: true, message: 'Venue created successfully', severity: 'success' });
      }

      setModalOpen(false);
      setIsEditing(false);
      setCurrentVenue(null);
      loadVenues();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Error saving venue', severity: 'error' });
      console.error(error);
    }
  };

  const handleEdit = (venue) => {
    setCurrentVenue(venue);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await deleteVenue(id, token);
        setSnackbar({ open: true, message: 'Venue deleted successfully', severity: 'success' });
        loadVenues();
      } catch (error) {
        console.error(error);
        setSnackbar({ open: true, message: 'Error deleting venue', severity: 'error' });
        console.error(error);
      }
    }
  };

  const filteredBookingsByVenue = {};
  for (const [venueId, bookings] of Object.entries(bookingsByVenue)) {
    filteredBookingsByVenue[venueId] = bookings.filter(
      (b) =>
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModalOpen(true)}>
          Create Venue
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowBookings(!showBookings)}
          startIcon={showBookings ? <ExpandLess /> : <ExpandMore />}
        >
          {showBookings ? 'Hide Bookings' : 'Show Bookings'}
        </Button>
      </Box>
      {/* Venue List */}
      {!showBookings && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Venue Listings
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {venues.map((venue) => (
              <Card key={venue._id} sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
                <Box sx={{ height: 200 }}>
                    <Carousel showThumbs={false} infiniteLoop showStatus={false} autoPlay>
                      {venue.images.map((img, index) => (
                        <div key={index}>
                          <img
                            src={img.url}
                            alt={`venue ${index}`}
                            style={{
                              width: '100%',
                              height: '200px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      ))}
                    </Carousel>
                </Box>
                <CardContent>
                  <Typography variant="h6">{venue.venueType}</Typography>
                  <Typography>Name: {venue.name}</Typography>
                  <Typography>Location: {venue.city}, {venue.country}</Typography>
                  <Typography>Size: {venue.size} square ft.</Typography>
                  <Typography>Capacity: {venue.capacity} people</Typography>
                  <Typography>Booking Status: {venue.bookingStatus}</Typography>
                  <Typography>Duration: {venue.duration} hours</Typography>
                  <Typography>Charges: {venue.charges}/hour</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent:'space-between', gap: 1 }}>
                    <Button variant="contained" color="primary" startIcon={<Edit />} onClick={() => handleEdit(venue)}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(venue._id)}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Bookings Section */}
      <Collapse in={showBookings}>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Venue Bookings
          </Typography>
          <TextField
            placeholder="Search by name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ mb: 2, width: '100%', maxWidth: 400 }}
          />

          {venues.map((venue) => {
            const venueBookings = filteredBookingsByVenue[venue._id] || [];
            const totalRevenue = venueBookings.reduce((sum, b) => sum + b.totalAmount, 0);

            return (
              <Accordion key={venue._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {venue.venueType}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {venue.name} — {venue.city}, {venue.country}
                  </Typography>
                </Box>
                  <Grid container justifyContent="flex-end" direction= "row" gap={3} mx={2}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total Bookings</Typography>
                      <Typography><strong>({venueBookings.length})</strong></Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total Revenue</Typography>
                      <Typography>
                        <strong>Ksh. {totalRevenue.toFixed(2)}</strong>
                      </Typography>
                    </Paper>
        
                  <Button
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() =>
                      exportBookingsToCSV(venueBookings, 'venue-bookings.csv')
                    }
                  >
                    Export
                  </Button>
                  </Grid>
                </AccordionSummary>

                <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Client Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Booking Date</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Total (Ksh)</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {venueBookings.length > 0 ? (
                        venueBookings.map((b, i) => (
                          <TableRow key={b._id}>
                            <TableCell>{i + 1}.</TableCell>
                            <TableCell>{b.clientName}</TableCell>
                            <TableCell>{b.phone}</TableCell>
                            <TableCell>{b.email}</TableCell>
                            <TableCell>{new Date(b.bookingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{b.from}</TableCell>
                            <TableCell>{b.to}</TableCell>
                            <TableCell>{b.duration}</TableCell>
                            <TableCell>{b.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <IconButton color="primary" href={`tel:${b.phone}`}>
                                <Call color="primary" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            No bookings found.
                          </TableCell>
                        </TableRow>
                      )}
                          {venueBookings.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="right"><strong>Total Revenue:</strong></TableCell>
                              <TableCell><strong>Ksh.{totalRevenue.toFixed(2)}</strong></TableCell>
                            </TableRow>
                          )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Collapse>

      <VenueFormModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialVenue={isEditing ? currentVenue : null}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />      
    </Box>
  );
};

export default Venues;
