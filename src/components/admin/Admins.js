import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Alert } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const ADMINS_API_URL = `${API_URL}/api/admins`;

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set token for requests
      fetchAdmins();
    }
  }, [navigate]);

  // Function to fetch the list of admins from the backend
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(ADMINS_API_URL);
      setAdmins(response.data);
    } catch (err) {
      setError('Error fetching admins. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle input changes for the new admin form
  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  // Validation function
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

  // Function to add a new admin
  const addAdmin = async () => {
    if (!validateForm()) return; // Stop if form is invalid
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(ADMINS_API_URL, newAdmin);
      setAdmins([...admins, response.data]); // Add new admin to the state
      setNewAdmin({ name: '', email: '', password: '' }); // Clear form inputs
      setSuccess('Admin added successfully');
    } catch (err) {
      setError('Error adding admin. Please try again.');
    }
  };

  // Function to delete an admin
  const deleteAdmin = async (adminId) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${ADMINS_API_URL}/${adminId}`);
      setAdmins(admins.filter((admin) => admin._id !== adminId)); // Remove deleted admin from state
      setSuccess('Admin deleted successfully');
    } catch (err) {
      setError('Error deleting admin. Please try again.');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Manage Admins</Typography>

      {/* Display loading, error, or success message */}
      {loading ? <p>Loading...</p> : null}
      {error ? <Alert severity="error" sx={{ marginBottom: '1rem' }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ marginBottom: '1rem' }}>{success}</Alert> : null}

      {/* Admins Table */}
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
              <TableCell>••••••••</TableCell> {/* Hides password */}
              <TableCell>
                <Button variant="contained" color="secondary" onClick={() => deleteAdmin(admin._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add New Admin Form */}
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
