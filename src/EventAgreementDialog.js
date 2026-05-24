import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const EventAgreementDialog = ({ isOpen, onClose, onAccept }) => {
  const [agreement, setAgreement] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAgreement();
    }
  }, [isOpen]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use environment variable or fallback to localhost
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const url = `${baseUrl}/api/policies/documents/event-creation-agreement/current`;
      
      console.log('Fetching agreement from:', url);
      const response = await axios.get(url);
      
      if (response.data?.data) {
        setAgreement(response.data.data);
      } else if (response.data?.content) {
        setAgreement(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error("Error fetching agreement:", err);
      if (err.response?.status === 404) {
        setError("Agreement not found. Please ensure the agreement has been initialized.");
      } else if (err.response?.status === 500) {
        setError("Server error loading agreement. Please try again later.");
      } else {
        setError("Failed to load agreement. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (isAccepted && agreement) {
      onAccept({
        agreementAccepted: true,
        agreementVersion: agreement.version,
      });
      setIsAccepted(false);
    }
  };

  const handleClose = () => {
    setIsAccepted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Event Creation Agreement</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "70vh", overflow: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : agreement ? (
          <>
            <Typography variant="h6" gutterBottom>
              {agreement.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Version {agreement.version} - Effective: {new Date(agreement.effectiveDate).toLocaleDateString()}
            </Typography>

            <Box
              sx={{
                mt: 3,
                mb: 3,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                "& h4": { mt: 2, mb: 1 },
                "& p": { mb: 1, lineHeight: 1.6 },
                "& ul": { ml: 3, mb: 1 },
              }}
              dangerouslySetInnerHTML={{ __html: agreement.content }}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAccepted}
                    onChange={(e) => setIsAccepted(e.target.checked)}
                  />
                }
                label="I agree to the Event Creation Agreement and understand the terms, conditions, and disclaimers"
              />
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={!isAccepted || loading}
        >
          I Agree & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventAgreementDialog;
