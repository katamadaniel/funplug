import { useEffect, useState, useMemo } from 'react';
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
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchAdminProfile } from '../../services/adminService';
import { getAllUsers, getUserById } from '../../services/userService';
import { getAllCards, updatePerformanceStatus, getBookingsByCardId,} from '../../services/performanceService';
import  { exportBookingsToCSV } from './adminHelpers';

const PerformanceAdmin = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');

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
      setSelectedBookings(
         bookings.filter(
          (b) => b.paymentStatus === 'Success')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
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

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.toLowerCase();
    return selectedBookings.filter(
      b =>
        b.email?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.clientName?.toLowerCase().includes(q)
    );
  }, [selectedBookings, bookingSearch]);

  const summary = useMemo(
    () =>
    filteredBookings.reduce(
        (acc, b) => {
          acc.totalRevenue += Number(b.totalAmount) || 0;
          acc.totalBookings += Number(b.bookingCount) || 0;
          return acc;
        },
      { totalBookings: 0, totalRevenue: 0 }
    ),
    [filteredBookings]
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
                  <TableCell>Ksh. {card.totalAmount.toFixed(2)}</TableCell>
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

      {/* Performance booking Report */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} scroll="paper">
        <Box sx={{
           width: '70%',
           maxHeight: '85vh',
           overflowY: 'auto', 
           mx: 'auto', 
           mt: 5, p: 4, 
           bgcolor: 'background.paper', 
           borderRadius: 2, }}>
          <Typography variant="h6">Performance Booking Report</Typography>

          <TextField
            size="small"
            fullWidth
            placeholder="Search bookings"
            value={bookingSearch}
            onChange={e => setBookingSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Bookings</Typography>
                <Typography>{filteredBookings.length}</Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography>Ksh. {summary.totalRevenue.toFixed(2)}</Typography>
              </Paper>
            </Box>

            <Button
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() =>
                exportBookingsToCSV(
                  filteredBookings,
                  'performance-bookings.csv'
                )
              }
            >
              Export CSV
            </Button>
            <TableContainer>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Booking Date</TableCell>
                    <TableCell>Duration (hours)</TableCell>
                    <TableCell>Total Paid (Ksh.)</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {filteredBookings.map((booking, index) => (
                    <TableRow key={booking._id}>
                    <TableCell>{index + 1}</TableCell>
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
    </div>
  );
};

export default PerformanceAdmin;
