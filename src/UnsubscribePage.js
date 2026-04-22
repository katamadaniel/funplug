import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Button } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL;
const UNSUBSCRIBE_API_URL = `${API_URL}/api/follow/unsubscribe`;

const UnsubscribePage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const res = await axios.get(`${UNSUBSCRIBE_API_URL}/${token}`);
        if (mounted) setMessage(res.data.message || "Unsubscribed successfully");
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message || "Invalid or expired unsubscribe link"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Verifying unsubscribe link...</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} textAlign="center">
      {error ? (
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      ) : (
        <Typography color="primary" variant="h6">
          {message}
        </Typography>
      )}

      <Button href="/" variant="contained" sx={{ mt: 3 }}>
        Back to Home
      </Button>
    </Box>
  );
};

export default UnsubscribePage;