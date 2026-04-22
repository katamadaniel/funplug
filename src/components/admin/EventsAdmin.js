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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

import { getAllUsers } from '../../services/userService';
import {
  fetchAllEvents,
  getAllTicketSales,
  purchaseByEventId,
  updateEventStatus,
} from '../../services/eventService';
import { fetchAdminProfile } from '../../services/adminService';
import { exportBookingsToCSV } from './adminHelpers';

const EventsAdmin = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedEventPurchases, setSelectedEventPurchases] = useState([]);
  const [purchaseSearch, setPurchaseSearch] = useState('');

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
    else initialize();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(fetchEventsWithSales, 30000);
    return () => clearInterval(interval);
  }, []);

  const initialize = async () => {
    await fetchAdminProfile();
    await fetchUsers();
    await fetchEventsWithSales();
  };

  const fetchUsers = async () => {
    const users = await getAllUsers();
    const map = {};
    users.forEach(u => (map[u._id] = u.username));
    setUsersMap(map);
  };

  const fetchEventsWithSales = async () => {
    const eventsData = await fetchAllEvents();
    const salesData = await getAllTicketSales();

    const merged = eventsData.map(event => {
      const sales = salesData.find(s => s.eventId === event._id) || {};
      return {
        ...event,
        regularTicketsSold: sales.regularTicketsSold || 0,
        vipTicketsSold: sales.vipTicketsSold || 0,
        vvipTicketsSold: sales.vvipTicketsSold || 0,
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
          usersMap[e.userId]?.toLowerCase().includes(q)
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

  const renderEventTable = eventsList => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Total Revenue</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {eventsList.map(event => (
          <TableRow key={event._id}>
            <TableCell>{usersMap[event.userId] || 'Unknown'}</TableCell>
            <TableCell>{event.title}</TableCell>
            <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
            <TableCell>Ksh. {event.totalRevenue.toFixed(2)}</TableCell>
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
