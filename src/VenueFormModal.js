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
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  name: "",
  city: "",
  country: "",
  size: "",
  capacity: "",
  bookingStatus: "",
  bookingDuration: "",
  charges: "",
  images: [],
  lat: null,
  lng: null,
};

const VenueFormModal = ({ open, handleClose, onSubmit, initialVenue }) => {
  const [venue, setVenue] = useState(defaultVenue);

  useEffect(() => {
    setVenue(initialVenue || defaultVenue);
  }, [initialVenue]);

useEffect(() => {
  if (!open) return;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setVenue((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
      },
      () => {
        console.warn("Geolocation denied — will fallback to city/country");
      },
      { enableHighAccuracy: true }
    );
  }
}, [open]);

const geocodeCityCountry = async (city, country) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${city}, ${country}`
      )}`
    );
    const data = await res.json();
    if (data?.length) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return null;
};

useEffect(() => {
  if (!venue.lat && venue.city && venue.country) {
    geocodeCityCountry(venue.city, venue.country).then((coords) => {
      if (coords) {
        setVenue((prev) => ({ ...prev, ...coords }));
      }
    });
  }
}, [venue.city, venue.country, venue.lat]);

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
        {venue.lat && venue.lng && (
          <Box mt={2}>
            <Typography fontWeight="bold" mb={1}>
              Venue Location (Auto-detected)
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
              This location is based on your current position.
            </Typography>

            <Box
              sx={{
                height: 280,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #ddd",
              }}
            >
              <MapContainer
                center={[venue.lat, venue.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <Marker position={[venue.lat, venue.lng]} />
              </MapContainer>
            </Box>
          </Box>
        )}

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
