import React, { useState, useEffect, useCallback } from "react";
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
  Snackbar,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Add, Delete, Edit, Call, ExpandMore, ExpandLess } from "@mui/icons-material";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import VenueFormModal from "./VenueFormModal";
import {
  fetchMyVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  fetchVenueBookings,
} from "./services/venuesService";
import UploadProgressModal from "./components/UploadProgressModal";
import { exportBookingsToCSV } from "./components/admin/adminHelpers";

const Venues = ({ token }) => {
  const [venues, setVenues] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingsByVenue, setBookingsByVenue] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  // Load venues
  const loadVenues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyVenues(token);
      setVenues(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching venues",
        severity: "error",
      });
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

        results[venue._id] = venueBookings
          .filter((b) => b.paymentStatus === "Success")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setBookingsByVenue(results);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching bookings",
        severity: "error",
      });
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

  /* -----------------------------------------
      SUBMIT CREATE/UPDATE VENUE (IMAGES+VIDEOS)
  ------------------------------------------ */
  const handleSubmit = async (venue) => {
    try {
      const formData = new FormData();

      Object.keys(venue).forEach((key) => {
        if (key === "images") {
          venue.images.forEach((img) => {
            // only append File objects
            if (img instanceof File) {
              formData.append("images", img);
            }
          });
        } else if (key === "videos") {
          venue.videos.forEach((vid) => {
            if (vid instanceof File) {
              formData.append("videos", vid);
            }
          });
        } else if (key === "location") {
          formData.append("location", JSON.stringify(venue.location));
        } else {
          if (venue[key] !== undefined && venue[key] !== null) {
            formData.append(key, venue[key]);
          }
        }
      });


    setUploading(true);
    setUploadProgress(0);

      if (isEditing) {
        await updateVenue(currentVenue._id, formData, token, (percent) => {
        setUploadProgress(percent);
      });
        setSnackbar({
          open: true,
          message: "Venue updated successfully",
          severity: "success",
        });
      } else {
        await createVenue(formData, token, (percent) => {
        setUploadProgress(percent);
      });
        setSnackbar({
          open: true,
          message: "Venue created successfully",
          severity: "success",
        });
      }

      setModalOpen(false);
      setIsEditing(false);
      setCurrentVenue(null);

      loadVenues();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Error saving venue",
        severity: "error",
      });
    } finally {
    setUploading(false);
    setUploadProgress(0);
  }
  };

  const handleEdit = (venue) => {
    setCurrentVenue(venue);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (uploading) return;
    setModalOpen(false);
  };

  const handleDeleteClick = (venueId, venueName) => {
    setDeleteConfirm({ open: true, id: venueId, name: venueName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVenue(deleteConfirm.id, token);
      setSnackbar({
        open: true,
        message: "Venue deleted successfully",
        severity: "success",
      });
      setDeleteConfirm({ open: false, id: null, name: '' });
      loadVenues();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Error deleting venue",
        severity: "error",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null, name: '' });
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18,26,45,0.78)" : "rgba(255,255,255,0.82)", border: 1, borderColor: "divider", backdropFilter: "blur(16px)" }} elevation={0}>
        <Typography variant="h5" fontWeight={800}>Make your space bookable</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add clear venue details, capacity, pricing, media, and location so clients can confidently book your space.
        </Typography>
      </Paper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setCurrentVenue(null);
            setIsEditing(false);
            setModalOpen(true);
          }}
        >
          Create Venue
        </Button>

        <Button
          variant="outlined"
          onClick={() => setShowBookings(!showBookings)}
          startIcon={showBookings ? <ExpandLess /> : <ExpandMore />}
        >
          {showBookings ? "Hide Bookings" : "Show Bookings"}
        </Button>
      </Box>

      {/* --------------------------
          VENUE LIST SECTION
      -------------------------- */}
      {!showBookings && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Venue Listings
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            }}
          >
            {venues.map((venue) => {
              const images = venue.images || [];
              const videos = venue.videos || [];

              const hasMedia = images.length > 0 || videos.length > 0;

              return (
                <Card
                  key={venue._id}
                  sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}
                >
                  <Box sx={{ height: 220 }}>
                    {hasMedia ? (
                      <Carousel
                        showThumbs={false}
                        infiniteLoop
                        showStatus={false}
                        autoPlay={false}
                        swipeable
                        emulateTouch
                      >
                        {/* IMAGES */}
                        {venue.images?.map((img, index) => (
                          <div key={`img-${index}`}>
                            <img
                              src={img.url}
                              alt={`venue-image-${index}`}
                              style={{
                                width: "100%",
                                height: "220px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}

                        {/* VIDEOS */}
                        {venue.videos?.map((vid, index) => (
                          <div key={`vid-${index}`}>
                            <video
                              src={vid.url}
                              controls
                              style={{
                                width: "100%",
                                height: "220px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}
                      </Carousel>
                    ) : (
                      <Box
                        sx={{
                          height: "220px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        <Typography color="text.secondary">
                          No media uploaded
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent>
                    <Typography variant="h6">{venue.venueType}</Typography>
                    <Typography>Name: {venue.name}</Typography>
                    <Typography>
                      Location: {venue.city}, {venue.country}
                    </Typography>
                    <Typography>Size: {venue.size} square ft.</Typography>
                    <Typography>Capacity: {venue.capacity} people</Typography>
                    <Typography>Booking Status: {venue.bookingStatus}</Typography>
                    <Typography>Duration: {venue.duration} hours</Typography>
                    <Typography>Charges: {venue.charges}/hour</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary">
                      Images: <strong>{images.length}</strong> | Videos:{" "}
                      <strong>{videos.length}</strong>
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(venue)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteClick(venue._id, venue.name)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {!venues.length && (
              <Paper sx={{ p: 3, mt: 2, borderRadius: 3, bgcolor: "background.paper", border: 1, borderColor: "divider" }} elevation={0}>
                <Typography fontWeight={700}>No venue listings yet.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Create a venue listing with photos, capacity, charges, and availability. Clients will use these details when planning.
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setCurrentVenue(null); setIsEditing(false); setModalOpen(true); }}>Create your first venue</Button>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {/* --------------------------
          BOOKINGS SECTION
      -------------------------- */}
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
            sx={{ mb: 2, width: "100%", maxWidth: 400 }}
          />

          {venues.map((venue) => {
            const venueBookings = filteredBookingsByVenue[venue._id] || [];
            const totalRevenue = venueBookings.reduce(
              (sum, b) => sum + b.totalAmount,
              0
            );

            return (
              <Accordion key={venue._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {venue.venueType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {venue.name} — {venue.city}, {venue.country}
                    </Typography>
                  </Box>

                  <Grid
                    container
                    justifyContent="flex-end"
                    direction="row"
                    gap={3}
                    mx={2}
                  >
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total Bookings</Typography>
                      <Typography>
                        <strong>({venueBookings.length})</strong>
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                      <Typography>Total Revenue</Typography>
                      <Typography>
                        <strong>Ksh. {totalRevenue.toFixed(2)}</strong>
                      </Typography>
                    </Paper>

                    <Box
                      component="span"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        exportBookingsToCSV(
                          venueBookings,
                          "venue-bookings.csv"
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          exportBookingsToCSV(
                            venueBookings,
                            "venue-bookings.csv"
                          );
                        }
                      }}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        cursor: 'pointer',
                        mb: 2,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        outline: 'none',
                      }}
                    >
                      Export
                    </Box>
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
                              <TableCell>
                                {b.bookingType === "multiple"
                                  ? `${new Date(b.startDate).toLocaleDateString()} - ${new Date(
                                      b.endDate
                                    ).toLocaleDateString()}`
                                  : new Date(b.bookingDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{b.bookingType === "multiple" ? "All day" : b.from}</TableCell>
                              <TableCell>{b.bookingType === "multiple" ? "All day" : b.to}</TableCell>
                              <TableCell>
                                {typeof b.duration === "number"
                                  ? b.bookingType === "multiple"
                                    ? `${b.duration / 24} day(s) (${b.duration} hrs)`
                                    : `${b.duration} hrs`
                                  : String(b.duration)}
                              </TableCell>
                              <TableCell>Ksh. {Number(b.totalAmount).toFixed(2)}</TableCell>
                              <TableCell>
                                <IconButton
                                  color="primary"
                                  href={`tel:${b.phone}`}
                                >
                                  <Call color="primary" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center">
                              No bookings found.
                            </TableCell>
                          </TableRow>
                        )}

                        {venueBookings.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={8} align="right">
                              <strong>Total Revenue:</strong>
                            </TableCell>
                            <TableCell colSpan={2}>
                              <strong>Ksh.{totalRevenue.toFixed(2)}</strong>
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
        handleClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialVenue={isEditing ? currentVenue : null}
      />

      <UploadProgressModal
        open={uploading}
        progress={uploadProgress}
        text={isEditing ? "Updating Venue..." : "Creating Venue..."}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the venue <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Venues;