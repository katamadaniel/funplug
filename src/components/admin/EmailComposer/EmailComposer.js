import React, { useState } from "react";
import { Box, Paper, Stack, Typography, Button, Alert, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RecipientSelector from "./RecipientSelector";
import EmailComposerForm from "./EmailComposerForm";
import EmailPreviewModal from "./EmailPreviewModal";
import { composeEmail } from "../../../services/adminService";

const EmailComposer = ({ onSuccess }) => {
  const [recipients, setRecipients] = useState([]);
  const [formData, setFormData] = useState({
    templateId: "",
    subject: "",
    htmlBody: "",
    textBody: "",
    compositionMethod: "custom",
    variables: {},
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
    setError("");
  };

  const handlePreviewOpen = () => {
    if (!recipients.length) {
      setError("Please select at least one recipient");
      return;
    }

    if (!formData.subject) {
      setError("Please enter an email subject");
      return;
    }

    if (!formData.htmlBody) {
      setError("Please enter email body");
      return;
    }

    setPreviewOpen(true);
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        recipients,
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        textBody: formData.textBody,
        channel: "support",
        templateId: formData.templateId || null,
        compositionMethod: formData.compositionMethod,
        variables: formData.variables,
      };

      const res = await composeEmail(payload);

      setSuccess(`Email composed and queued for ${res.recipientCount} recipient(s)`);

      // Reset form
      setRecipients([]);
      setFormData({
        templateId: "",
        subject: "",
        htmlBody: "",
        textBody: "",
        compositionMethod: "custom",
        variables: {},
      });

      setPreviewOpen(false);

      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Email composition failed:", err);
      setError(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Compose Email
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Create and send custom emails to users. You can use email templates as starters or write from scratch.
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

        {/* Recipient Selection Section */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Step 1: Select Recipients
          </Typography>

          <RecipientSelector
            selectedRecipients={recipients}
            onRecipientsChange={setRecipients}
            disabled={loading}
          />
        </Paper>

        {/* Email Composition Section */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Step 2: Compose Email
          </Typography>

          <EmailComposerForm
            formData={formData}
            onFormChange={handleFormChange}
            onPreview={handlePreviewOpen}
            disabled={loading}
          />
        </Paper>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" disabled={loading}>
            Save as Draft
          </Button>

          <Button
            variant="contained"
            onClick={handlePreviewOpen}
            disabled={loading || !recipients.length || !formData.subject || !formData.htmlBody}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? "Sending..." : "Preview & Send"}
          </Button>
        </Box>
      </Stack>

      {/* Preview Modal */}
      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirmSend={handleSendEmail}
        formData={formData}
        recipients={recipients}
        loading={loading}
        channel="support"
      />
    </Box>
  );
};

export default EmailComposer;
