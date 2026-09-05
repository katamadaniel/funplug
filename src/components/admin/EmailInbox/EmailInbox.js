import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplayIcon from "@mui/icons-material/Replay";
import ReplyIcon from "@mui/icons-material/Reply";
import { fetchEmailLogs, resendEmail, respondToEmail } from "../../../services/adminService";

const statusColor = (status) => {
  switch (status) {
    case "queued":
      return "default";
    case "processing":
      return "info";
    case "sent":
      return "primary";
    case "delivered":
      return "success";
    case "opened":
      return "success";
    case "clicked":
      return "success";
    case "failed":
      return "error";
    case "bounced":
      return "error";
    case "spam":
      return "warning";
    case "blocked":
      return "warning";
    case "received":
      return "secondary";
    case "responded":
      return "success";
    default:
      return "default";
  }
};

const EmailInbox = ({ onRefresh }) => {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    status: "",
    channel: "",
    direction: "",
    search: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchEmailLogs({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        channel: filters.channel || undefined,
        direction: filters.direction || undefined,
        search: filters.search || undefined,
      });

      setEmails(res.data || []);
      setPagination(res.pagination || pagination);
    } catch (err) {
      console.error("Failed to load email logs:", err);
      setError("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const handleRefresh = () => {
    loadEmails();
    if (onRefresh) onRefresh();
  };

  const handleViewEmail = (email) => {
    setSelectedEmail(email);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setSelectedEmail(null);
    setViewOpen(false);
  };

  const handleResend = async (emailId) => {
    try {
      await resendEmail(emailId);
      await loadEmails();
    } catch (err) {
      console.error("Resend failed:", err);
      alert(err.response?.data?.message || "Resend failed");
    }
  };

  const handleOpenReply = (email) => {
    setSelectedEmail(email);
    setReplyMessage("");
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedEmail?._id) return;

    if (!replyMessage.trim()) {
      alert("Reply message cannot be empty.");
      return;
    }

    setReplyLoading(true);

    try {
      await respondToEmail(selectedEmail._id, replyMessage.trim());
      setReplyOpen(false);
      setSelectedEmail(null);
      await loadEmails();
    } catch (err) {
      console.error("Reply failed:", err);
      alert(err.response?.data?.message || "Failed to send reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleFilterChange = (key) => (e) => {
    setPagination((p) => ({ ...p, page: 1 }));
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((p) => ({ ...p, page: p.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((p) => ({ ...p, page: p.page - 1 }));
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Email Inbox
            </Typography>

            <Typography variant="body2" color="text.secondary">
              View all sent and received emails with delivery tracking
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.78)' : 'rgba(255,255,255,0.82)', border: 1, borderColor: 'divider', backdropFilter: 'blur(18px)' }} elevation={0}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Search (to/from/subject)"
              value={filters.search}
              onChange={handleFilterChange("search")}
              fullWidth
              size="small"
            />

            <Select
              value={filters.status}
              onChange={handleFilterChange("status")}
              displayEmpty
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="queued">Queued</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="opened">Opened</MenuItem>
              <MenuItem value="clicked">Clicked</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="bounced">Bounced</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="received">Received</MenuItem>
              <MenuItem value="responded">Responded</MenuItem>
            </Select>

            <Select
              value={filters.channel}
              onChange={handleFilterChange("channel")}
              displayEmpty
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Channels</MenuItem>
              <MenuItem value="noreply">noreply</MenuItem>
              <MenuItem value="support">support</MenuItem>
            </Select>

            <Select
              value={filters.direction}
              onChange={handleFilterChange("direction")}
              displayEmpty
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Directions</MenuItem>
              <MenuItem value="outbound">Outbound</MenuItem>
              <MenuItem value="inbound">Inbound</MenuItem>
            </Select>
          </Stack>
        </Paper>

        {/* Error */}
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {/* Table */}
        <Paper sx={{ borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', overflow: 'hidden' }} elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Channel</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Direction</strong>
                  </TableCell>

                  <TableCell>
                    <strong>To</strong>
                  </TableCell>

                  <TableCell>
                    <strong>From</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Subject</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={4}>
                        <CircularProgress size={30} />

                        <Typography variant="body2" mt={1}>
                          Loading emails...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : emails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={4}>
                        <Typography>No email logs found.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  emails.map((email) => (
                    <TableRow key={email._id} hover>
                      <TableCell>
                        <Chip
                          size="small"
                          label={email.status}
                          color={statusColor(email.status)}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip size="small" label={email.channel || "-"} />
                      </TableCell>

                      <TableCell>
                        <Chip size="small" label={email.direction || "-"} />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {email.to || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {email.from || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography variant="body2" noWrap>
                          {email.subject || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {email.createdAt
                            ? new Date(email.createdAt).toLocaleString()
                            : "-"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View email">
                          <IconButton
                            size="small"
                            onClick={() => handleViewEmail(email)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        {email.direction === "outbound" && (
                          <Tooltip title="Resend email">
                            <IconButton
                              size="small"
                              onClick={() => handleResend(email._id)}
                            >
                              <ReplayIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {email.direction === "inbound" && (
                          <Tooltip title="Respond">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReply(email)}
                            >
                              <ReplyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />

          {/* Pagination */}
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              Page {pagination.page} of {pagination.totalPages} — Total {pagination.total}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handlePrevPage}
                disabled={pagination.page <= 1 || loading}
              >
                Prev
              </Button>

              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>

      {/* VIEW MODAL */}
      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="md">
        <DialogTitle>Email Details</DialogTitle>

        <DialogContent dividers>
          {!selectedEmail ? (
            <Typography>No email selected.</Typography>
          ) : (
            <>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedEmail.status}
              </Typography>

              <Typography variant="body2">
                <strong>Channel:</strong> {selectedEmail.channel}
              </Typography>

              <Typography variant="body2">
                <strong>Direction:</strong> {selectedEmail.direction}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2">
                <strong>To:</strong> {selectedEmail.to || "-"}
              </Typography>

              <Typography variant="body2">
                <strong>From:</strong> {selectedEmail.from || "-"}
              </Typography>

              <Typography variant="body2">
                <strong>Subject:</strong> {selectedEmail.subject || "-"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {selectedEmail.text && (
                <>
                  <Typography variant="subtitle2">Text Version</Typography>

                  <Paper sx={{ p: 2, mt: 1, mb: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? "#080b12" : "#1b1f2a", border: 1, borderColor: "divider" }} elevation={0}>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", color: "#ddd" }}
                    >
                      {selectedEmail.text}
                    </Typography>
                  </Paper>
                </>
              )}

              {selectedEmail.html && (
                <>
                  <Typography variant="subtitle2">HTML Preview</Typography>

                  <Paper
                    sx={{
                      p: 2,
                      mt: 1,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      overflow: "auto",
                      maxHeight: 400,
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                  </Paper>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* REPLY MODAL */}
      <Dialog
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send Reply</DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" mb={1}>
            <strong>Replying to:</strong> {selectedEmail?.from || "-"}
          </Typography>

          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Write your reply..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReplyOpen(false)} disabled={replyLoading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSendReply}
            disabled={replyLoading}
          >
            {replyLoading ? "Sending..." : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailInbox;
