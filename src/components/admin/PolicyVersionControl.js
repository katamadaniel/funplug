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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { getDocumentHistory, createDocument } from '../../services/policyService';

export default function PolicyVersionControl({ onSuccess }) {
  const [versions, setVersions] = useState({
    'privacy-policy': [],
    'terms-of-service': [],
    'user-agreement': [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('privacy-policy');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    version: '',
    versionNumber: '',
    title: '',
    content: '',
    summary: '',
    effectiveDate: '',
    requiresReAcknowledgment: false,
  });

  useEffect(() => {
    fetchVersions();
  }, [selectedDocType]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await getDocumentHistory(selectedDocType);
      setVersions((prev) => ({
        ...prev,
        [selectedDocType]: response.data || response || [],
      }));
    } catch (err) {
      setError(err.message || 'Failed to load versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      version: '',
      versionNumber: '',
      title: '',
      content: '',
      summary: '',
      effectiveDate: '',
      requiresReAcknowledgment: false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const changelog = formData.summary || formData.title;
      await createDocument(selectedDocType, formData.content, changelog);
      
      onSuccess?.();
      handleCloseDialog();
      fetchVersions();
    } catch (err) {
      const errorMsg = err.message || 'Failed to create version';
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

      {/* Document Type Selection */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Object.entries(docTypeLabels).map(([docType, label]) => (
          <Button
            key={docType}
            variant={selectedDocType === docType ? 'contained' : 'outlined'}
            onClick={() => setSelectedDocType(docType)}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Create Version Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          disabled={loading}
        >
          Create New Version
        </Button>
      </Box>

      {/* Versions Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Acknowledgments</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions[selectedDocType]?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No versions found
                  </TableCell>
                </TableRow>
              ) : (
                versions[selectedDocType]?.map((version) => (
                  <TableRow key={version._id} hover>
                    <TableCell>{version.version}</TableCell>
                    <TableCell>{version.title}</TableCell>
                    <TableCell>
                      {new Date(version.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(version.effectiveDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{version.acknowledgedByCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={version.isActive ? 'Active' : 'Inactive'}
                        color={version.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Version Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New {docTypeLabels[selectedDocType]} Version</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                placeholder="e.g., v1.0"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Version Number"
                name="versionNumber"
                value={formData.versionNumber}
                onChange={handleInputChange}
                placeholder="e.g., 1.0"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Summary of Changes"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                multiline
                rows={6}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Effective Date"
                name="effectiveDate"
                type="datetime-local"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="requiresReAcknowledgment"
                    checked={formData.requiresReAcknowledgment}
                    onChange={handleInputChange}
                  />
                }
                label="Requires Re-acknowledgment from Users"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Version'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
