import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;
const USERS_API_URL = `${API_URL}/api/users`;
const TICKET_SALES_API_URL = `${API_URL}/api/events/all-ticket-sales`;
const TICKET_PURCHASES_API_URL = `${API_URL}/api/ticket_purchases`;

const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEventPurchases, setSelectedEventPurchases] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUsers();
    fetchEvents();
    fetchEventsWithSales();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL);
      const users = response.data;

      // Create a mapping of userId to username
      const userMapping = {};
      users.forEach((user) => {
        userMapping[user._id] = user.username;
      });

      setUsersMap(userMapping); // Store the user mapping in state
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

    const fetchEvents = async () => {
    try {
      const response = await axios.get(EVENTS_API_URL);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchEventsWithSales = async () => {
    try {
      // Fetch events data
      const eventsResponse = await axios.get(EVENTS_API_URL);
      const eventsData = eventsResponse.data;

      // Fetch ticket sales data
      const salesResponse = await axios.get(TICKET_SALES_API_URL);
      const salesData = salesResponse.data;

      // Merge events data with sales data
      const mergedEvents = eventsData.map(event => {
        const salesInfo = salesData.find(sale => sale.eventId === event._id) || {};
        return {
          ...event,
          regularTicketsSold: salesInfo.regularTicketsSold || 0,
          vipTicketsSold: salesInfo.vipTicketsSold || 0,
          vvipTicketsSold: salesInfo.vvipTicketsSold || 0,
          totalRevenue: salesInfo.totalRevenue || 0,
        };
      });

      // Separate upcoming and past events
      const currentDate = new Date();
      const upcoming = mergedEvents.filter(event => new Date(event.date) >= currentDate);
      const past = mergedEvents.filter(event => new Date(event.date) < currentDate);

      // Sort events by date
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEvents(mergedEvents);
      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setFilteredEvents(mergedEvents);
    } catch (error) {
      console.error('Failed to fetch events or sales:', error);
    }
  };

  // Handle Search Input
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = events.filter(
      (event) =>
        (usersMap[event.userId] && usersMap[event.userId].toLowerCase().includes(query)) ||
        event.title.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  };

    // Fetch ticket purchases for a specific event and open the modal
  const handleViewReport = async (eventId) => {
    if (!eventId) {
      console.error("Event ID: ", eventId);
      return;
    }

    try {
      const response = await axios.get(`${TICKET_PURCHASES_API_URL}?eventId=${eventId}`);
      setSelectedEventPurchases(response.data); // Set the fetched purchases
      setOpenModal(true); // Open modal
    } catch (error) {
      console.error('Failed to fetch event purchases:', error);
    }
  };

  // Handle delete event button click
  const handleDelete = (eventId) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const token = localStorage.getItem('token');
      // Delete event and its associated ticket purchases
      await axios.delete(`${EVENTS_API_URL}/${eventToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Event and its purchases deleted successfully');
      setEvents(events.filter((event) => event._id !== eventToDelete));
      setFilteredEvents(filteredEvents.filter((event) => event._id !== eventToDelete));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event and its purchases:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Manage Events</Typography>

      {/* Search Bar */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by Username or Title"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ ml: 2 }}
          >
            Search
          </Button>
        </Box>

        {/* Upcoming Events */}
        <Typography variant="h5" sx={{ mb: 2 }}>Upcoming Events</Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Date</TableCell>
                 <TableCell>Regular Price</TableCell>
                <TableCell>VIP Price</TableCell>
                <TableCell>VVIP Price</TableCell>
                <TableCell>Regular Tickets Sold</TableCell>
                <TableCell>VIP Tickets Sold</TableCell>
                <TableCell>VVIP Tickets Sold</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents
                .filter((event) => new Date(event.date) >= new Date()) // Upcoming events filter
                .map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{usersMap[event.userId] || 'Unknown User'}</TableCell>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>Ksh.{event.regularPrice ? event.regularPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>Ksh.{event.vipPrice ? event.vipPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>Ksh.{event.vvipPrice ? event.vvipPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{event.regularTicketsSold || 0}</TableCell>
                    <TableCell>{event.vipTicketsSold || 0}</TableCell>
                    <TableCell>{event.vvipTicketsSold || 0}</TableCell>
                    <TableCell>Ksh.{event.totalRevenue ? event.totalRevenue.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      color="primary"
                      onClick={() => handleViewReport(event._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="secondary"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Past Events */}
        <Typography variant="h5" sx={{ mb: 2 }}>Past Events</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Regular Price</TableCell>
                <TableCell>VIP Price</TableCell>
                <TableCell>VVIP Price</TableCell>
                <TableCell>Regular Tickets Sold</TableCell>
                <TableCell>VIP Tickets Sold</TableCell>
                <TableCell>VVIP Tickets Sold</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents
                .filter((event) => new Date(event.date) < new Date()) // Past events filter
                .map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{usersMap[event.userId] || 'Unknown User'}</TableCell>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>Ksh.{event.regularPrice ? event.regularPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>Ksh.{event.vipPrice ? event.vipPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>Ksh.{event.vvipPrice ? event.vvipPrice.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{event.regularTicketsSold || 0}</TableCell>
                    <TableCell>{event.vipTicketsSold || 0}</TableCell>
                    <TableCell>{event.vvipTicketsSold || 0}</TableCell>
                    <TableCell>Ksh.{event.totalRevenue ? event.totalRevenue.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      color="primary"
                      onClick={() => handleViewReport(event._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="secondary"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

            {/* Modal for viewing event ticket purchase report */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ width: '70%', margin: 'auto', mt: 5, p: 4, backgroundColor: 'white', borderRadius: 2 }}>
          <Typography variant="h6">Event Ticket Purchases</Typography>
          <TableContainer>
            <Table>
              <TableHead>
              <TableRow>
                  <TableCell>Ticket Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Payment Option</TableCell>
                  <TableCell>Total Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedEventPurchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>{purchase.ticketType}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>{purchase.email}</TableCell>
                    <TableCell>{purchase.phone}</TableCell>
                    <TableCell>{purchase.paymentOption}</TableCell>
                    <TableCell>{purchase.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action will also delete all associated ticket purchases and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventsAdmin;
