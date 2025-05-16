import React, { useContext, useEffect, useState } from 'react';
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
import { VenuesContext } from '../../contexts/VenuesContext';
import { fetchAdminProfile } from '../../services/adminService';
import { getAllUsers, getUserById } from '../../services/userService';
import { getAllVenues, deleteVenueById, getVenueBookingsByVenueId } from '../../services/venuesService';

const VenuesAdmin = () => {
  const [venues, setVenues] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [selectedVenueBookings, setSelectedVenueBookings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const { mostBookedVenues } = useContext(VenuesContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    } else {
      fetchInitialData();
    }
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      await fetchAdminProfile(); // Optional: Verify admin is valid
      await fetchUsers();
      await fetchVenues();
    } catch (error) {
      console.error('Initialization failed:', error);
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
      const updatedVenues = await Promise.all(
        venuesData.map(async (venue) => {
          try {
            const user = await getUserById(venue.userId);
            return { ...venue, username: user.username };
          } catch {
            return { ...venue, username: 'Unknown User' };
          }
        })
      );

      const enrichedVenues = updatedVenues.map((venue) => {
        const bookingData = mostBookedVenues.find((v) => v._id === venue._id);
        return {
          ...venue,
          bookingCount: bookingData ? bookingData.bookingCount : 0,
          totalAmount: bookingData ? bookingData.totalAmount : 0,
        };
      });

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
      const bookings = await getVenueBookingsByVenueId(venueId);
      setSelectedVenueBookings(bookings);
      setOpenModal(true);
    } catch (error) {
      console.error('Failed to fetch venue bookings:', error);
    }
  };

  const handleDelete = (venueId) => {
    setVenueToDelete(venueId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVenueById(venueToDelete);
      setVenues((prev) => prev.filter((v) => v._id !== venueToDelete));
      setFilteredVenues((prev) => prev.filter((v) => v._id !== venueToDelete));
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error('Failed to delete venue:', error);
    }
  };

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
                <TableCell>Location</TableCell>
                <TableCell>Size (sq ft)</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Charges (per hour)</TableCell>
                <TableCell>Booking Count</TableCell>
                <TableCell>Total Booking Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue._id}>
                  <TableCell>{usersMap[venue.userId] || 'Unknown User'}</TableCell>
                  <TableCell>{venue.name}</TableCell>
                  <TableCell>{venue.location}</TableCell>
                  <TableCell>{venue.size}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>{venue.bookingStatus}</TableCell>
                  <TableCell>Ksh.{venue.charges.toFixed(2)}</TableCell>
                  <TableCell>{venue.bookingCount}</TableCell>
                  <TableCell>Ksh.{venue.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      color="primary"
                      onClick={() => handleViewReport(venue._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="secondary"
                      onClick={() => handleDelete(venue._id)}
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

      {/* Modal for viewing venue booking report */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ width: '70%', margin: 'auto', mt: 5, p: 4, backgroundColor: 'white', borderRadius: 2 }}>
          <Typography variant="h6">Venue Booking Report</Typography>
          <TableContainer>
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
                {selectedVenueBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.duration}</TableCell>
                    <TableCell>{booking.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Venue</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this venue? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VenuesAdmin;
