import React, { useState, useEffect } from 'react';
import { fetchProfile, updateProfile, logoutUser } from './services/userService';
import { Grid, TextField, Button, Avatar, Typography, Select, MenuItem, CircularProgress, FormControl, InputLabel, Box, Dialog,
   DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import { getAvatarUrl } from './utils/avatar';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
}));

const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [personalizeMode, setPersonalizeMode] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile(token);
        setUser(profile);
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
          alert('Your account has been banned due to violation of user agreement. Please contact support.');
          logoutUser();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    loadProfile();
  }, [token]);

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
      const response = await updateProfile(updatedProfile, token);
      
      if (response.message && response.message.includes('Verification email sent')) {
        setStatusMessage('Verification email sent to your current email. Please verify the email update request.');
      } else {
        setUser(response);
        setEditMode(false);
        setPersonalizeMode(false);
        setStatusMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
  
      if (error.response?.data?.message) {
        setStatusMessage(error.response.data.message);
      } else {
        setStatusMessage('Failed to update profile. Please try again.');
      }
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
          <StyledAvatar src={getAvatarUrl(user)} />
          {editMode && (
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: 8 }} />
          )}

          {/* Followers Count and Button */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Followers: {user.followers ? user.followers.length : 0}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setFollowersOpen(true)}
          >
            View Followers
          </Button>
        </Grid>

        {/* Other Profile Info (Edit Form / Personalize) */}
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

        {/* Edit / Personalize Buttons */}
        <Grid item xs={12}>
          <Button variant="outlined" onClick={() => setEditMode(!editMode)} fullWidth>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
          <Button onClick={() => setPersonalizeMode(!personalizeMode)} sx={{ mt: 2, ml: 2 }}>
            {personalizeMode ? 'Cancel' : 'Personalize'}
          </Button>
        </Grid>

        {/* Personalize Form */}
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

        {/* Warnings Display */}
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

        {/* Status Message */}
        {statusMessage && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="secondary">
              {statusMessage}
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Followers List Dialog */}
      <Dialog open={followersOpen} onClose={() => setFollowersOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>
    Followers
    <IconButton
      aria-label="close"
      onClick={() => setFollowersOpen(false)}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    {user.followers && user.followers.length > 0 ? (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Followed Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {user.followers.map((follower, index) => (
            <TableRow key={index}>
              <TableCell>{follower.name}</TableCell>
              <TableCell>{follower.email}</TableCell>
              <TableCell>{new Date(follower.followedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <Typography>No followers yet.</Typography>
    )}
  </DialogContent>
</Dialog>
    </Box>
  );
};

export default Profile;
