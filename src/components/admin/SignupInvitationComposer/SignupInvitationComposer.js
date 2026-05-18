import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Chip,
  TextareaAutosize,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { sendSignupInvitations, fetchEmailTemplates } from "../../../services/adminService";

/**
 * SignupInvitationComposer Component
 * Send signup invitations to non-registered users
 */
const SignupInvitationComposer = ({ onSuccess }) => {
  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load invitation templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const res = await fetchEmailTemplates({
          category: "Invite",
          isActive: "true",
        });
        setTemplates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    if (recipients.includes(email)) {
      setError("Email already added");
      return;
    }

    setRecipients([...recipients, email]);
    setEmailInput("");
    setError("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setRecipients(recipients.filter((e) => e !== emailToRemove));
  };

  const handleSendInvitations = async () => {
    if (recipients.length === 0) {
      setError("Please add at least one email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        recipients,
        customMessage: customMessage.trim() || null,
        templateId: templateId || null,
      };

      const res = await sendSignupInvitations(payload);

      setSuccess(
        `Signup invitations sent successfully! (${res.recipientCount} recipient(s))${
          res.alreadyUsers > 0 ? ` - ${res.alreadyUsers} already registered users were skipped` : ""
        }`
      );

      // Reset form
      setRecipients([]);
      setCustomMessage("");
      setTemplateId("");

      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 7 seconds
      setTimeout(() => setSuccess(""), 7000);
    } catch (err) {
      console.error("Failed to send invitations:", err);
      setError(
        err.message ||
        "Failed to send invitations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t._id === templateId);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            <PersonAddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Invite Users to Sign Up
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Send signup invitation emails to non-registered users. They can join the platform using the provided link.
          </Typography>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Email Input Section */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Step 1: Add Email Addresses
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Enter email address to invite"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setError("");
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              disabled={loading}
              helperText="Press Enter or click Add to add email"
            />

            <Button
              variant="contained"
              onClick={handleAddEmail}
              disabled={loading || !emailInput.trim()}
            >
              Add Email
            </Button>

            {recipients.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Recipients ({recipients.length}):
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1}>
                  {recipients.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Invitation Message Section */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Step 2: Customize Invitation (Optional)
          </Typography>

          <Stack spacing={2}>
            {/* Template Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Use an Invitation Template
              </Typography>

              <Select
                fullWidth
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                disabled={loading || templatesLoading}
                displayEmpty
              >
                <MenuItem value="">No Template - Use Custom Message</MenuItem>

                {templatesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  templates.map((template) => (
                    <MenuItem key={template._id} value={template._id}>
                      {template.name}
                    </MenuItem>
                  ))
                )}
              </Select>

              {selectedTemplate && (
                <Box mt={2} p={1.5} bgcolor="#f5f5f5" borderRadius={1}>
                  <Typography variant="caption" color="text.secondary">
                    {selectedTemplate.description || "No description"}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Custom Message */}
            {!templateId && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Custom Message
                </Typography>

                <TextareaAutosize
                  minRows={4}
                  placeholder="Enter a custom invitation message (optional). This will be included in the default invitation email."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Character count: {customMessage.length}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Preview Section */}
        {recipients.length > 0 && (
          <Paper sx={{ p: 2.5, borderRadius: 1.5, bgcolor: "#f9f9f9" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2">
                  Ready to send {recipients.length} invitation{recipients.length !== 1 ? "s" : ""}
                </Typography>

                {selectedTemplate && (
                  <Typography variant="caption" color="info.main">
                    Using template: {selectedTemplate.name}
                  </Typography>
                )}

                {customMessage && !templateId && (
                  <Typography variant="caption" color="success.main">
                    With custom message included
                  </Typography>
                )}
              </Box>

              <Button
                variant="outlined"
                onClick={() => setPreviewOpen(true)}
                disabled={loading}
              >
                Preview
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Action Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendInvitations}
            disabled={loading || recipients.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            size="large"
          >
            {loading ? "Sending Invitations..." : "Send Invitations"}
          </Button>
        </Box>
      </Stack>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invitation Preview</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Recipients:
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {recipients.join(", ")}
              </Typography>
            </Box>

            {selectedTemplate ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Template: {selectedTemplate.name}
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    bgcolor: "#f5f5f5",
                  }}
                >
                  <Typography variant="caption" component="div">
                    {selectedTemplate.description}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Message:
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    bgcolor: "#f5f5f5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body2">
                    {customMessage || "Standard invitation message will be used"}
                  </Typography>
                </Box>
              </Box>
            )}

            <Alert severity="info">
              Users will receive an email with a link to sign up on the platform. Existing users will be automatically skipped.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>

          <Button
            variant="contained"
            onClick={() => {
              setPreviewOpen(false);
              handleSendInvitations();
            }}
            disabled={loading}
          >
            Send Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignupInvitationComposer;
