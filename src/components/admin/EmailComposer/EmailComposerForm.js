import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Stack,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Chip,
  FormControlLabel,
  Switch,
  TextareaAutosize,
} from "@mui/material";
import { fetchEmailTemplates } from "../../../services/adminService";

const EmailComposerForm = ({
  formData,
  onFormChange,
  onPreview,
  disabled = false,
}) => {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const res = await fetchEmailTemplates({ isActive: "true" });
        setTemplates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t._id === templateId);

    if (template) {
      onFormChange({
        templateId,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        variables: {},
        compositionMethod: "template",
      });
    } else {
      onFormChange({
        templateId: "",
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        textBody: formData.textBody,
        variables: formData.variables,
        compositionMethod: "custom",
      });
    }
  };

  const handleSubjectChange = (e) => {
    onFormChange({
      ...formData,
      subject: e.target.value,
      compositionMethod: formData.templateId ? "mixed" : "custom",
    });
  };

  const handleHtmlBodyChange = (e) => {
    onFormChange({
      ...formData,
      htmlBody: e.target.value,
      compositionMethod: formData.templateId ? "mixed" : "custom",
    });
  };

  const handleTextBodyChange = (e) => {
    onFormChange({
      ...formData,
      textBody: e.target.value,
      compositionMethod: formData.templateId ? "mixed" : "custom",
    });
  };

  const selectedTemplate = templates.find((t) => t._id === formData.templateId);

  return (
    <Stack spacing={2}>
      {/* Template Selection */}
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Email Template (Optional)
        </Typography>

        <Select
          fullWidth
          value={formData.templateId || ""}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          disabled={disabled || templatesLoading}
          displayEmpty
        >
          <MenuItem value="">Custom - No Template</MenuItem>

          {templatesLoading ? (
            <MenuItem disabled>
              <CircularProgress size={20} />
            </MenuItem>
          ) : (
            templates.map((template) => (
              <MenuItem key={template._id} value={template._id}>
                {template.name} ({template.category})
              </MenuItem>
            ))
          )}
        </Select>

        {selectedTemplate && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Template Description: {selectedTemplate.description || "N/A"}
            </Typography>

            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <Box mt={1}>
                <Typography variant="caption" color="info.main">
                  Variables: {selectedTemplate.variables.join(", ")}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Subject */}
      <TextField
        fullWidth
        label="Email Subject"
        placeholder="Enter email subject. Use {{variableName}} for template variables"
        value={formData.subject}
        onChange={handleSubjectChange}
        disabled={disabled}
        multiline
        rows={2}
        helperText={`Character count: ${formData.subject.length}`}
      />

      {/* Composition Method Badge */}
      {formData.compositionMethod !== "custom" && (
        <Chip
          label={`Composition: ${formData.compositionMethod.toUpperCase()}`}
          size="small"
          color={formData.compositionMethod === "template" ? "primary" : "info"}
          variant="outlined"
        />
      )}

      <Divider />

      {/* Editor Tabs */}
      <Box>
        <FormControlLabel
          control={<Switch checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />}
          label="Show Preview"
        />
      </Box>

      {showPreview ? (
        <Paper sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            HTML Preview
          </Typography>

          <Paper
            sx={{
              p: 2,
              mt: 1,
              border: "1px solid #ddd",
              overflow: "auto",
              maxHeight: 300,
              bgcolor: "#fff",
            }}
          >
            <div
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: formData.htmlBody }}
            />
          </Paper>

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
            Text Version Preview
          </Typography>

          <Paper
            sx={{
              p: 2,
              mt: 1,
              bgcolor: "#fff",
              border: "1px solid #ddd",
              overflow: "auto",
              maxHeight: 300,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {formData.textBody}
            </Typography>
          </Paper>
        </Paper>
      ) : (
        <>
          {/* HTML Body */}
          <Box>
            <Typography variant="subtitle2" mb={1}>
              HTML Email Body
            </Typography>

            <TextareaAutosize
              minRows={8}
              value={formData.htmlBody}
              onChange={handleHtmlBodyChange}
              disabled={disabled}
              placeholder="Enter HTML email body. Supports HTML tags and {{variableName}} placeholders."
              style={{
                width: "100%",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </Box>

          <Divider />

          {/* Text Body */}
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Plain Text Email Body
            </Typography>

            <TextareaAutosize
              minRows={8}
              value={formData.textBody}
              onChange={handleTextBodyChange}
              disabled={disabled}
              placeholder="Enter plain text email body (fallback for non-HTML clients). Use {{variableName}} for placeholders."
              style={{
                width: "100%",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </Box>
        </>
      )}

      {/* Preview Button */}
      <Box>
        <Button
          variant="contained"
          onClick={onPreview}
          disabled={disabled || !formData.subject || !formData.htmlBody}
          fullWidth
        >
          Preview & Send
        </Button>
      </Box>
    </Stack>
  );
};

export default EmailComposerForm;
