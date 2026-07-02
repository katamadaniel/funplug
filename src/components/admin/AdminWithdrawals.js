import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
  fetchWithdrawalRequestsAdmin,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
} from '../../services/adminService';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const AdminWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchWithdrawalRequestsAdmin('pending');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load withdrawal requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openDialog = (request, type) => {
    setSelectedRequest(request);
    setDialogType(type);
    setAdminNote('');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogType('');
    setAdminNote('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await approveWithdrawalRequest(selectedRequest._id, { adminNote });
      await loadRequests();
      closeDialog();
    } catch (err) {
      console.error('Error approving withdrawal request:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await rejectWithdrawalRequest(selectedRequest._id, { adminNote });
      await loadRequests();
      closeDialog();
    } catch (err) {
      console.error('Error rejecting withdrawal request:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Withdrawal Requests
          </Typography>
          <Typography color="text.secondary">
            Review and process creator payout withdrawal requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadRequests}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography>No pending withdrawal requests found.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested At</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>{request.userId?.username || 'Unknown'}</TableCell>
                    <TableCell>{request.currency || 'KES'} {request.amount?.toFixed(2)}</TableCell>
                    <TableCell>{request.method}</TableCell>
                    <TableCell>
                      <Chip label={request.status} color={statusColors[request.status] || 'default'} size="small" />
                    </TableCell>
                    <TableCell>{new Date(request.requestedAt).toLocaleString()}</TableCell>
                    <TableCell>{request.userNote || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openDialog(request, 'view')}>
                        <VisibilityIcon />
                      </IconButton>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ ml: 1 }}
                        onClick={() => openDialog(request, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ ml: 1 }}
                        onClick={() => openDialog(request, 'reject')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!dialogType} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogType === 'approve' && 'Approve Withdrawal'}
          {dialogType === 'reject' && 'Reject Withdrawal'}
          {dialogType === 'view' && 'Withdrawal Details'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest ? (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Request ID: {selectedRequest._id}
              </Typography>
              <Typography>
                <strong>User:</strong> {selectedRequest.userId?.username || 'Unknown'}
              </Typography>
              <Typography>
                <strong>Amount:</strong> {selectedRequest.currency || 'KES'} {selectedRequest.amount?.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Method:</strong> {selectedRequest.method}
              </Typography>
              <Typography>
                <strong>Requested:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}
              </Typography>
              <Typography mb={2}>
                <strong>Status:</strong>{' '}
                <Chip label={selectedRequest.status} color={statusColors[selectedRequest.status] || 'default'} size="small" />
              </Typography>
              <Typography mb={2}>
                <strong>Payout Details:</strong> {selectedRequest.payoutDetails ? JSON.stringify(selectedRequest.payoutDetails) : '—'}
              </Typography>
              <Typography mb={2}>
                <strong>User Note:</strong> {selectedRequest.userNote || '—'}
              </Typography>
              {(dialogType === 'approve' || dialogType === 'reject') && (
                <TextField
                  label="Admin Note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
              )}
            </Box>
          ) : (
            <DialogContentText>Loading request details…</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} startIcon={<CloseIcon />}>Cancel</Button>
          {dialogType === 'approve' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={processing}
            >
              Confirm Approve
            </Button>
          )}
          {dialogType === 'reject' && (
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={processing}
            >
              Confirm Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWithdrawals;
