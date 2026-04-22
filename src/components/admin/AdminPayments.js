import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Pagination,
  Tooltip,
  Grid,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import BlockIcon from "@mui/icons-material/Block";
import NotesIcon from "@mui/icons-material/Notes";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import {
  getPaymentsAudits,
  getPaymentAuditDetails,
  ignorePaymentAudit,
  markPaymentAuditRefunded,
  updatePaymentAuditNotes,
  getPaymentsAuditStats,
} from "../../services/adminService";

const STATUSES = [
  "PendingReview",
  "Reviewed",
  "RefundRequired",
  "Refunded",
  "Ignored",
];

const MODELS = [
  "All",
  "TicketPurchase",
  "VenueBooking",
  "PerformanceBooking",
  "ServiceBooking",
];

function statusColor(status) {
  if (status === "RefundRequired") return "error";
  if (status === "PendingReview") return "warning";
  if (status === "Refunded") return "success";
  if (status === "Reviewed") return "info";
  if (status === "Ignored") return "default";
  return "default";
}

function paymentStatusColor(status) {
  if (status === "Success") return "success";
  if (status === "Failed") return "error";
  if (status === "Pending") return "warning";
  return "default";
}

function formatKES(amount) {
  if (amount === undefined || amount === null) return "KES 0";
  return `KES ${Number(amount).toLocaleString()}`;
}

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [model, setModel] = useState("All");
  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 15;

  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState([]);
  const [total, setTotal] = useState(0);

  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState([]);

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReference, setRefundReference] = useState("");

  const activeStatus = useMemo(() => STATUSES[activeTab], [activeTab]);

  const totalPages = Math.ceil(total / limit);

  const statsMap = useMemo(() => {
    const map = {};
    for (const s of stats) {
      map[s._id] = s;
    }
    return map;
  }, [stats]);

  const overallTotals = useMemo(() => {
    const totalCount = stats.reduce((sum, s) => sum + (s.count || 0), 0);
    const totalAmount = stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    return { totalCount, totalAmount };
  }, [stats]);

  async function fetchAudits() {
    setLoading(true);
    try {
      const params = {
        status: activeStatus,
        page,
        limit,
      };

      if (model !== "All") params.model = model;
      if (search.trim()) params.search = search.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const data = await getPaymentsAudits(params);

      setAudits(data.audits || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Payments audits fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const params = {};

      if (model !== "All") params.model = model;
      if (search.trim()) params.search = search.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const data = await getPaymentsAuditStats(params);

      setStats(data.stats || []);
    } catch (err) {
      console.error("Payments stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function openDetails(auditId) {
    setDetailsOpen(true);
    setDetailsLoading(true);

    try {
      const data = await getPaymentAuditDetails(auditId);

      setSelectedAudit(data.audit);
      setSelectedTransaction(data.transaction);
      setNotesValue(data.audit?.adminNotes || "");
      setRefundReference(data.audit?.refundReference || "");
    } catch (err) {
      console.error("Failed to load audit details:", err);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function markIgnored(auditId) {
    try {
      await ignorePaymentAudit(auditId, { adminNotes: notesValue });
      setDetailsOpen(false);
      await fetchAudits();
      await fetchStats();
    } catch (err) {
      console.error("Ignore payment audit error:", err);
    }
  }

  async function updateNotes(auditId) {
    try {
      await updatePaymentAuditNotes(auditId, { adminNotes: notesValue });
      setNotesDialogOpen(false);
      await fetchAudits();
    } catch (err) {
      console.error("Update notes error:", err);
    }
  }

  async function markRefunded(auditId) {
    try {
      await markPaymentAuditRefunded(auditId, {
        refundReference,
        adminNotes: notesValue,
      });

      setRefundDialogOpen(false);
      setDetailsOpen(false);

      await fetchAudits();
      await fetchStats();
    } catch (err) {
      console.error("Mark refunded error:", err);
    }
  }

  function clearFilters() {
    setSearch("");
    setModel("All");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  useEffect(() => {
    fetchAudits();
    // eslint-disable-next-line
  }, [activeStatus, model, page, fromDate, toDate]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [model, fromDate, toDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchAudits();
      fetchStats();
    }, 600);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [search]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Payments Reconciliation
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Review all M-Pesa transactions (success, failed, pending). Track refunds,
        ignored cases, and reconciliation totals.
      </Typography>

      {/* STATS */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Summary
        </Typography>

        {statsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Audits
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {overallTotals.totalCount.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount Logged
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatKES(overallTotals.totalAmount)}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Refund Required
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(statsMap["RefundRequired"]?.count || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="Pending Review" />
          <Tab label="Reviewed" />
          <Tab label="Refund Required" />
          <Tab label="Refunded" />
          <Tab label="Ignored" />
        </Tabs>

        {/* FILTERS */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          <TextField
            label="Search (CheckoutID / Receipt / Phone / Reason)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Model"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 220 }}
          >
            {MODELS.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchAudits();
              fetchStats();
            }}
            disabled={loading}
            sx={{ minWidth: 140 }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<ClearAllIcon />}
            onClick={clearFilters}
            sx={{ minWidth: 140 }}
          >
            Clear
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* TABLE */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : audits.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body1" fontWeight={600}>
              No payment audits found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try switching tabs or changing your filters.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Audit</b>
                  </TableCell>
                  <TableCell>
                    <b>Payment</b>
                  </TableCell>
                  <TableCell>
                    <b>Model</b>
                  </TableCell>
                  <TableCell>
                    <b>CheckoutRequestID</b>
                  </TableCell>
                  <TableCell>
                    <b>Receipt</b>
                  </TableCell>
                  <TableCell>
                    <b>Amount</b>
                  </TableCell>
                  <TableCell>
                    <b>Phone</b>
                  </TableCell>
                  <TableCell>
                    <b>Created</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {audits.map((a) => (
                  <TableRow key={a._id} hover>
                    <TableCell>
                      <Chip
                        label={a.status}
                        color={statusColor(a.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={a.paymentStatus || "Pending"}
                        color={paymentStatusColor(a.paymentStatus)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>{a.model}</TableCell>

                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {a.checkoutRequestId}
                    </TableCell>

                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {a.mpesaReceiptNumber || "—"}
                    </TableCell>

                    <TableCell>{a.amount ?? "—"}</TableCell>
                    <TableCell>{a.phoneNumber ?? "—"}</TableCell>

                    <TableCell>
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton onClick={() => openDetails(a._id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Add Notes">
                        <IconButton
                          onClick={() => {
                            setSelectedAudit(a);
                            setNotesValue(a.adminNotes || "");
                            setNotesDialogOpen(true);
                          }}
                        >
                          <NotesIcon />
                        </IconButton>
                      </Tooltip>

                      {a.status !== "Refunded" && (
                        <Tooltip title="Mark Refunded">
                          <IconButton
                            onClick={() => {
                              setSelectedAudit(a);
                              setRefundReference("");
                              setNotesValue(a.adminNotes || "");
                              setRefundDialogOpen(true);
                            }}
                          >
                            <DoneAllIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {a.status !== "Ignored" && (
                        <Tooltip title="Ignore">
                          <IconButton
                            onClick={() => {
                              setSelectedAudit(a);
                              setNotesValue(a.adminNotes || "");
                              markIgnored(a._id);
                            }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
            />
          )}
        </Box>
      </Paper>

      {/* DETAILS DIALOG */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Audit Details</DialogTitle>

        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : !selectedAudit ? (
            <Typography>No data</Typography>
          ) : (
            <Box>
              <Stack direction="row" spacing={1} mb={2}>
                <Chip
                  label={selectedAudit.status}
                  color={statusColor(selectedAudit.status)}
                />
                <Chip
                  label={selectedAudit.paymentStatus || "Pending"}
                  variant="outlined"
                  color={paymentStatusColor(selectedAudit.paymentStatus)}
                />
                <Chip label={selectedAudit.model} variant="outlined" />
              </Stack>

              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                CheckoutRequestID: {selectedAudit.checkoutRequestId}
              </Typography>

              <Typography variant="body2" sx={{ fontFamily: "monospace", mt: 1 }}>
                MerchantRequestID: {selectedAudit.merchantRequestId || "—"}
              </Typography>

              <Typography variant="body2" sx={{ fontFamily: "monospace", mt: 1 }}>
                M-Pesa Receipt: {selectedAudit.mpesaReceiptNumber || "—"}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Reason: {selectedAudit.reason || "—"}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Amount: {selectedAudit.amount ?? "—"}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Phone: {selectedAudit.phoneNumber ?? "—"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Admin Notes
              </Typography>

              <TextField
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Audit Record (JSON)
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#0b0f19",
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: 12,
                  overflow: "auto",
                  maxHeight: 260,
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(selectedAudit, null, 2)}
                </pre>
              </Paper>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Transaction Record (JSON)
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#0b0f19",
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: 12,
                  overflow: "auto",
                  maxHeight: 260,
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(selectedTransaction, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>

          {selectedAudit && (
            <>
              <Button
                variant="outlined"
                onClick={async () => {
                  await updatePaymentAuditNotes(selectedAudit._id, {
                    adminNotes: notesValue,
                  });
                  await fetchAudits();
                }}
                disabled={detailsLoading}
              >
                Save Notes
              </Button>

              {selectedAudit.status !== "Refunded" && (
                <Button
                  variant="contained"
                  onClick={() => setRefundDialogOpen(true)}
                >
                  Mark Refunded
                </Button>
              )}

              {selectedAudit.status !== "Ignored" && (
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => markIgnored(selectedAudit._id)}
                >
                  Ignore
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* NOTES DIALOG */}
      <Dialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add / Update Notes</DialogTitle>
        <DialogContent dividers>
          <TextField
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            label="Admin Notes"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => updateNotes(selectedAudit?._id)}
            disabled={!selectedAudit}
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* REFUND DIALOG */}
      <Dialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Payment as Refunded</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter the refund reference number (manual or M-Pesa reversal reference).
          </Typography>

          <TextField
            label="Refund Reference"
            value={refundReference}
            onChange={(e) => setRefundReference(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Admin Notes"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => markRefunded(selectedAudit?._id)}
            disabled={!selectedAudit}
          >
            Confirm Refunded
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPayments;