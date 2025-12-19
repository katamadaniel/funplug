import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchMyCards,
  createCard,
  updateCard,
  deleteCard,
  fetchCardBookings
} from './services/performanceService';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Modal,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Edit, Delete, Call, ExpandMore, ExpandLess } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import CloseIcon from '@mui/icons-material/Close';

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const ImagePreview = styled('img')({
  width: '70px',
  height: '70px',
  borderRadius: '8px',
  objectFit: 'cover',
  marginRight: '8px',
});

const ImagePreviewContainer = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  marginRight: '8px',
  marginBottom: '8px',
});

const RemoveButton = styled(IconButton)({
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: 'rgba(0,0,0,0.6)',
  color: 'white',
  width: '20px',
  height: '20px',
  padding: 0,
  '&:hover': {
    backgroundColor: 'rgba(255,0,0,0.7)',
  },
});

const Performance = ({ token }) => {
  const [cards, setCards] = useState([]);
  const [bookingsByCard, setBookingsByCard] = useState({});
  const [showBookings, setShowBookings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    artType: '',
    name: '',
    country: '',
    city: '',
    charges: '',
    status: 'open',
    images: []
  });

  const loadMyCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyCards(token);
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMyCards();
  }, [loadMyCards]);

  // Fetch bookings for all cards
  const loadBookingsForCards = async (cardsList) => {
    const results = {};
    setLoading(true);
    try {
      for (const card of cardsList) {
        const cardBookings = await fetchCardBookings(card._id);
          results[card._id] = cardBookings.filter(
            (b) => b.paymentStatus === "Success"
          );
      }
      setBookingsByCard(results);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookings = async () => {
    const next = !showBookings;
    setShowBookings(next);
    if (next) {
      await loadBookingsForCards(cards);
    }
  };

  // Modal & form handlers
  const handleOpenModal = (card = null) => {
    setSelectedCard(card);
    if (card) {
      setFormData({
        artType: card.artType,
        name: card.name,
        country: card.country,
        city: card.city,
        charges: card.charges,
        status: card.status,
        images: card.images || [],
      });
    } else {
      setFormData({
         artType: '', 
         name: '', 
         country: '', 
         city: '', 
         charges: '', 
         status: 'open', 
         images: [] 
        });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCard(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files).slice(0, 5) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submission = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'images') {
        formData.images.forEach((img) => submission.append('images', img));
      } else submission.append(key, formData[key]);
    });

    try {
      setLoading(true);
      if (selectedCard) {
        await updateCard(selectedCard._id, submission);
        setSnackbar({ open: true, message: 'Rate Card updated successfully', severity: 'success' });
      } else {
        await createCard(submission);
        setSnackbar({ open: true, message: 'Rate Card created successfully', severity: 'success' });
      }
      handleCloseModal();
      loadMyCards();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving card', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await deleteCard(id);
      setSnackbar({ open: true, message: 'Card deleted successfully', severity: 'success' });
      loadMyCards();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting card', severity: 'error' });
    }
  };

  const filteredBookingsByCard = {};
  for (const [cardId, bookings] of Object.entries(bookingsByCard)) {
    filteredBookingsByCard[cardId] = bookings.filter(
      (b) =>
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom textAlign="center">
        {showBookings ? 'My Bookings' : 'My Rate Cards'}
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
            Create Card
          </Button>
        <Button 
        variant="outlined" 
        onClick={handleToggleBookings}
        startIcon={showBookings ? <ExpandLess /> : <ExpandMore />}
        >
          {showBookings ? 'Hide Bookings' : 'Show Bookings'}
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : showBookings ? (
        <Box mt={2}>
          <TextField
            fullWidth
            label="Search by Email or Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 2, width: '100%', maxWidth: 400 }}
          />

          {cards.map((card) => {
            const cardBookings = filteredBookingsByCard[card._id] || [];

            return (
              <Accordion key={card._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="h6">{card.artType} ({cardBookings.length} bookings)</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.city}, {card.country} — {card.charges}/hr
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Client Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Booking Date</TableCell>
                          <TableCell>From</TableCell>
                          <TableCell>To</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cardBookings.length > 0 ? (
                          cardBookings.map((b) => (
                            <TableRow key={b._id}>
                              <TableCell>{b.clientName}</TableCell>
                              <TableCell>{b.email}</TableCell>
                              <TableCell>{b.phone}</TableCell>
                              <TableCell>{new Date(b.bookingDate).toLocaleDateString()}</TableCell>
                              <TableCell>{b.from}</TableCell>
                              <TableCell>{b.to}</TableCell>
                              <TableCell>{b.duration}</TableCell>
                              <TableCell>{b.totalAmount}</TableCell>
                              <TableCell>
                                <IconButton href={`tel:${b.phone}`}>
                                  <Call color="primary" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              No bookings found
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
      ) : (
        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <Box sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }} borderRadius={2} p={2}>
                {card.images && card.images.length > 0 && (
                  <Carousel showThumbs={false} dynamicHeight={false} infiniteLoop showStatus={false} autoPlay>
                    {card.images.map((img, index) => (
                      <div key={index}>
                        <img
                          src={img.url}
                          alt={`Card ${index}`}
                          style={{
                            width: '100%',
                            borderRadius: '10px',
                            maxHeight: '250px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                )}
                <Typography variant="h6">{card.artType}</Typography>
                <Typography variant="body2">Stage Name: {card.name}</Typography>
                <Typography variant="body2">
                  Location: {card.city}, {card.country}
                </Typography>
                <Typography variant="body2">Charges/hr: {card.charges}</Typography>
                <Typography variant="body2">Status: {card.status}</Typography>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button variant="contained" color="primary" startIcon={<Edit />} onClick={() => handleOpenModal(card)}>Edit</Button>
                  <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(card._id)}>Delete</Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={ModalStyle}>
          <Typography variant="h6" textAlign="center" gutterBottom>
            {selectedCard ? 'Edit Rate Card' : 'Rate Card'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Art Type</InputLabel>
              <Select name="artType" value={formData.artType} onChange={handleChange} required>
                {[
                  'Circus arts',
                  'Dance',
                  'DJ (Hype man)',
                  'Instrumentalist',
                  'Magician',
                  'Master of ceremony',
                  'Musical (rap/song)',
                  'Spoken word',
                  'Stand-up Comedy',
                  'Theatre (Drama)',
                ].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Stage Name" name="name" value={formData.name} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="City/Town" name="city" value={formData.city} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Charges (per hour)" name="charges" type="number" value={formData.charges} onChange={handleChange} margin="normal" required />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...newFiles],
                  }));
                }}
              />
            </Button>

            <Box mt={1} display="flex" flexWrap="wrap">
              {formData.images.map((img, index) => {
                let src;
                // Handle different formats
                if (img instanceof File) src = URL.createObjectURL(img);
                else if (typeof img === 'string') src = img;
                else if (img && img.url) src = img.url;

                return (
                  <ImagePreviewContainer key={index}>
                    <ImagePreview src={src} alt={`preview-${index}`} />
                    <RemoveButton onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}>
                      <CloseIcon fontSize="small" />
                    </RemoveButton>
                  </ImagePreviewContainer>
                );
              })}
            </Box>
            <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={24} /> : selectedCard ? 'Update' : 'Create'}</Button>
            <Button onClick={handleCloseModal} color="primary" fullWidth sx={{ mt: 3 }}>Cancel</Button>
            </Stack>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default Performance;
