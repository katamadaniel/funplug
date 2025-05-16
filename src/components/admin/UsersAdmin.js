import React, { useState, useEffect } from 'react';
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
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import {
  fetchUsers as getUsers,
  banUser,
  unbanUser,
  warnUser,
  resetUserPassword,
} from '../../services/userService';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await banUser(userId);
      alert('User banned successfully');
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const handleSendWarning = async (userId, message) => {
    try {
      await warnUser(userId, message);
      alert('User warned successfully');
      loadUsers();
    } catch (error) {
      console.error('Error warning user:', error);
      alert('Failed to warn user');
    }
  };

  const handleResetPassword = async (userId, password) => {
    try {
      await resetUserPassword(userId, password);
      alert('Password reset successfully');
      loadUsers();
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const openBanDialog = (user) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const closeBanDialog = () => {
    setSelectedUser(null);
    setBanDialogOpen(false);
  };

  const openWarningDialog = (user) => {
    setSelectedUser(user);
    setWarningDialogOpen(true);
  };

  const closeWarningDialog = () => {
    setSelectedUser(null);
    setWarningMessage('');
    setWarningDialogOpen(false);
  };

  const openResetPasswordDialog = (user) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const closeResetPasswordDialog = () => {
    setSelectedUser(null);
    setNewPassword('');
    setResetPasswordDialogOpen(false);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Typography variant="h4">Manage Users</Typography>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by username"
            InputProps={{ startAdornment: <SearchIcon /> }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.category}</TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    {user.isBanned ? (
                      <Tooltip title="Unban User">
                        <IconButton color="success" onClick={() => handleUnbanUser(user._id)}>
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ban User">
                        <IconButton color="error" onClick={() => openBanDialog(user)}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Send Warning">
                      <IconButton color="warning" onClick={() => openWarningDialog(user)}>
                        <WarningIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton color="primary" onClick={() => openResetPasswordDialog(user)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Ban User Dialog */}
        <Dialog open={banDialogOpen} onClose={closeBanDialog}>
          <DialogTitle>Ban User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to ban {selectedUser?.username}? They will lose access to their account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeBanDialog}>Cancel</Button>
            <Button
              color="error"
              onClick={() => {
                handleBanUser(selectedUser._id);
                closeBanDialog();
              }}
            >
              Ban
            </Button>
          </DialogActions>
        </Dialog>

        {/* Warning Dialog */}
        <Dialog open={warningDialogOpen} onClose={closeWarningDialog}>
          <DialogTitle>Send Warning</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a warning message for {selectedUser?.username}.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Warning Message"
              type="text"
              fullWidth
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeWarningDialog}>Cancel</Button>
            <Button
              color="warning"
              onClick={() => {
                handleSendWarning(selectedUser._id, warningMessage);
                closeWarningDialog();
              }}
            >
              Send Warning
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onClose={closeResetPasswordDialog}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a new password for {selectedUser?.username}.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeResetPasswordDialog}>Cancel</Button>
            <Button
              color="primary"
              onClick={() => {
                handleResetPassword(selectedUser._id, newPassword);
                closeResetPasswordDialog();
              }}
            >
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default UsersAdmin;
