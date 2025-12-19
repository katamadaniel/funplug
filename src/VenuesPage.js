import React, { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  TextField,
  Card,
  CardContent,
  IconButton,
  Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Delete, Edit, Call, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import VenueFormModal from './VenueFormModal';
import { fetchMyVenues, createVenue, updateVenue, deleteVenue, fetchVenueBookings } from './services/venuesService';

const VenuesPage = ({ token }) => {
  const [venues, setVenues] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
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
      const allBookings = [];
      for (const venue of venues) {
        const venueBookings = await fetchVenueBookings(venue._id);
        allBookings.push(...venueBookings);
      }
      setBookings(allBookings);
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
      }
    }
  };

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
                  <Typography variant="h6">{venue.name}</Typography>
                  <Typography>Location: {venue.city}, {venue.country}</Typography>
                  <Typography>Size: {venue.size} square ft.</Typography>
                  <Typography>Capacity: {venue.capacity} people</Typography>
                  <Typography>Status: {venue.bookingStatus}</Typography>
                  <Typography>Duration: {venue.bookingDuration} hours</Typography>
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
            placeholder="Search by phone or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ mb: 2, width: '100%', maxWidth: 400 }}
          />

          {venues.map((venue) => {
            const venueBookings = bookings.filter(
              (b) =>
                b.venueId === venue._id &&
                b.paymentStatus === 'Success' &&
                (b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  b.phone.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            return (
              <Accordion key={venue._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {venue.name} ({venueBookings.length} bookings) </Typography>
                </Box>
                </AccordionSummary>

                <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
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
                        venueBookings.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell>{b.name}</TableCell>
                            <TableCell>{b.phone}</TableCell>
                            <TableCell>{b.email}</TableCell>
                            <TableCell>{new Date(b.bookingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{b.startTime}</TableCell>
                            <TableCell>{b.endTime}</TableCell>
                            <TableCell>{b.duration}</TableCell>
                            <TableCell>{b.total.toFixed(2)}</TableCell>
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

export default VenuesPage;
