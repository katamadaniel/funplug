import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, Grid } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import adminService from '../../services/adminService';

const AdminSettings = ({ initialAdmin }) => {
  const [admin, setAdmin] = useState(initialAdmin || null);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    password: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await adminService.fetchAdminProfile();
        setAdmin(data);
        setFormData((prev) => ({ ...prev, name: data.name }));
        setPreviewUrl(data.avatarUrl); // Use Cloudinary URL directly
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        if (error.response?.status === 401) {
          alert('Unauthorized access. Please log in again.');
        }
      }
    };

    if (!admin) fetchProfile();
  }, [admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = { ...formData };
      if (!formData.password) delete updateData.password;

      await adminService.updateProfile(updateData);

      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        await adminService.uploadAvatar(formData);
      }

      const updated = await adminService.fetchAdminProfile();
      setAdmin(updated);
      setPreviewUrl(updated.avatarUrl);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleRemoveAvatar = async () => {
  if (!window.confirm('Are you sure you want to remove your avatar?')) return;
  try {
    await adminService.removeAvatar();
    const updated = await adminService.fetchAdminProfile();
    setAdmin(updated);
    alert('Avatar removed successfully!');
  } catch (error) {
    console.error('Error removing avatar:', error);
    alert('Failed to remove avatar.');
  }
};

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" mb={3}>Settings</Typography>

      {admin?.name && (
        <Typography variant="h6" mb={3}>Welcome, {admin.name}!</Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" mb={1}>Avatar</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={previewUrl || '/default-avatar.png'}
              alt="Admin Avatar"
              sx={{ width: { xs: 70, md: 100 }, height: { xs: 70, md: 100 }, mb: 2 }}
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
          <Button
            color="error"
            variant="outlined"
            onClick={handleRemoveAvatar}
            sx={{ mt: 1 }}
          >
            Remove Avatar
          </Button>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          fullWidth
          sx={{ maxWidth: { xs: '100%', md: '200px' }, mx: 'auto' }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSettings;
