import React, { useEffect, useState } from 'react';
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

import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { fetchAdminProfile } from '../../services/adminService';
import { getAllUsers, getUserById } from '../../services/userService';
import { getAllCards, updatePerformanceStatus, getBookingsByCardId,} from '../../services/performanceService';
import  { filterSuccessfulBookings, calculateStats, exportBookingsToCSV } from './adminHeplers';

const PerformanceAdmin = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBookings, setSelectedBookings] = useState([]);
  const [openModal, setOpenModal] = useState(false);

//  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//  const [cardToDelete, setCardToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    } else {
      initialize();
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCards();
    }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);

const initialize = async () => {
    try {
      await fetchAdminProfile();
      await fetchUsers();
      await fetchCards();
    } catch (err) {
      console.error('Admin initialization failed:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      const map = {};
      users.forEach((user) => {
        map[user._id] = user.username;
      });
      setUsersMap(map);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCards = async () => {
    try {
      const cardsData = await getAllCards();

      const enrichedCards = await Promise.all(
        cardsData.map(async (card) => {
          let username = 'Unknown User';

          try {
            const user = await getUserById(card.userId);
            username = user.username;
          } catch {/* ignore */}

          const bookings = await getBookingsByCardId(card._id);
          const successBookings = bookings.filter(
            (b) => b.paymentStatus === 'Success'
          );

          const bookingCount = successBookings.length;
          const totalAmount = successBookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0
          );

          return { ...card, username, bookingCount, totalAmount, };
        })
      );

      setCards(enrichedCards);
      setFilteredCards(enrichedCards);
    } catch (err) {
      console.error('Failed to fetch performances:', err);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();

    const filtered = cards.filter(
      (card) =>
        card.artType?.toLowerCase().includes(query) ||
        usersMap[card.userId]?.toLowerCase().includes(query)
    );

    setFilteredCards(filtered);
  };

  const handleViewReport = async (cardId) => {
    try {
      const bookings = await getBookingsByCardId(cardId);
      const successBookings = bookings.filter(
        (b) => b.paymentStatus === 'Success'
      );
      setSelectedBookings(successBookings);
      setOpenModal(true);
    } catch (err) {
      console.error('Failed to load performance bookings:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updatePerformanceStatus(id, currentStatus === 'Active' ? 'Suspended' : 'Active');
      fetchCards(); // refresh list
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

/*  const handleDelete = (cardId) => {
      setCardToDelete(cardId);
      setDeleteDialogOpen(true);
    };

  const confirmDelete = async () => {
    try {
      await deleteCardById(cardToDelete);
      setCards((prev) => prev.filter((c) => c._id !== cardToDelete));
      setFilteredCards((prev) => prev.filter((c) => c._id !== cardToDelete));
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    } catch (err) {
      console.error('Failed to delete performance:', err);
    }
  }; */

  const summary = selectedBookings.reduce(
    (acc, performance) => {
      acc.totalBookings += performance.bookingCount;
      acc.totalRevenue += performance.totalAmount;
      return acc;
    },
    { totalBookings: 0, totalRevenue: 0 }
  );
  return (
    <div>
      <Typography variant="h4">Manage Performances</Typography>

      {/* Search */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by Username or Art Type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{ width: 320 }}
          />
          <Button sx={{ ml: 2 }} variant="contained"  onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Stage Name</TableCell>
                <TableCell>Art Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Charges (per hour)</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Booking Count</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card._id}>
                  <TableCell>{usersMap[card.userId] || 'Unknown'}</TableCell>
                  <TableCell>{card.name}</TableCell>
                  <TableCell>{card.artType}</TableCell>
                  <TableCell>{card.country}</TableCell>
                  <TableCell>{card.city}</TableCell>
                  <TableCell>{card.charges?.toFixed(2)}</TableCell>
                  <TableCell>{card.bookingStatus}</TableCell>
                  <TableCell>{card.bookingCount}</TableCell>
                  <TableCell>{card.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      color="primary"
                      onClick={() => handleViewReport(card._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      color={card.status === 'Active' ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(card._id, card.status)}
                    >
                      {card.status === 'Active' ? 'Suspend' : 'Approve'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Booking Report Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ width: '70%', mx: 'auto', mt: 5, p: 4, bgcolor: 'white', borderRadius: 2, }}>
          <Typography variant="h6">Performance Booking Report</Typography>
            <Button
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() =>
                exportBookingsToCSV(
                  selectedBookings,
                  'performance-bookings.csv'
                )
              }
            >
              Export CSV
            </Button>
            <TableContainer>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Bookings</Typography>
                <Typography>{summary.totalBookings}</Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography>Ksh. {summary.totalRevenue.toFixed(2)}</Typography>
              </Paper>
            </Box>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Booking Date</TableCell>
                    <TableCell>Duration (hours)</TableCell>
                    <TableCell>Total Paid (Ksh.)</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {selectedBookings.map((booking) => (
                    <TableRow key={booking._id}>
                    <TableCell>{booking.clientName}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.duration}</TableCell>
                    <TableCell>{booking.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Delete Dialog 
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Performance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this performance? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="secondary" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog> */}
    </div>
  );
};

export default PerformanceAdmin;
