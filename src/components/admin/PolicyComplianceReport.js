import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import { getComplianceReport, getAuditLog, notifyPolicyUpdate } from '../../services/policyService';

export default function PolicyComplianceReport() {
  const [report, setReport] = useState(null);
  const [nonCompliantUsers, setNonCompliantUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [notificationData, setNotificationData] = useState({
    docType: 'privacy-policy',
    message: '',
    scheduledDate: '',
  });
  const [selectedDocType, setSelectedDocType] = useState(null);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const response = await getComplianceReport();
      setReport(response.data || response || []);
    } catch (err) {
      setError(err.message || 'Failed to load compliance report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNonCompliantUsers = async (docType) => {
    try {
      setLoading(true);
      // Use getAuditLog to fetch detailed compliance information
      const response = await getAuditLog({ docType });
      setNonCompliantUsers(response.data || response || []);
      setSelectedDocType(docType);
      setOpenUsersDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to load non-compliant users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotificationDialog = (docType) => {
    setNotificationData({
      docType,
      message: '',
      scheduledDate: '',
    });
    setNotificationDialog(true);
  };

  const handleSendNotifications = async () => {
    try {
      setLoading(true);
      await notifyPolicyUpdate(notificationData.docType);
      setError(null);
      setNotificationDialog(false);
      fetchCompliance();
    } catch (err) {
      const errorMsg = err.message || 'Failed to send notifications';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const docTypeLabels = {
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    'user-agreement': 'User Agreement',
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Compliance Overview Cards */}
      {report && report.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {report.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {docTypeLabels[item._id]}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      {item.compliancePercentage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.compliancePercentage}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.uniqueUserCount} of {item.totalUsersInSystem} users acknowledged
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => fetchNonCompliantUsers(item._id)}
                    >
                      View Non-Compliant
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenNotificationDialog(item._id)}
                    >
                      Send Notification
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Compliance Details Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell align="right">Total Acknowledgments</TableCell>
                <TableCell align="right">Unique Users</TableCell>
                <TableCell align="right">Total Users in System</TableCell>
                <TableCell align="right">Compliance %</TableCell>
                <TableCell>Last Acknowledged</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report && report.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No compliance data available
                  </TableCell>
                </TableRow>
              ) : (
                report?.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>{docTypeLabels[item._id]}</TableCell>
                    <TableCell align="right">{item.totalAcknowledgments}</TableCell>
                    <TableCell align="right">{item.uniqueUserCount}</TableCell>
                    <TableCell align="right">{item.totalUsersInSystem}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${item.compliancePercentage}%`}
                        color={
                          item.compliancePercentage >= 80
                            ? 'success'
                            : item.compliancePercentage >= 50
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {item.lastAcknowledgedAt
                        ? new Date(item.lastAcknowledgedAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Non-Compliant Users Dialog */}
      <Dialog
        open={openUsersDialog}
        onClose={() => setOpenUsersDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Non-Compliant Users - {docTypeLabels[selectedDocType]}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {nonCompliantUsers.length === 0 ? (
            <Typography color="textSecondary">
              All users have acknowledged this policy
            </Typography>
          ) : (
            <List>
              {nonCompliantUsers.map((user) => (
                <ListItem key={user._id}>
                  <ListItemText
                    primary={user.username}
                    secondary={`${user.email} • Joined: ${new Date(
                      user.createdAt
                    ).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsersDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={notificationDialog} onClose={() => setNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Policy Update Notification</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Document: {docTypeLabels[notificationData.docType]}
            </Typography>
            <TextField
              fullWidth
              label="Message"
              value={notificationData.message}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              multiline
              rows={4}
              placeholder="Enter the notification message for users..."
              size="small"
            />
            <TextField
              fullWidth
              label="Scheduled Effective Date (Optional)"
              type="datetime-local"
              value={notificationData.scheduledDate}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  scheduledDate: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button onClick={handleSendNotifications} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Send to All Users'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
