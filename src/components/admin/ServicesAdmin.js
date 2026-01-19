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
import { getAllServices, updateServiceStatus, getBookingsByServiceId,} from '../../services/serviceService';
import  { filterSuccessfulBookings, calculateStats, exportBookingsToCSV } from './adminHeplers';

const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBookings, setSelectedBookings] = useState([]);
  const [openModal, setOpenModal] = useState(false);

//  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//  const [serviceToDelete, setServiceToDelete] = useState(null);

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
      fetchServices();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

const initialize = async () => {
    try {
      await fetchAdminProfile();
      await fetchUsers();
      await fetchServices();
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

  const fetchServices = async () => {
    try {
      const servicesData = await getAllServices();

      const enrichedServices = await Promise.all(
        servicesData.map(async (service) => {
          let username = 'Unknown User';

          try {
            const user = await getUserById(service.userId);
            username = user.username;
          } catch {/* ignore */}

          const bookings = await getBookingsByServiceId(service._id);
          const successBookings = bookings.filter(
            (b) => b.paymentStatus === 'Success'
          );

          const bookingCount = successBookings.length;
          const totalAmount = successBookings.reduce(
            (sum, b) => sum + (b.totalAmount || 0),
            0
          );

          return {
            ...service,
            username,
            bookingCount,
            totalAmount,
          };
        })
      );

      setServices(enrichedServices);
      setFilteredServices(enrichedServices);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();

    const filtered = services.filter(
      (service) =>
        service.serviceType?.toLowerCase().includes(query) ||
        usersMap[service.userId]?.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  };

  const handleViewReport = async (serviceId) => {
    try {
      const bookings = await getBookingsByServiceId(serviceId);
      const successBookings = bookings.filter(
        (b) => b.paymentStatus === 'Success'
      );
      setSelectedBookings(successBookings);
      setOpenModal(true);
    } catch (err) {
      console.error('Failed to fetch service bookings:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateServiceStatus(id, currentStatus === 'Active' ? 'Suspended' : 'Active');
      fetchServices(); // refresh list
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

/*  const handleDelete = (serviceId) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteServiceById(serviceToDelete);
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete));
      setFilteredServices((prev) =>
        prev.filter((s) => s._id !== serviceToDelete)
      );
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  }; */

  const summary = selectedBookings.reduce(
    (acc, service) => {
      acc.totalBookings += service.bookingCount;
      acc.totalRevenue += service.totalAmount;
      return acc;
    },
    { totalBookings: 0, totalRevenue: 0 }
  );

return (
    <div>
      <Typography variant="h4">Manage Services</Typography>

      {/* Search */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by Username or Service Type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{ width: 320 }}
          />
          <Button
            sx={{ ml: 2 }}
            variant="contained"
            onClick={handleSearch}
          >
            Search
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Charges (Ksh.)</TableCell>
                <TableCell>Booking Status</TableCell>
                <TableCell>Booking Count</TableCell>
                <TableCell>Total Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>{usersMap[service.userId] || 'Unknown'}</TableCell>
                  <TableCell>{service.serviceType}</TableCell>
                  <TableCell>{service.country}</TableCell>
                  <TableCell>{service.city}</TableCell>
                  <TableCell>{service.charges?.toFixed(2)}</TableCell>
                  <TableCell>{service.bookingStatus}</TableCell>
                  <TableCell>{service.bookingCount}</TableCell>
                  <TableCell>{service.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewReport(service._id)}
                    >
                      View Report
                    </Button>
                    <Button
                      color={service.status === 'Active' ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(service._id, service.status)}
                    >
                      {service.status === 'Active' ? 'Suspend' : 'Approve'}
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
          <Typography variant="h6">Service Booking Report</Typography>
            <Button
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() =>
                exportBookingsToCSV(
                  selectedBookings,
                  'service-bookings.csv'
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

      {/* Delete Confirmation 
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this service? This action cannot be undone.
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

export default ServicesAdmin;
