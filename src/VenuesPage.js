import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './CustomCarousel.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { fetchMyVenues, createVenue, updateVenue, deleteVenue, fetchVenueBookings } from './services/venuesService';
import VenueFormModal from './VenueFormModal';
import { useCache } from './contexts/CacheContext';
import './VenuesPage.css';

const VenuesPage = ({ token }) => {
  const [venues, setVenues] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getFromCache, addToCache, clearCache } = useCache();
  const navigate = useNavigate();

  const handleTokenExpiryLogout = () => {
    clearCache(['venues']); // Clear venues cache
    localStorage.removeItem('token');
    navigate('/login');
  };

  const loadVenues = useCallback(async () => {
    setLoading(true);
    try {
      const cachedVenues = getFromCache('venues');
      if (cachedVenues) {
        setVenues(cachedVenues);
      } else {
        const venueData = await fetchMyVenues(token, handleTokenExpiryLogout);
        addToCache('venues', venueData);
        setVenues(venueData);
      }
    } catch (error) {
      setStatusMessage('Error fetching venues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, getFromCache, addToCache]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const allBookings = [];
      for (const venue of venues) {
        const venueBookings = await fetchVenueBookings(venue._id); // Fetch bookings per venue
        allBookings.push(...venueBookings); // Merge all bookings into one array
      }
      setBookings(allBookings);
    } catch (error) {
      setStatusMessage('Error fetching bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [venues]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    if (showBookings) {
      loadBookings();
    }
  }, [showBookings, loadBookings]);

  const handleFormSubmit = async (venue) => {
    try {
      const formData = new FormData();
      for (const key in venue) {
        if (key === 'images') {
          venue.images.forEach((file) => {
            formData.append('images', file);
          });
        } else {
          formData.append(key, venue[key]);
        }
      }

      if (isEditing) {
        await updateVenue(currentVenue._id, formData, token);
        setStatusMessage('Venue updated successfully');
      } else {
        await createVenue(formData, token);
        setStatusMessage('Venue added successfully');
      }
      setModalIsOpen(false);
      setIsEditing(false);
      setCurrentVenue(null);
      loadVenues();
    } catch (error) {
      setStatusMessage('Error saving venue');
      console.error(error);
    }
  };

  const handleEdit = (venue) => {
    setCurrentVenue(venue);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await deleteVenue(id, token);
        setStatusMessage('Venue deleted successfully');
        loadVenues();
      } catch (error) {
        setStatusMessage('Error deleting venue');
        console.error(error);
      }
    }
  };

  const handleAddVenue = () => {
    setCurrentVenue({
      name: '',
      location: '',
      size: '',
      capacity: '',
      bookingStatus: '',
      bookingDuration: '',
      charges: '',
      images: [],
    });
    setIsEditing(false);
    setModalIsOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="venues-container">
      <h1>My Venues</h1>
      <div className="venues-header">
        <button className="add-venue-button" id="add" onClick={handleAddVenue}>Add Venue</button>
        <button className="toggle-button" id="bookings" onClick={() => setShowBookings(!showBookings)}>
          {showBookings ? 'Show My Venues' : 'Show Bookings'}
        </button>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      <VenueFormModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        onSubmit={handleFormSubmit}
        initialVenue={currentVenue}
      />
      {!showBookings ? (
        <>
          <h2>My Listing</h2>
          <div className="venue-list">
            {venues.map((venue) => (
              <div key={venue._id} className="venue-card">
                <div className="image-gallery-container">
                  <ImageGallery
                    items={venue.images.map((img) => ({ original: `http://localhost:5000${img}` }))}
                    showFullscreenButton={true}
                    showPlayButton={false}
                    showThumbnails={false}
                  />
                </div>
                <div className="venue-details">
                  <h3><strong>Name: </strong>{venue.name}</h3>
                  <p><strong>Location: </strong>{venue.location}</p>
                  <p><strong>Size: </strong>{venue.size}</p>
                  <p><strong>Capacity: </strong>{venue.capacity} people</p>
                  <p><strong>Status: </strong>{venue.bookingStatus}</p>
                  <p><strong>Duration: </strong>{venue.bookingDuration}</p>
                  <p><strong>Charges: </strong>Ksh.{venue.charges}/hour</p>
                  <button onClick={() => handleEdit(venue)}>Edit</button>
                  <button onClick={() => handleDelete(venue._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <h2>Venue Bookings</h2>
          {venues.map((venue) => {
            const venueBookings = bookings.filter((booking) => booking.venueId === venue._id);

            return (
              <Box key={venue._id} sx={{ my: 3 }}>
                <Typography variant="h5">{venue.name}</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Booking Date</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Duration (hours)</TableCell>
                        <TableCell>Total Paid (Ksh.)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {venueBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>{booking.name}</TableCell>
                          <TableCell>{booking.phone}</TableCell>
                          <TableCell>{booking.email}</TableCell>
                          <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.startTime}</TableCell>
                          <TableCell>{booking.endTime}</TableCell>
                          <TableCell>{booking.duration}</TableCell>
                          <TableCell>Ksh.{booking.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VenuesPage;