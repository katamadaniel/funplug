import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Alert
} from '@mui/material';

import {
  fetchAllAdmins,
  createAdmin,
  deleteAdminById,
  fetchAdminProfile
} from '../../services/adminService';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchAdminProfile();
        await fetchAdmins();
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        navigate('/admin');
      }
    };

    initialize();
  }, [navigate]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdmins();
      setAdmins(data);
    } catch (err) {
      setError('Error fetching admins. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!newAdmin.name) formErrors.name = 'Name is required';
    if (!newAdmin.email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      formErrors.email = 'Email is not valid';
    }
    if (!newAdmin.password) {
      formErrors.password = 'Password is required';
    } else if (newAdmin.password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const addAdmin = async () => {
    if (!validateForm()) return;
    setError(null);
    setSuccess(null);

    try {
      const addedAdmin = await createAdmin(newAdmin);
      setAdmins([...admins, addedAdmin]);
      setNewAdmin({ name: '', email: '', password: '' });
      setSuccess('Admin added successfully');
    } catch (err) {
      setError('Error adding admin. Please try again.');
    }
  };

  const deleteAdmin = async (adminId) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteAdminById(adminId);
      setAdmins(admins.filter((admin) => admin._id !== adminId));
      setSuccess('Admin deleted successfully');
    } catch (err) {
      setError('Error deleting admin. Please try again.');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Manage Admins</Typography>

      {loading && <p>Loading...</p>}
      {error && <Alert severity="error" sx={{ marginBottom: '1rem' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginBottom: '1rem' }}>{success}</Alert>}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Password</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin._id}>
              <TableCell>{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>••••••••</TableCell>
              <TableCell>
                <Button variant="contained" color="secondary" onClick={() => deleteAdmin(admin._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6">Add New Admin</Typography>
        <TextField
          label="Name"
          name="name"
          value={newAdmin.name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        />
        <TextField
          label="Email"
          name="email"
          value={newAdmin.email}
          onChange={handleInputChange}
          error={!!errors.email}
          helperText={errors.email}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={newAdmin.password}
          onChange={handleInputChange}
          error={!!errors.password}
          helperText={errors.password}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        />
        <Button variant="contained" color="primary" onClick={addAdmin}>
          Add Admin
        </Button>
      </div>
    </div>
  );
};

export default Admins;
