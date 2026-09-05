import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import EventFormModal from './EventFormModal';

import {
  createEvent,
  fetchMyEvents,
  updateEvent,
  deleteEvent,
  fetchTicketPurchases,
} from './services/eventService';
import { exportBookingsToCSV } from './components/admin/adminHelpers';
import UploadProgressModal from "./components/UploadProgressModal";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, CircularProgress, Typography, Button, Collapse,
  TextField, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Card, CardContent, CardMedia, Snackbar, Grid,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';

import {
  Add, Delete, Edit, ExpandMore, ExpandLess, Call
} from '@mui/icons-material';


const Events = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    city: '',
    country: '',
    venue: '',
    date: '',
    eventDates: [],
    startTime: '',
    endTime: '',
    ticketType: 'paid',
    freeSlots: '',
    ticketPackages: [],
  });

  const [editingEventId, setEditingEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventsData = await fetchMyEvents(token);
      setEvents(eventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching events', severity: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load ticket purchases per event
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const purchasesByEvent = {};
      for (const event of events) {
        const p = await fetchTicketPurchases(event._id);
        purchasesByEvent[event._id] = p
          .filter((pur) => pur.paymentStatus === 'Success')
          .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
      }
      setPurchases(purchasesByEvent);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching purchases', severity: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [events]);

  useEffect(() => {
     fetchEvents(); 
   }, [fetchEvents]);

  useEffect(() => {
   if (showPurchases) fetchPurchases();  
   }, [showPurchases, fetchPurchases]);

  const handleFormSubmit = async (data) => {
    if (data.ticketType === 'free') {
      delete data.ticketPackages;
    }

    const formData = new FormData();
    for (const key in data) {
      if ((key === 'ticketPackages' || key === 'eventDates') && data[key]) {
        formData.append(key, JSON.stringify(data[key]));
        continue;
      }
      formData.append(key, key === 'image' && data[key]?.length > 0 ? data[key][0] : data[key]);
    }

    try {
      setUploading(true);
      setUploadProgress(0);

    if (editingEventId) {
        await updateEvent(editingEventId, formData, token, (percent) => {
        setUploadProgress(percent);
      });
        setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' });
        
      } else {
        await createEvent(formData, token, (percent) => {
        setUploadProgress(percent);
      });
        setSnackbar({ open: true, message: 'Event created successfully', severity: 'success' });
      }

      setIsModalOpen(false);
      setEditingEventId(false);

      fetchEvents();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving event', severity: 'error' });
      console.error(error);
    } finally {
    setUploading(false);
    setUploadProgress(0);
  }
  };

  const handleEditClick = (event) => {
    setFormData({
      title: event.title,
      image: '',
      description: event.description,
      city: event.city,
      country: event.country,
      venue: event.venue,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      eventDates: event.eventDates || [],
      startTime: event.startTime,
      endTime: event.endTime,
      ticketType: event.ticketType || 'paid',
      freeSlots: event.freeSlots || '',
      ticketPackages: event.ticketPackages || [],
    });

    setEditingEventId(event._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (eventId, eventName) => {
    setDeleteConfirm({ open: true, id: eventId, name: eventName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(deleteConfirm.id, token);
      setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchEvents();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting event', severity: 'error' });
      console.error(error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null, name: '' });
  };

  const closeModal = () => {
    if (uploading) return;
    setIsModalOpen(false);

    setFormData({
      title: '',
      image: '',
      description: '',
      city: '',
      country: '',
      venue: '',
      date: '',
      eventDates: [],
      startTime: '',
      endTime: '',
      ticketType: 'paid',
      freeSlots: '',
      ticketPackages: [],
    });
  };

  const currentDate = new Date();

  const pastEvents = events.filter((event) => new Date(event.date) < currentDate);
  const upcomingEvents = events.filter((event) => new Date(event.date) >= currentDate);

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>

      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18,26,45,0.78)" : "rgba(255,255,255,0.82)", border: 1, borderColor: "divider", backdropFilter: "blur(16px)" }} elevation={0}>
        <Typography variant="h5" fontWeight={800}>Create and manage your events</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Publish an event to start selling tickets, then use purchases to track guests, revenue, and follow-up actions.
        </Typography>
      </Paper>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb: 3, flexWrap:'wrap', gap:1 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>
          Create Event
        </Button>

        <Button variant="outlined" onClick={() => setShowPastEvents(!showPastEvents)}
          startIcon={showPastEvents ? <ExpandLess /> : <ExpandMore />}>
          {showPastEvents ? 'Upcoming Events' : 'Past Events'}
        </Button>

        <Button variant="outlined" onClick={() => setShowPurchases(!showPurchases)}
          startIcon={showPurchases ? <ExpandLess /> : <ExpandMore />}>
          {showPurchases ? 'Hide Purchases' : 'Show Purchases'}
        </Button>
      </Box>

      {showPurchases && (
        <Collapse in={showPurchases}>
          <Box sx={{ mt:4 }}>
            <Typography variant="h5" sx={{ mb:2 }}>Event Purchases</Typography>

            <TextField
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ mb:2, width:'100%', maxWidth:400 }}
            />

            {events.map((event) => {
              const purchasesForEvent = (purchases[event._id] || []).filter(
                (p) =>
                  p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
              );

              const totalRevenue = purchasesForEvent.reduce((sum, p) => sum + p.totalAmount, 0);

              return (
                <Accordion key={event._id} sx={{ mb:2, borderRadius:2, boxShadow:2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.category} — {event.city}, {event.country}
                    </Typography>
                  </Box>
        
                  <Grid container justifyContent="flex-end" direction= "row" gap={3} mx={2}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total Tickets</Typography>
                      <Typography><strong>({purchasesForEvent.length})</strong></Typography>
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
                      exportBookingsToCSV(purchasesForEvent, 'ticket-sales.csv')
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
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Ticket Type</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Total (Ksh)</TableCell>
                            <TableCell>Purchase Date</TableCell>
                            <TableCell>Call</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {purchasesForEvent.length ? (
                            purchasesForEvent.map((p, i) => (
                              <TableRow key={p._id}>
                                <TableCell>{i + 1}.</TableCell>
                                <TableCell>{p.clientName}</TableCell>
                                <TableCell>{p.email}</TableCell>
                                <TableCell>{p.phone}</TableCell>
                                <TableCell>{p.ticketType}</TableCell>
                                <TableCell>{p.quantity}</TableCell>
                                <TableCell>{p.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>{new Date(p.purchaseDate).toLocaleString()}</TableCell>
                                <TableCell>
                                  <IconButton href={`tel:${p.phone}`}>
                                    <Call color="primary" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow><TableCell colSpan={7} align="center">No purchases</TableCell></TableRow>
                          )}

                          {purchasesForEvent.length > 0 && (
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
            {!events.length && (
              <Paper sx={{ p: 3, mt: 2, borderRadius: 3, bgcolor: "background.paper", border: 1, borderColor: "divider" }} elevation={0}>
                <Typography fontWeight={700}>Your event workspace is ready.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Create your first event to publish the details attendees need and begin receiving ticket purchases.
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>Create your first event</Button>
              </Paper>
            )}
          </Box>
        </Collapse>
      )}

      {!showPurchases && showPastEvents && (
        <>
          <Typography variant="h5" sx={{ mb:2 }}>Past Events</Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Total Tickets</TableCell>
                  <TableCell>Total Revenue</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pastEvents.map((event) => {
                  const eventPurchases = purchases[event._id] || [];
                  const totalTickets = eventPurchases.reduce((sum, p) => sum + p.quantity, 0);
                  const totalRevenue = eventPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

                  return (
                    <TableRow key={event._id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleString()}</TableCell>
                      <TableCell>{event.city}, {event.country}</TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{totalTickets}</TableCell>
                      <TableCell>{totalRevenue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleEditClick(event)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteClick(event._id, event.title)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!showPurchases && !showPastEvents && (
        <>
          <Typography variant="h5" sx={{ mb:2 }}>Upcoming Events</Typography>

          <Box sx={{ display:'grid', gap:2, gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {upcomingEvents.map((event) => (
              <Card key={event._id} sx={{ borderRadius:3, boxShadow:3 }}>
                <CardContent>
                  <CardMedia showthumbs="false">
                        <div key={event._id}>
                          <img
                            src={event.image}
                            alt={event.title}
                            style={{
                              width: '100%',
                              height: '200px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                            }}
                            />
                        </div>
                    </CardMedia>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography sx={{ mb:1 }}>{event.description}</Typography>

                  <Typography><strong>Location:</strong> {event.city}, {event.country}</Typography>
                  <Typography><strong>Venue:</strong> {event.venue}</Typography>
                  <Typography><strong>Date:</strong> {format(new Date(event.date), 'dd-MM-yyyy')}</Typography>
                  <Typography><strong>Time:</strong> {event.startTime} - {event.endTime}</Typography>

                  {event.ticketType === 'free' ? (
                    <Typography><strong>Price:</strong> Free</Typography>
                  ) : Array.isArray(event.ticketPackages) && event.ticketPackages.length > 0 ? (
                    <Box>
                      {event.ticketPackages.map((pkg) => (
                        <Typography key={pkg._id || pkg.name}>
                          {pkg.name}: Ksh. {pkg.price}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No ticket packages available</Typography>
                  )}

                  <Box sx={{ mt:2, display:'flex', justifyContent:'space-between' }}>
                    <Button variant="contained" startIcon={<Edit />} onClick={() => handleEditClick(event)}>Edit</Button>
                    <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDeleteClick(event._id, event.title)}>Delete</Button>
                  </Box>
                </CardContent>
                  <Typography><strong>Created on:</strong> <i>{format(new Date(event.createdAt), 'PPP')}</i></Typography>
              </Card>
            ))}
          </Box>
          {!upcomingEvents.length && (
            <Paper sx={{ p: 3, mt: 2, borderRadius: 3, bgcolor: "background.paper", border: 1, borderColor: "divider" }} elevation={0}>
              <Typography fontWeight={700}>No upcoming events yet.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Start with the event type, date, venue, ticket setup, and a clear description. You can edit everything later.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>Create an event</Button>
            </Paper>
          )}
        </>
      )}

      <EventFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        onSubmit={handleFormSubmit}
        onCancel={closeModal}
        editingEventId={editingEventId}
      />
      <UploadProgressModal
        open={uploading}
        progress={uploadProgress}
        text={editingEventId ? "Updating Event..." : "Creating Event..."}
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
            Are you sure you want to delete the event <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
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

export default Events;
