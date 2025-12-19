import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Rating,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";

import {
  fetchPendingReviews,
  approveReview,
  rejectReview,
  fetchPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../../services/adminServices";

const AdminModerationDashboard = () => {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        tab === 0
          ? await fetchPendingReviews()
          : await fetchPendingVerifications();

      setItems(data || []);
    } catch (err) {
      setError("Failed to load moderation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleApprove = async (id) => {
    tab === 0
      ? await approveReview(id)
      : await approveVerification(id);

    loadData();
  };

  const handleReject = async (id) => {
    tab === 0
      ? await rejectReview(id)
      : await rejectVerification(id);

    loadData();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box maxWidth={1000} mx="auto">
      <Typography variant="h5" gutterBottom>
        Admin Moderation
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Reviews" />
        <Tab label="Verification Requests" />
      </Tabs>

      {items.length === 0 && (
        <Typography color="text.secondary">
          No pending items
        </Typography>
      )}

      <Stack spacing={2}>
        {tab === 0 &&
          items.map((r) => (
            <Paper key={r._id} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>
                  {r.authorName || "Guest"}
                </Typography>
                <Chip size="small" label={r.source} />
              </Stack>

              <Rating value={r.rating} readOnly />
              <Typography sx={{ mt: 1 }}>{r.text}</Typography>

              <Typography variant="caption" color="text.secondary">
                Reviewing: {r.user?.username}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => handleApprove(r._id)}
                >
                  Approve
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleReject(r._id)}
                >
                  Reject
                </Button>
              </Stack>
            </Paper>
          ))}

        {tab === 1 &&
          items.map((u) => (
            <Paper key={u._id} sx={{ p: 2 }}>
              <Typography fontWeight={600}>
                {u.username}
              </Typography>

              <Typography variant="body2">
                {u.email}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Category: {u.category}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => handleApprove(u._id)}
                >
                  Approve Verification
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleReject(u._id)}
                >
                  Reject
                </Button>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Box>
  );
};

export default AdminModerationDashboard;
