import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  MenuItem,
  TextField,
  Alert,
  Stack,
  Divider
} from "@mui/material";

import usePaymentPolling from "./hooks/usePaymentPolling";
import PaymentStatusBanner from "./components/PaymentStatusBanner";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const PerformanceBookingFormModal = ({ performance, onClose, onBooked, open}) => {
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    bookingDate: "",
    from: "",
    to: "",
    eventDetails: "",
  });

  const [duration, setDuration] = useState(0);
  const [total, setTotal] = useState(0);
  const [reservationFee, setReservationFee] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const [bookingStatus, setBookingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [lastBookingId, setLastBookingId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  const [pollingKey, setPollingKey] = useState(0);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleSocketUpdate = ({ id, status, reason, mpesaCode }) => {
      if (id !== lastBookingId) return;

      if (status === "Success") {
        setBookingStatus("success");
        if (mpesaCode) setConfirmationCode(mpesaCode);
        setSuccessMessage("Booking confirmed! Confirmation sent to your email.");
        setTimeout(() => {
          onClose?.();
          onBooked?.();
        }, 9000);
      } else if (status === "Failed") {
        setBookingStatus("failed");
        setErrors({ general: reason || "Payment failed." });
      }

      setLoading(false);
    };

    socket.on("paymentUpdate", handleSocketUpdate);
    return () => socket.off("paymentUpdate", handleSocketUpdate);
  }, [lastBookingId, onClose, onBooked]);

  useEffect(() => {
    const { from, to } = form;
    if (from && to) {
      const start = new Date(`1970-01-01T${from}`);
      const end = new Date(`1970-01-01T${to}`);
      const diff = (end - start) / (1000 * 60 * 60);

      if (diff > 0) {
        setDuration(diff);
        const cost = diff * Number(performance.charges || 0);
        setTotal(cost);
        setReservationFee(Math.ceil(cost * 0.1));
      } else {
        setDuration(0);
        setTotal(0);
        setReservationFee(0);
      }
    }
  }, [form.from, form.to, performance.charges]);

  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return `254${digits.slice(1)}`;
    if (digits.startsWith("254")) return digits;
    return `254${digits}`;
  };

  const validateForm = () => {
    const errs = {};

    if (!form.clientName) errs.clientName = "Enter your name";
    if (!form.phone) errs.phone = "Enter your phone number";
    else if (!/^254\d{9}$/.test(formatPhone(form.phone)))
      errs.phone = "Invalid phone number";

    if (!form.email) errs.email = "Enter your email";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Invalid email address";

    if (!form.bookingDate) errs.bookingDate = "Select a date";
    if (!form.from) errs.from = "Start time required";
    if (!form.to) errs.to = "End time required";
    if (duration <= 0) errs.duration = "Invalid duration";

    return errs;
  };

  const checkAvailability = async () => {
    try {
      const params = new URLSearchParams();
      params.append("cardId", performance._id);
      params.append("bookingDate", form.bookingDate);
      params.append("from", form.from);
      params.append("to", form.to);

      const res = await axios.get(
        `${API_URL}/api/performance_bookings/check?${params}`
      );
      return res.data;
    } catch (err) {
      console.error("Availability check failed", err);
      return {
         available: false, 
         reason: err?.response?.data?.message || "Availability check failed" };
    }
  };

  const handleBookPerformance = async () => {
    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");
    setBookingStatus(null);

    const avail = await checkAvailability();
    if (!avail.available) {
      setErrors({ general: avail.reason });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        cardId: performance._id,
        creatorId: performance.userId,
        clientName: form.clientName,
        email: form.email,
        phone: formatPhone(form.phone),
        bookingDate: form.bookingDate,
        from: form.from,
        to: form.to,
        duration: String(duration),
        totalAmount: total,
        eventDetails: form.eventDetails,
        paymentMethod,
        amount: reservationFee,
      };

      const response = await axios.post( `${API_URL}/api/performance_bookings`, payload );
      const { booking, checkoutRequestId } = response.data;

      setLastBookingId(booking._id);
      setCheckoutRequestId(checkoutRequestId);
      setBookingStatus("pending");
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Booking failed.",
      });
      setBookingStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = useCallback(
    (mpesaCode) => {
      setBookingStatus("success");
      if (mpesaCode) setConfirmationCode(mpesaCode);
      setSuccessMessage("Booking confirmed! Confirmation email sent.");

      setTimeout(() => {
        onClose?.();
        onBooked?.();
      }, 9000);
    },
    [onClose, onBooked]
  );

  const handleFailure = useCallback((reason) => {
    setBookingStatus("failed");
    setErrors({ general: reason });
  }, []);

  const handleTimeout = useCallback(() => {
    setBookingStatus("failed");
    setErrors({ general: "Payment timeout. Try again." });
  }, []);

  usePaymentPolling({
    transactionId: lastBookingId,
    type: "performance",
    onSuccess: handleSuccess,
    onFailure: handleFailure,
    onTimeout: handleTimeout,
    pollingKey,
  });

  const handleRetry = async () => {
    setPollingKey((prev) => prev + 1);
    if (!lastBookingId || !checkoutRequestId) return;
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/mpesa/query`, {
        bookingId: lastBookingId,
        checkoutRequestId,
      });

      if (res.data.status === "Success") {
        setBookingStatus("success");
        setConfirmationCode(res.data.mpesaCode);
        setSuccessMessage('Booking confirmed! Confirmation sent to your email.');
        setTimeout(() => onClose(), 9000);
      } else {
        setBookingStatus("failed");
        setErrors({ general: "Payment still not completed." });
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Retry failed.",
      });
      setBookingStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle>
        Book {performance.name} for {performance.artType} Performance
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "80vh" }}>
        <Stack spacing={2}>
          {errors.general && (
            <Alert severity="error">{errors.general}</Alert>
          )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

          <PaymentStatusBanner
            status={bookingStatus}
            confirmationCode={confirmationCode}
            onRetry={handleRetry}
          />

          <Grid container spacing={2}  mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={form.clientName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clientName: e.target.value }))
                }
                error={Boolean(errors.clientName)}
                helperText={errors.clientName}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                error={Boolean(errors.phone)}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Booking Date"
                InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                value={form.bookingDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bookingDate: e.target.value }))
                }
                error={Boolean(errors.bookingDate)}
                helperText={errors.bookingDate}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={form.from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, from: e.target.value }))
                }
                error={Boolean(errors.from)}
                helperText={errors.from}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={form.to}
                onChange={(e) =>
                  setForm((p) => ({ ...p, to: e.target.value }))
                }
                error={Boolean(errors.to)}
                helperText={errors.to}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Details / Notes"
                multiline
                minRows={3}
                value={form.eventDetails}
                onChange={(e) =>
                  setForm((p) => ({ ...p, eventDetails: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Duration (hrs)"
                value={duration}
                InputProps={{ readOnly: true }}
              />
            </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="card" disabled>
                Debit Card (coming soon)
              </MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Total: Ksh {total}</Typography>
            <Typography variant="subtitle2">
              Reservation Fee (10%): Ksh {reservationFee}
            </Typography>
          </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleBookPerformance}
          disabled={loading || performance.status === "closed"}
        >
          {loading ? <CircularProgress size={22}/> : "Book Now"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PerformanceBookingFormModal;
