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
  IconButton, Card, CardContent, CardMedia, Snackbar, Grid
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
    date: '',
    startTime: '',
    endTime: '',
    regularPrice: '',
    vipPrice: '',
    vvipPrice: '',
    ticketType: 'paid',
    freeSlots: '',
    regularSlots: '',
    vipSlots:'',
    vvipSlots:'',
  });

  const [editingEventId, setEditingEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      data.regularPrice = '0';
      data.regularSlots = '0';
      data.vipPrice = '0';
      data.vipSlots = '0';
      data.vvipPrice = '0';
      data.vvipSlots = '0';
    }

    const formData = new FormData();
    for (const key in data) {
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
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      startTime: event.startTime,
      endTime: event.endTime,
      regularPrice: event.regularPrice,
      vipPrice: event.vipPrice,
      vvipPrice: event.vvipPrice,
      ticketType: event.ticketType || 'paid',
      regularSlots: event.regularSlots,
      vipSlots: event.vipSlots,
      vvipSlots: event.vvipSlots,
    });

    setEditingEventId(event._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(id, token);
      setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
      fetchEvents();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting event', severity: 'error' });
      console.error(error);
    }
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
      date: '',
      startTime: '',
      endTime: '',
      regularPrice: '',
      vipPrice: '',
      vvipPrice: '',
      ticketType: 'paid',
      regularSlots: '',
      vipSlots:'',
      vvipSlots:'',
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
                        <Button size="small" color="error" onClick={() => handleDelete(event._id)}>Delete</Button>
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
                  ) : (
                    <>
                      {event.regularPrice > 0 && <Typography>Regular: {event.regularPrice}</Typography>}
                      {event.vipPrice > 0 && <Typography>VIP: {event.vipPrice}</Typography>}
                      {event.vvipPrice > 0 && <Typography>VVIP: {event.vvipPrice}</Typography>}
                    </>
                  )}

                  <Box sx={{ mt:2, display:'flex', justifyContent:'space-between' }}>
                    <Button variant="contained" startIcon={<Edit />} onClick={() => handleEditClick(event)}>Edit</Button>
                    <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleDelete(event._id)}>Delete</Button>
                  </Box>
                </CardContent>
                  <Typography><strong>Created on:</strong> <i>{format(new Date(event.createdAt), 'PPP')}</i></Typography>
              </Card>
            ))}
          </Box>
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
      </Box>
  );
};

export default Events;
