import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { fetchEmailTemplates, deleteEmailTemplate } from "../../../services/adminService";

/**
 * TemplateManager Component
 * Manage email templates: create, edit, delete, and preview
 */
const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog states
  const [formDialog, setFormDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Other",
    subject: "",
    htmlBody: "",
    textBody: "",
    variables: [],
    description: "",
    isActive: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchEmailTemplates();
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateNew = () => {
    setFormData({
      name: "",
      category: "Other",
      subject: "",
      htmlBody: "",
      textBody: "",
      variables: [],
      description: "",
      isActive: true,
    });

    setSelectedTemplate(null);
    setIsEditing(false);
    setFormDialog(true);
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      variables: template.variables || [],
      description: template.description,
      isActive: template.isActive,
    });

    setSelectedTemplate(template);
    setIsEditing(true);
    setFormDialog(true);
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setViewDialog(true);
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate?._id) return;

    try {
      await deleteEmailTemplate(selectedTemplate._id);
      setDeleteConfirm(false);
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete template");
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.htmlBody) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (isEditing && selectedTemplate?._id) {
        // TODO: Implement PUT endpoint for template update
        console.log("Update template:", selectedTemplate._id, formData);
      } else {
        // TODO: Implement POST endpoint for template creation
        console.log("Create template:", formData);
      }

      setFormDialog(false);
      setError("");
      await loadTemplates();
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save template");
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Email Templates
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Manage reusable email templates for common scenarios
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            disabled={loading}
          >
            Create Template
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Templates Table */}
        <Paper sx={{ borderRadius: 1.5 }}>
          {loading ? (
            <Box p={4} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">No templates created yet</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Subject</strong>
                    </TableCell>

                    <TableCell align="center">
                      <strong>Active</strong>
                    </TableCell>

                    <TableCell align="center">
                      <strong>Usage Count</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template._id} hover>
                      <TableCell>
                        <Typography variant="body2">{template.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={template.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" noWrap>
                          {template.subject}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={template.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={template.isActive ? "success" : "default"}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          {template.usageCount || 0}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleView(template)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(template)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(template)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      {/* View Template Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>View Template</DialogTitle>

        <DialogContent dividers>
          {selectedTemplate && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body2">{selectedTemplate.name}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">Category</Typography>
                <Chip label={selectedTemplate.category} size="small" />
              </Box>

              <Box>
                <Typography variant="subtitle2">Subject</Typography>
                <Typography variant="body2">{selectedTemplate.subject}</Typography>
              </Box>

              {selectedTemplate.variables?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Variables</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedTemplate.variables.map((v) => (
                      <Chip key={v} label={`{{${v}}}`} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2">HTML Body</Typography>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5", maxHeight: 300, overflow: "auto" }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlBody }} />
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2">Text Body</Typography>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5", maxHeight: 200, overflow: "auto" }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedTemplate.textBody}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Delete Template?</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete "<strong>{selectedTemplate?.name}</strong>"? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Dialog (Create/Edit) - Placeholder */}
      <Dialog open={formDialog} onClose={() => setFormDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? "Edit Template" : "Create Template"}</DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Template management UI will be fully implemented. For now, use the API directly.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFormDialog(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSaveTemplate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateManager;
