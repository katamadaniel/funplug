import { useState, useEffect, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  fetchAllEvents,
  getAllTicketSales,
  purchaseByEventId,
  updateEventStatus,
  deleteEvent,
} from '../../services/eventService';
import { fetchAdminProfile } from '../../services/adminService';
import { exportBookingsToCSV } from './adminHelpers';

const EventsAdmin = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedEventPurchases, setSelectedEventPurchases] = useState([]);
  const [purchaseSearch, setPurchaseSearch] = useState('');

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    } else {
      initialize();
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(fetchEventsWithSales, 30000);
    return () => clearInterval(interval);
  }, []);

  const initialize = async () => {
    setLoading(true);
    try {
      await fetchAdminProfile();
      await fetchEventsWithSales();
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsWithSales = async () => {
    const eventsData = await fetchAllEvents();
    const salesData = await getAllTicketSales();

    const merged = eventsData.map(event => {
      const sales = salesData.find(s => s.eventId === event._id) || {};
      return {
        ...event,
        totalTicketsSold: sales.totalTicketsSold || 0,
        totalRevenue: sales.totalRevenue || 0,
      };
    });

    setEvents(merged);
    setFilteredEvents(merged);
  };

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    setFilteredEvents(
      events.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.userSnapshot?.username?.toLowerCase().includes(q)
      )
    );
  };

  const handleViewReport = async eventId => {
    const purchases = await purchaseByEventId(eventId);
    setSelectedEventPurchases(
      purchases.filter((p) => p.paymentStatus === 'Success')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
    setOpenModal(true);
  };

  const handleDeleteClick = (eventId, eventName) => {
    setDeleteConfirm({ open: true, id: eventId, name: eventName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(deleteConfirm.id);
      setEvents(events.filter(e => e._id !== deleteConfirm.id));
      setFilteredEvents(filteredEvents.filter(e => e._id !== deleteConfirm.id));
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null, name: '' });
  };

  const filteredPurchases = useMemo(() => {
    const q = purchaseSearch.toLowerCase();
    return selectedEventPurchases.filter(
      p =>
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.clientName?.toLowerCase().includes(q)
    );
  }, [selectedEventPurchases, purchaseSearch]);

  const revenueSummary = useMemo(
    () =>
      filteredPurchases.reduce(
        (acc, p) => {
          acc.totalRevenue += Number(p.totalAmount) || 0;
          acc.totalTickets += Number(p.quantity) || 0;
          return acc;
        },
        { totalRevenue: 0, totalTickets: 0 }
      ),
    [filteredPurchases]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const renderEventTable = eventsList => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Packages</TableCell>
          <TableCell>Tickets Sold</TableCell>
          <TableCell>Total Revenue</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {eventsList.map(event => (
          <TableRow key={event._id}>
            <TableCell>{event.userSnapshot?.username || 'Unknown User'}</TableCell>
            <TableCell>{event.title}</TableCell>
            <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
            <TableCell>{event.ticketType === 'free' ? 'Free event' : `${event.ticketPackages?.length || 0}`}</TableCell>
            <TableCell>{event.totalTicketsSold || 0}</TableCell>
            <TableCell>Ksh. {event.totalRevenue?.toFixed(2) || '0.00'}</TableCell>
            <TableCell>
              <Button
                startIcon={<VisibilityIcon />}
                onClick={() => handleViewReport(event._id)}
              >
                View Report
              </Button>
              <Button
                color={event.status === 'Active' ? 'warning' : 'success'}
                disabled={updatingStatusId === event._id}
                onClick={() =>
                  updateEventStatus(
                    event._id,
                    event.status === 'Active' ? 'Suspended' : 'Active'
                  )
                }
              >
                {event.status === 'Active' ? 'Suspend' : 'Approve'}
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => handleDeleteClick(event._id, event.title)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Typography variant="h4" mb={2}>
        Manage Events
      </Typography>

      {/* SEARCH */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          size="small"
          placeholder="Search events"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon /> }}
        />
        <Button sx={{ ml: 2 }} onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* UPCOMING */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Upcoming Events</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            {renderEventTable(
              filteredEvents.filter(e => new Date(e.date) >= new Date())
            )}
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* PAST */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Past Events</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            {renderEventTable(
              filteredEvents.filter(e => new Date(e.date) < new Date())
            )}
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
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

      {/* ================= PURCHASE MODAL ================= */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: '75%',
            maxHeight: '85vh',
            overflowY: 'auto',
            mx: 'auto',
            mt: 5,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Ticket Purchases
          </Typography>

          <TextField
            size="small"
            fullWidth
            placeholder="Search purchases"
            value={purchaseSearch}
            onChange={e => setPurchaseSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={3} mb={2}>
            <Paper sx={{ p: 2 }}>
              <Typography>Total Tickets</Typography>
              <Typography variant="h6">{revenueSummary.totalTickets}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography>Total Revenue</Typography>
              <Typography variant="h6">
                Ksh. {revenueSummary.totalRevenue.toFixed(2)}
              </Typography>
            </Paper>
          </Box>

          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() =>
              exportBookingsToCSV(filteredPurchases, 'ticket-purchases.csv')
            }
          >
            Export CSV
          </Button>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Ticket</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPurchases.map((p, i) => (
                <TableRow key={p._id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{p.clientName}</TableCell>
                  <TableCell>{p.ticketType}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>Ksh. {p.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Modal>
    </>
  );
};

export default EventsAdmin;
