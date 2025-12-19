import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchMyServices,
  createService,
  updateService,
  deleteService,
  fetchServiceBookings
} from './services/serviceService';
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
import { Add, Edit, Delete, Call, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { styled } from '@mui/material/styles';
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

const Services = ({ token }) => {
  const [services, setServices] = useState([]);
  const [bookingsByService, setBookingsByService] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    country: '',
    city: '',
    charges: '',
    status: 'open',
    duration: '',
    images: []
  });

  const loadMyServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyServices(token);
      setServices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMyServices();
  }, [loadMyServices]);

    // Fetch bookings for all services
const loadBookingsForServices = async (servicesList) => {
    const results = {};
    setLoading(true);
    try {
      for (const service of servicesList) {
        const serviceBookings = await fetchServiceBookings(service._id);
          results[service._id] = serviceBookings.filter(
            (b) => b.paymentStatus === "Success"
          );
      }
      setBookingsByService(results);
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
      await loadBookingsForServices(services);
    }
  };

  const handleOpenModal = (service = null) => {
    setSelectedService(service);
    if (service) {
      setFormData({
        serviceType: service.serviceType,
        description: service.description,
        country: service.country,
        city: service.city,
        charges: service.charges,
        status: service.status,
        duration: service.duration,
        images: service.images || [],
      });
    } else {
      setFormData({
        serviceType: '',
        description: '',
        country: '',
        city: '',
        charges: '',
        status: 'open',
        duration: '',
        images: []
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedService(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files).slice(0, 10) });
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
      if (selectedService) {
        await updateService(selectedService._id, submission);
        setSnackbar({ open: true, message: 'Service updated successfully', severity: 'success' });
      } else {
        await createService(submission);
        setSnackbar({ open: true, message: 'Service created successfully', severity: 'success' });
      }
      handleCloseModal();
      loadMyServices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving service', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      setSnackbar({ open: true, message: 'Service deleted successfully', severity: 'success' });
      loadMyServices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting service', severity: 'error' });
    }
  };

  const filteredBookingsByService = {};
  for (const [serviceId, bookings] of Object.entries(bookingsByService)) {
    filteredBookingsByService[serviceId] = bookings.filter(
      (b) =>
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom textAlign="center">My Services</Typography>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>Add Service</Button>
        <Button variant="outlined"
          onClick={handleToggleBookings}
          startIcon={showBookings ? <ExpandLess /> : <ExpandMore />}
          >
          {showBookings ? 'Hide Bookings' : 'Show Bookings'}</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : showBookings ? (
        // BOOKINGS VIEW
        <Box mt={4}>
          <TextField
            fullWidth
            label="Search by Email or Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 2, width: '100%', maxWidth: 400 }}
          />

          {services.map((service) => {
            const serviceBookings = filteredBookingsByService[service._id] || [];

          return (
            <Accordion key={service._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="h6">{service.serviceType} ({serviceBookings.length} bookings)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.city}, {service.country} — {service.description}
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
                      {serviceBookings.length > 0 ? (
                        serviceBookings.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell>{b.clientName}</TableCell>
                            <TableCell>{b.email}</TableCell>
                            <TableCell>{b.phone}</TableCell>
                            <TableCell>
                              {new Date(b.bookingDate).toLocaleDateString()}
                            </TableCell>
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
                            No bookings found for this service
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
        // SERVICES GRID VIEW
        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <Box sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }} borderRadius={2} p={2}>
                {service.images && service.images.length > 0 && (
                  <Box mt={2}>
                    <Carousel showThumbs={false} infiniteLoop showStatus={false} autoPlay>
                      {service.images.map((img, index) => (
                        <div key={index}>
                          <img
                            src={img.url}
                            alt={`Service ${index}`}
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
                )}
                <Typography variant="h6">{service.serviceType}</Typography>
                <Typography variant="body2">Items: {service.description}</Typography>
                <Typography variant="body2">Location: {service.city}, {service.country}</Typography>
                <Typography variant="body2">Charges/hr: {service.charges}</Typography>
                <Typography variant="body2">Duration: {service.duration}</Typography>
                <Typography variant="body2">Status: {service.status}</Typography>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button variant="contained" color="primary" startIcon={<Edit />} onClick={() => handleOpenModal(service)}>Edit</Button>
                  <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(service._id)}>Delete</Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal for Add/Edit Service */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={ModalStyle}>
          <Typography variant="h6" textAlign="center" gutterBottom>{selectedService ? 'Edit Service' : 'Add Service'}</Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Service Type</InputLabel>
              <Select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                {['Audio visual', 'Catering', 'Décor', 'Lighting', 'Mobile toilets', 'Photography', 'Rentals', 'Sound system', 'Security', 'Transport', 'Videography'].map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Description / Items included" name="description" value={formData.description} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="City/Town" name="city" value={formData.city} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Charges (per hour)" name="charges" type="number" value={formData.charges} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Duration (Hours per day)" name="duration" type="number" value={formData.duration} onChange={handleChange} margin="normal" required />
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
                  const selectedFiles = Array.from(e.target.files).slice(0, 10);
                  const newImages = [...formData.images, ...selectedFiles];
                  setFormData({ ...formData, images: newImages });
                }}
              />
            </Button>

            {/* ✅ Image Preview Section */}
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
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={24} /> : selectedService ? 'Update' : 'Create'}</Button>
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

export default Services;
