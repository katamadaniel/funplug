import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile, logoutUser } from './services/userService'; // Ensure logoutUser is implemented
import { Grid, TextField, Button, Avatar, Typography, Select, MenuItem, CircularProgress, FormControl, InputLabel, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useCache } from './contexts/CacheContext';

const DEFAULT_AVATAR_URL = '/default-avatar.png'; // Replace with your actual default avatar path

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
}));

const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [personalizeMode, setPersonalizeMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    gender: '',
    category: '',
    avatar: '',
    biography: '',
    background: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const { getFromCache, addToCache } = useCache();

  useEffect(() => {
    const loadProfile = async () => {
      const cachedProfile = getFromCache('userProfile');
      if (cachedProfile) {
        // Use cached profile data
        setUser(cachedProfile);
        setFormData({
          username: cachedProfile.username,
          email: cachedProfile.email,
          phone: cachedProfile.phone,
          gender: cachedProfile.gender,
          category: cachedProfile.category,
          avatar: cachedProfile.avatar,
          biography: cachedProfile.biography || '',
          background: cachedProfile.background || '',
        });
        setWarningCount(cachedProfile.warnings ? cachedProfile.warnings.length : 0);

        if (cachedProfile.isBanned) {
          alert('Your account has been banned due to excessive warnings. Please contact support.');
          logoutUser();
        }
      } else {
        // Fetch profile from API and cache it
        try {
          const profile = await fetchProfile(token);
          setUser(profile);
          addToCache('userProfile', profile);
          setFormData({
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            gender: profile.gender,
            category: profile.category,
            avatar: profile.avatar,
            biography: profile.biography || '',
            background: profile.background || '',
          });
          setWarningCount(profile.warnings ? profile.warnings.length : 0);

          if (profile.isBanned) {
            alert('Your account has been banned due to excessive warnings. Please contact support.');
            logoutUser();
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    loadProfile();
  }, [token, getFromCache, addToCache]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Saving changes...');
    const updatedProfile = new FormData();
    updatedProfile.append('username', formData.username);
    updatedProfile.append('email', formData.email);
    updatedProfile.append('phone', formData.phone);
    updatedProfile.append('gender', formData.gender);
    updatedProfile.append('category', formData.category);
    updatedProfile.append('biography', formData.biography);
    updatedProfile.append('background', formData.background);
    if (avatarFile) {
      updatedProfile.append('avatar', avatarFile);
    }

    try {
      const updatedUser = await updateProfile(updatedProfile, token);
      setUser(updatedUser);
      setEditMode(false);
      setPersonalizeMode(false);
      setStatusMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatusMessage('Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} align="center">
            <StyledAvatar src={user.avatar ? `data:image/png;base64,${user.avatar}` : DEFAULT_AVATAR_URL} />
            {editMode && (
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: 8 }} />
            )}
          </Grid>

          {editMode ? (
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Music">Music</MenuItem>
                    <MenuItem value="Art">Art</MenuItem>
                    <MenuItem value="Games">Games</MenuItem>
                    <MenuItem value="Movies">Movies</MenuItem>
                    <MenuItem value="Media">Media</MenuItem>
                    <MenuItem value="Dance">Dance</MenuItem>
                    <MenuItem value="Fashion">Fashion</MenuItem>
                    <MenuItem value="Kids Fun">Kids Fun</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                  Save
                </Button>
              </form>
            </Grid>
          ) : (
              <Grid item xs={12}>
                <Typography variant="h6">Username: {user.username}</Typography>
                <Typography variant="subtitle1">Email: {user.email}</Typography>
                <Typography variant="subtitle1">Phone: {user.phone}</Typography>
                <Typography variant="subtitle1">Gender: {user.gender}</Typography>
                <Typography variant="subtitle1">Category: {user.category}</Typography>
              </Grid>
              )}
              <Grid item xs={12}>
                <Button variant="outlined" onClick={() => setEditMode(!editMode)} fullWidth>
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
                <Button onClick={() => setPersonalizeMode(!personalizeMode)} sx={{ mt: 2, ml: 2 }}>
                  {personalizeMode ? 'Cancel' : 'Personalize'}
                </Button>
              </Grid>

          {personalizeMode && (
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
                <TextField
                  label="Background"
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
                <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                  Save
                </Button>
              </form>
            </Grid>
          )}

      {user && (user.biography || user.background) && (
        <Grid item xs={12}>
          <Typography variant="h6">Personal Details</Typography>
          <Typography variant="body1"><strong>Biography:</strong> {user.biography}</Typography>
          <Typography variant="body1"><strong>Background:</strong> {user.background}</Typography>
        </Grid>
      )}
          {warningCount > 0 && (
            <Grid item sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
            <Typography color="warning.main">You have {warningCount} warning(s).</Typography>
            {warningCount >= 3 && (
              <Typography color="error.main">
                Your account has been banned due to excessive warnings. Please contact support for further assistance.
              </Typography>
            )}
          </Grid>
          )}

          {statusMessage && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="secondary">
                {statusMessage}
              </Typography>
            </Grid>
          )}
        </Grid>
    </Box>
  );
};

export default Profile;
