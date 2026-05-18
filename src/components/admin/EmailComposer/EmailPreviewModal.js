import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const EmailPreviewModal = ({
  open,
  onClose,
  onConfirmSend,
  formData,
  recipients,
  loading = false,
  channel = "support",
}) => {
  const [expandRecipients, setExpandRecipients] = useState(false);

  const displayRecipients = expandRecipients
    ? recipients
    : recipients.slice(0, 5);

  const hasMoreRecipients = recipients.length > 5;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Preview Email</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Recipient Summary */}
          <Paper sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Recipients ({recipients.length})
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {displayRecipients.map((recipient) => (
                    <Chip
                      key={recipient}
                      label={recipient}
                      size="small"
                      variant="outlined"
                    />
                  ))}

                  {hasMoreRecipients && !expandRecipients && (
                    <Chip
                      label={`+${recipients.length - 5} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              {hasMoreRecipients && (
                <IconButton
                  size="small"
                  onClick={() => setExpandRecipients(!expandRecipients)}
                >
                  {expandRecipients ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
          </Paper>

          <Divider />

          {/* Email Metadata */}
          <Box>
            <Typography variant="body2">
              <strong>From:</strong> support@funplug.net
            </Typography>

            <Typography variant="body2">
              <strong>Channel:</strong> {channel}
            </Typography>

            <Typography variant="body2">
              <strong>Composition Method:</strong> {formData.compositionMethod}
            </Typography>

            {formData.templateId && (
              <Typography variant="body2">
                <strong>Template Used:</strong> Yes
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Subject */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Subject
            </Typography>

            <Paper sx={{ p: 1.5, bgcolor: "#fafafa" }}>
              <Typography variant="body2">{formData.subject || "(No subject)"}</Typography>
            </Paper>
          </Box>

          {/* HTML Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              HTML Preview
            </Typography>

            <Paper
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                overflow: "auto",
                maxHeight: 350,
                bgcolor: "#fff",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: formData.htmlBody }} />
            </Paper>
          </Box>

          {/* Text Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Plain Text Preview
            </Typography>

            <Paper
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                bgcolor: "#f5f5f5",
                overflow: "auto",
                maxHeight: 200,
              }}
            >
              <Typography variant="caption" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {formData.textBody || "(No text body)"}
              </Typography>
            </Paper>
          </Box>

          {/* Warnings */}
          <Box>
            {recipients.length > 100 && (
              <Alert severity="warning">
                Sending to {recipients.length} recipients. This may take some time to process.
              </Alert>
            )}

            {recipients.some(
              (r) =>
                !r.includes("@") ||
                !r.includes(".")
            ) && (
              <Alert severity="error">
                Some recipients have invalid email formats. Please review.
              </Alert>
            )}

            {!formData.subject && (
              <Alert severity="error">Subject is required</Alert>
            )}

            {!formData.htmlBody && (
              <Alert severity="error">Email body is required</Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onConfirmSend}
          disabled={
            loading ||
            !formData.subject ||
            !formData.htmlBody ||
            recipients.length === 0
          }
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Sending...
            </>
          ) : (
            `Send to ${recipients.length} Recipient${
              recipients.length !== 1 ? "s" : ""
            }`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailPreviewModal;
