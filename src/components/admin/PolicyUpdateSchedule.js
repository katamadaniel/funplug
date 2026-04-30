import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { initializeSchedule, notifyPolicyUpdate } from '../../services/policyService';

export default function PolicyUpdateSchedule({ onSuccess }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    docType: 'privacy-policy',
    reviewFrequency: 'quarterly',
    nextScheduledReview: '',
  });
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', notes: '' });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setSchedules([]);
    } catch (err) {
      setError(err.message || 'Failed to load schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      docType: 'privacy-policy',
      reviewFrequency: 'quarterly',
      nextScheduledReview: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await initializeSchedule(formData.docType, formData.reviewFrequency);
      onSuccess?.();
      handleCloseDialog();
      fetchSchedules();
    } catch (err) {
      const errorMsg = err.message || 'Failed to create schedule';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      // Send notification for policy update if status is being published
      if (statusData.status === 'published' && selectedSchedule) {
        await notifyPolicyUpdate(selectedSchedule.docType);
      }
      setStatusDialog(false);
      fetchSchedules();
    } catch (err) {
      const errorMsg = err.message || 'Failed to update status';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (schedule) => {
    setSelectedSchedule(schedule);
    setStatusData({ status: schedule.status || '', notes: '' });
    setStatusDialog(true);
  };

  const docTypeLabels = {
    'privacy-policy': '🔒 Privacy Policy',
    'terms-of-service': '⚖️ Terms of Service',
    'user-agreement': '👥 User Agreement',
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      'in-review': 'info',
      approved: 'primary',
      'scheduled-for-update': 'secondary',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upcoming Reviews Alert */}
      <Card sx={{ mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
        <CardContent>
          <Typography variant="body2">
            <strong>Upcoming Reviews:</strong> Check the schedule below to see when policy reviews are due
          </Typography>
        </CardContent>
      </Card>

      {/* Create Schedule Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          disabled={loading}
        >
          Initialize Schedule
        </Button>
      </Box>

      {/* Schedules Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Review Frequency</TableCell>
                <TableCell>Next Scheduled Review</TableCell>
                <TableCell>Last Review</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No schedules found. Click "Initialize Schedule" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule._id} hover>
                    <TableCell>{docTypeLabels[schedule.docType]}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {schedule.reviewFrequency}
                    </TableCell>
                    <TableCell>
                      {new Date(schedule.nextScheduledReview).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {schedule.lastReviewDate
                        ? new Date(schedule.lastReviewDate).toLocaleDateString()
                        : 'Not reviewed yet'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status}
                        color={getStatusColor(schedule.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenStatusDialog(schedule)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Initialize Schedule Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Initialize Update Schedule</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Document Type</InputLabel>
                <Select
                  name="docType"
                  value={formData.docType}
                  onChange={handleInputChange}
                  label="Document Type"
                >
                  {Object.entries(docTypeLabels).map(([docType, label]) => (
                    <MenuItem key={docType} value={docType}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Review Frequency</InputLabel>
                <Select
                  name="reviewFrequency"
                  value={formData.reviewFrequency}
                  onChange={handleInputChange}
                  label="Review Frequency"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="semi-annual">Semi-Annual</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Next Scheduled Review"
                name="nextScheduledReview"
                type="datetime-local"
                value={formData.nextScheduledReview}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Initialize'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Schedule Status</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={statusData.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-review">In Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="scheduled-for-update">Scheduled for Update</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={statusData.notes}
                onChange={handleStatusChange}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
