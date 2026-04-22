import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

import {
  fetchPendingReviews,
  updateReviewStatus,
  fetchVerificationRequests,
  updateUserVerificationStatus,
} from "../../services/adminService";
import { getAvatarUrl } from "../../utils/avatar";

const statusChipColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const verificationChipColor = (status) => {
  if (status === "verified") return "success";
  if (status === "rejected") return "error";
  if (status === "pending") return "warning";
  return "default";
};

const AdminModeration = () => {
  const [tab, setTab] = useState(0);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Verification
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [reviewSearch, setReviewSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const loadReviews = async () => {
    setError("");
    setSuccess("");
    setReviewsLoading(true);

    try {
      const data = await fetchPendingReviews();
      // Handle new response format: { count, reviews }
      setReviews((data?.reviews || data) || []);
    } catch (err) {
      setError(err?.message || "Failed to fetch pending reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadUsers = async () => {
    setError("");
    setSuccess("");
    setUsersLoading(true);

    try {
      const data = await fetchVerificationRequests();
      setUsers(data || []);
    } catch (err) {
      setError(err?.message || "Failed to fetch verification requests.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    loadUsers();
  }, []);

  const filteredReviews = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();

    if (!q) return reviews;

    return reviews.filter((r) => {
      const author = r.authorName?.toLowerCase() || "";
      const text = r.text?.toLowerCase() || "";
      const email = r.authorEmail?.toLowerCase() || "";
      const profileName = r.user?.name?.toLowerCase() || "";

      return (
        author.includes(q) ||
        text.includes(q) ||
        email.includes(q) ||
        profileName.includes(q)
      );
    });
  }, [reviews, reviewSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = u.username?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const phone = u.phone?.toLowerCase() || "";
      const category = u.category?.toLowerCase() || "";

      return name.includes(q) || email.includes(q) || phone.includes(q) || category.includes(q);
    });
  }, [users, userSearch]);

  const handleReviewUpdate = async (reviewId, status) => {
    setError("");
    setSuccess("");

    try {
      await updateReviewStatus(reviewId, status);

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setSuccess(`Review ${status} successfully.`);
    } catch (err) {
      setError(err?.message || "Failed to update review.");
    }
  };

  const handleVerificationUpdate = async (userId, verificationStatus) => {
    setError("");
    setSuccess("");

    try {
      await updateUserVerificationStatus(userId, verificationStatus);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, verificationStatus } : u
        )
      );

      setSuccess(`User verification set to ${verificationStatus}.`);
    } catch (err) {
      setError(err?.message || "Failed to update verification status.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Paper sx={{ borderRadius: 3 }} elevation={3}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight={900}>
            Moderation Panel
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Approve/reject reviews and manage verification requests.
          </Typography>
          {reviews.length > 0 && (
            <Typography variant="caption" sx={{ color: "#1976d2", fontWeight: 600, mt: 1, display: "block" }}>
              Pending Reviews: {reviews.length}
            </Typography>
          )}
        </Box>

        <Divider />

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Review Moderation" />
          <Tab label="Verification Requests" />
        </Tabs>

        <Divider />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {/* REVIEW MODERATION */}
      {tab === 0 && (
        <Paper sx={{ mt: 2, borderRadius: 3 }} elevation={3}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
            <TextField
              label="Search Reviews"
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              fullWidth
            />

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadReviews}
              disabled={reviewsLoading}
              sx={{ fontWeight: 900, borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>

          <Divider />

          {reviewsLoading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                Loading pending reviews...
              </Typography>
            </Box>
          ) : filteredReviews.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No pending reviews found.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#fafafa" }}>
                    <TableCell sx={{ fontWeight: 900 }}>Profile</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Reviewer</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Text</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={getAvatarUrl(review.user)} />
                          <Box>
                            <Typography fontWeight={800}>
                              {review.user?.name || "Unknown"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {review.user?.email || ""}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800}>{review.authorName}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {review.authorEmail || review.authorPhone || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip label={`${review.rating}/5`} color="primary" size="small" />
                      </TableCell>

                      <TableCell>
                        <Tooltip title={review.text}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
                            {review.text}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={review.status}
                          color={statusChipColor(review.status)}
                          size="small"
                          sx={{ fontWeight: 900 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 900 }}
                            onClick={() => handleReviewUpdate(review._id, "approved")}
                          >
                            Approve
                          </Button>

                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 900 }}
                            onClick={() => handleReviewUpdate(review._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* VERIFICATION REQUESTS */}
      {tab === 1 && (
        <Paper sx={{ mt: 2, borderRadius: 3 }} elevation={3}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 2 }}>
            <TextField
              label="Search Users"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              fullWidth
            />

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              disabled={usersLoading}
              sx={{ fontWeight: 900, borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>

          <Divider />

          {usersLoading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                Loading verification requests...
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No verification requests found.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#fafafa" }}>
                    <TableCell sx={{ fontWeight: 900 }}>Avatar</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Avatar src={getAvatarUrl(user)} />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={900}>{user.username}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {user.category}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>

                      <TableCell>
                        <Chip
                          label={user.verificationStatus}
                          size="small"
                          color={verificationChipColor(user.verificationStatus)}
                          sx={{ fontWeight: 900 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <TextField
                          select
                          size="small"
                          value={user.verificationStatus}
                          onChange={(e) =>
                            handleVerificationUpdate(user._id, e.target.value)
                          }
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="pending">pending</MenuItem>
                          <MenuItem value="verified">verified</MenuItem>
                          <MenuItem value="rejected">rejected</MenuItem>
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AdminModeration;