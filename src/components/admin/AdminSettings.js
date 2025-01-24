import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, Grid } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const PROFILE_API_URL = 'http://localhost:5000/api/admins/profile';

const AdminSettings = ({ initialAdmin }) => {
  const [admin, setAdmin] = useState(initialAdmin || null);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    password: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          alert('You are not authorized. Please log in again.');
          return;
        }

        const response = await axios.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(response.data);
        setFormData((prev) => ({ ...prev, name: response.data.name }));
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        if (error.response && error.response.status === 401) {
          alert('Unauthorized access. Please log in again.');
          // Handle re-authentication or redirection
        }
      }
    };

    if (!admin) fetchProfile();
  }, [admin, setAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAdmin((prev) => ({ ...prev, avatarUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Update profile information
      const updateData = { ...formData };
      if (formData.password === '') delete updateData.password; // Omit password if not being changed

      await axios.put(PROFILE_API_URL, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      // Upload avatar if a new file is selected
      if (selectedFile) {
        const avatarData = new FormData();
        avatarData.append('avatar', selectedFile);
        await axios.post(`${PROFILE_API_URL}/avatar`, avatarData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Fetch updated profile
      const response = await axios.get(PROFILE_API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      setAdmin(response.data);

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" mb={3}>Settings</Typography>

      {admin?.name && (
        <Typography variant="h6" mb={3}>
          Welcome, {admin.name}!
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Profile Details Form */}
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="h6" mb={2}>Profile Details</Typography>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Leave blank to keep current password"
              sx={{ mb: 2 }}
            />
          </Box>
        </Grid>

        {/* Avatar Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" mb={1}>Avatar</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={admin?.avatarUrl ? `http://localhost:5000${admin.avatarUrl}` : '/default-avatar.png'}
              alt="Admin Avatar"
              sx={{
                width: { xs: 70, md: 100 },
                height: { xs: 70, md: 100 },
                mb: 2,
              }}
            />
            <label htmlFor="avatar-upload">
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
        </Grid>
      </Grid>

      {/* Save Changes Button */}
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          fullWidth={true}
          sx={{ maxWidth: { xs: '100%', md: '200px' }, mx: 'auto' }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSettings;
