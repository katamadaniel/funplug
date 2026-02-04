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
import { getAllVenues, updateVenueStatus, getBookingsByVenueId } from '../../services/venuesService';
import  { exportBookingsToCSV } from './adminHelpers';

const VenuesAdmin = () => {
  const [venues, setVenues] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
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
      fetchVenues();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

const initialize = async () => {
    try {
      await fetchAdminProfile();
      await fetchUsers();
      await fetchVenues();
    } catch (error) {
      console.error('Admin initialization failed:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      const mapping = {};
      users.forEach((user) => {
        mapping[user._id] = user.username;
      });
      setUsersMap(mapping);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

const fetchVenues = async () => {
  try {
    const venuesData = await getAllVenues();

    const enrichedVenues = await Promise.all(
      venuesData.map(async (venue) => {
        let username = 'Unknown User';
        try {
          const user = await getUserById(venue.userId);
          username = user.username;
        } catch {/* ignore */}

        const allBookings = await getBookingsByVenueId(venue._id);
        const successBookings = allBookings.filter(
          (b) => b.paymentStatus === 'Success'
        );

        const bookingCount = successBookings.length;
        const totalAmount = successBookings.reduce(
          (sum, b) => sum + (b.totalAmount || 0),
          0
        );

        return { ...venue, username, bookingCount, totalAmount };
      })
    );

    setVenues(enrichedVenues);
    setFilteredVenues(enrichedVenues);
  } catch (error) {
    console.error('Failed to fetch venues:', error);
  }
};

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = venues.filter(
      (venue) =>
        (usersMap[venue.userId] && usersMap[venue.userId].toLowerCase().includes(query)) ||
        venue.name.toLowerCase().includes(query)
    );
    setFilteredVenues(filtered);
  };

  const handleViewReport = async (venueId) => {
    try {
      const bookings = await getBookingsByVenueId(venueId);
      setSelectedBookings(
        bookings.filter(
          (b) => b.paymentStatus === 'Success')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      setOpenModal(true);
    } catch (error) {
      console.error('Failed to fetch venue bookings:', error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateVenueStatus(id, currentStatus === 'Active' ? 'Suspended' : 'Active');
      fetchVenues(); // refresh list
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
      <Typography variant="h4">Manage Venues</Typography>

      {/* Search Bar */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by Username or Venue Name"
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

        {/* Venues Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Venue Name</TableCell>
                <TableCell>Venue Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Charges (per hour)</TableCell>
                <TableCell>Booking Count</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue._id}>
                  <TableCell>{usersMap[venue.userId] || 'Unknown User'}</TableCell>
                  <TableCell>{venue.name}</TableCell>
                  <TableCell>{venue.venueType}</TableCell>
                  <TableCell>{venue.country}</TableCell>
                  <TableCell>{venue.city}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>{venue.bookingStatus}</TableCell>
                  <TableCell>{venue.charges.toFixed(2)}</TableCell>
                  <TableCell>{venue.bookingCount}</TableCell>
                  <TableCell>{venue.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      color="primary"
                      onClick={() => handleViewReport(venue._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      color={venue.status === 'Active' ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(venue._id, venue.status)}
                    >
                      {venue.status === 'Active' ? 'Suspend' : 'Approve'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Venue booking report */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} scroll="paper">
        <Box sx={{
           width: '70%',
           maxHeight: '85vh',
           overflowY: 'auto', 
           mx: 'auto', 
           mt: 5, p: 4, 
           bgcolor: 'background.paper', 
           borderRadius: 2, }}>
          <Typography variant="h6">Venue Booking Report</Typography>

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
                  'venue-bookings.csv'
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

export default VenuesAdmin;
