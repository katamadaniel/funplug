import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import { deleteUser } from './services/userService';

const DeleteAccount = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setPassword('');
    setError('');
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to delete your account.');
        return;
      }

      await deleteUser(password, token);

      localStorage.removeItem('token');
      setSuccess('Account deleted successfully!');
      setError('');

      handleCloseDialog();

      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (error) {
      setError('Error deleting account. Please ensure your password is correct.');
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Delete Account
      </Typography>
      {error && (
        <Typography color="error" variant="body2" gutterBottom>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="primary" variant="body2" gutterBottom>
          {success}
        </Typography>
      )}
      <Typography variant="body1" paragraph>
        Are you sure you want to delete your account? This action cannot be undone.
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleOpenDialog}>
        Delete Account
      </Button>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your password to confirm account deletion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="secondary"
            variant="contained"
            disabled={!password}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeleteAccount;
