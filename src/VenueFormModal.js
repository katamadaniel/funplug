import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const ImagePreviewContainer = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  marginRight: '8px',
  marginBottom: '8px',
});

const ImagePreview = styled('img')({
  width: '70px',
  height: '70px',
  borderRadius: '8px',
  objectFit: 'cover',
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

const defaultVenue = {
  name: '',
  city: '',
  country: '',
  size: '',
  capacity: '',
  bookingStatus: '',
  bookingDuration: '',
  charges: '',
  images: [],
};

const VenueFormModal = ({ open, handleClose, onSubmit, initialVenue }) => {
  const [venue, setVenue] = useState(defaultVenue);

  useEffect(() => {
    setVenue(initialVenue || defaultVenue);
  }, [initialVenue]);

  const handleChange = (e) => {
    setVenue({ ...venue, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setVenue((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setVenue((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(venue);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
          width: '95%',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6" textAlign="center">
          {initialVenue ? 'Edit Venue' : 'Add Venue'}
        </Typography>

        <TextField name="name" label="Venue Name" value={venue.name} onChange={handleChange} required />
        <TextField name="city" label="City" value={venue.city} onChange={handleChange} required />
        <TextField name="country" label="Country" value={venue.country} onChange={handleChange} required />
        <TextField name="size" label="Size (square feet)" value={venue.size} onChange={handleChange} required />
        <TextField name="capacity" label="Seating Capacity" type="number" value={venue.capacity} onChange={handleChange} required />

        <TextField
          select
          name="bookingStatus"
          label="Booking Status"
          value={venue.bookingStatus}
          onChange={handleChange}
          required
        >
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>

        <TextField
          name="bookingDuration"
          label="Booking Duration"
          value={venue.bookingDuration}
          onChange={handleChange}
        />
        <TextField
          name="charges"
          label="Charges (per hour)"
          type="number"
          value={venue.charges}
          onChange={handleChange}
        />

        <Button variant="outlined" component="label">
          Upload Images
          <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
        </Button>

        {/* ✅ Image Preview Section */}
        <Box mt={1} display="flex" flexWrap="wrap">
          {venue.images.map((img, index) => {
            let src;

            if (img instanceof File) {
              src = URL.createObjectURL(img);
            } else if (typeof img === 'string') {
              src = img;
            } else if (img && img.url) {
              src = img.url;
            }

            return (
              <ImagePreviewContainer key={index}>
                <ImagePreview src={src} alt="preview" />
                <RemoveButton onClick={() => handleRemoveImage(index)} size="small">
                  <CloseIcon fontSize="small" />
                </RemoveButton>
              </ImagePreviewContainer>
            );
          })}
        </Box>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button type="submit" variant="contained"> Save </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default VenueFormModal;
