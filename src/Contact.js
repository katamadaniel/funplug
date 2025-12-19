import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Replace with real API call
const sendSupportMessage = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });

  const res = await fetch("/api/support/contact", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    issueType: "",
    message: "",
    attachment: null,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Autofill name & email from browser session (public page)
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("funplug_user"));

    if (sessionUser?.email) {
      setFormData((prev) => ({
        ...prev,
        name: sessionUser.name || "",
        email: sessionUser.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendSupportMessage(formData);
      setSubmitted(true);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        issueType: "",
        message: "",
        attachment: null,
      }));
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#fafafa", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Contact Info */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 4 }} elevation={2}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Contact Support
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Need help with bookings, payments, tickets, or your account?
                    Our support team is here to help.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <SupportAgentIcon color="primary" />
                  <Typography>Reliable & transparent support</Typography>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon color="primary" />
                  <Typography>support@funplug.net</Typography>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOnIcon color="primary" />
                  <Typography>Nairobi, Kenya</Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Typical response time: within 24 hours on business days.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: 4 }} elevation={2}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Send a Support Message
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Message sent successfully. Our support team will contact you
                  shortly.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      helperText="Used to identify and respond to you"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Issue Type"
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="Account">Account</MenuItem>
                      <MenuItem value="Bookings">Bookings</MenuItem>
                      <MenuItem value="Payments">Payments</MenuItem>
                      <MenuItem value="Tickets">Tickets</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={5}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button variant="outlined" component="label">
                      Attach Screenshot (optional)
                      <input
                        type="file"
                        hidden
                        name="attachment"
                        accept="image/*,.pdf"
                        onChange={handleChange}
                      />
                    </Button>
                    {formData.attachment && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formData.attachment.name}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ borderRadius: 3, px: 5 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
