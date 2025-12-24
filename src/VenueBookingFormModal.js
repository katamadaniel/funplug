import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Alert,
  Stack,
  MenuItem,
  Typography,
  CircularProgress,
  Divider
} from "@mui/material";
import PaymentStatusBanner from "./components/PaymentStatusBanner";
import usePaymentPolling from "./hooks/usePaymentPolling";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const VenueBookingFormModal = ({ venue, onClose, onBooked }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
  });

  const [duration, setDuration] = useState(0);
  const [total, setTotal] = useState(venue.charges);
  const [reservationFee, setReservationFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
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
    const { startTime, endTime } = form;
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);

      if (hours > 0) {
        setDuration(hours);
        const totalCost = hours * venue.charges;
        setTotal(totalCost);
        setReservationFee(Math.ceil(totalCost * 0.1));
      } else {
        setErrors((prev) => ({
          ...prev,
          endTime: "End time must be after start time.",
        }));
      }
    }
  }, [form.startTime, form.endTime, venue.charges]);

  const today = new Date().toISOString().split("T")[0];

  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.startsWith("0")
      ? `254${digits.slice(1)}`
      : digits.startsWith("254")
      ? digits
      : `254${digits}`;
  };

  const validateForm = () => {
    const errs = {};

    if (!form.name) errs.name = "Enter your name";
    if (!form.phone) errs.phone = "Enter phone number";
    else if (!/^254\d{9}$/.test(formatPhone(form.phone)))
      errs.phone = "Invalid phone number";

    if (!form.email) errs.email = "Enter email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";

    if (!form.bookingDate) errs.bookingDate = "Pick a date";
    if (!form.startTime) errs.startTime = "Select start time";
    if (!form.endTime) errs.endTime = "Select end time";

    return errs;
  };

  const handleInputChange = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const checkAvailability = async () => {
    try {
      const { bookingDate, startTime, endTime } = form;
      const params = new URLSearchParams();
      params.append("venueId", venue._id);
      params.append("bookingDate", bookingDate);
      params.append("startTime", startTime);
      params.append("endTime", endTime);

      const res = await axios.get(
        `${API_URL}/api/venue_bookings/check?${params.toString()}`
      );

      return res.data;
    } catch (err) {
      console.error("Availability check failed", err);
      return {
         available: false, 
         reason: err?.response?.data?.message || "Availability check failed" };
    }
  };

  const handleBookVenue = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors);

    setErrors({});
    setLoading(true);
    setSuccessMessage("");
    setBookingStatus(null);

    try {
      const avail = await checkAvailability();
      if (!avail.available) {
        setErrors({ general: avail.reason });
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/api/venue_bookings`, {
        ...form,
        phone: formatPhone(form.phone),
        duration,
        total,
        venueId: venue._id,
        creatorId: venue.userId,
        venueTitle: venue.name,
        paymentMethod,
        amount: reservationFee,
      });

      const { booking, checkoutRequestId } = response.data;
      setLastBookingId(booking._id);
      setCheckoutRequestId(checkoutRequestId);
      setBookingStatus("pending");
    } catch (err) {
      console.error("Booking error:", err);
      setErrors({
        general: err?.response?.data?.message || "Booking failed.",
      });
      setBookingStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = useCallback((mpesaCode) => {
      setBookingStatus("success");
      if (mpesaCode) setConfirmationCode(mpesaCode);
      setSuccessMessage("Booking confirmed! Confirmation email sent.");
        setTimeout(() => {
          onClose?.();
          onBooked?.();
        }, 9000);
    }, [onClose, onBooked]);

  const handleFailure = useCallback((reason) => {
    setBookingStatus("failed");
    setErrors({ general: reason || "Payment failed." });
  }, []);

  const handleTimeout = useCallback(() => {
    setBookingStatus("failed");
    setErrors({ general: "Payment timeout. Try again." });
  }, []);

  usePaymentPolling({
    transactionId: lastBookingId,
    type: "venue",
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
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle>Book {venue.name}</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "75vh", overflowY: "auto", pb: 2 }}>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
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

        <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                error={Boolean(errors.name)}
                helperText={errors.name}
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
              inputProps={{ min: today }}
              value={form.bookingDate}
              onChange={handleInputChange("bookingDate")}
              error={Boolean(errors.bookingDate)}
              helperText={errors.bookingDate}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              InputLabelProps={{ shrink: true }}
              value={form.startTime}
              onChange={handleInputChange("startTime")}
              error={Boolean(errors.startTime)}
              helperText={errors.startTime}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              InputLabelProps={{ shrink: true }}
              value={form.endTime}
              onChange={handleInputChange("endTime")}
              error={Boolean(errors.endTime)}
              helperText={errors.endTime}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Duration (hours)" value={duration} InputProps={{ readOnly: true }} />
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
              Reservation Fee: Ksh {reservationFee}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
      <Stack direction="row" spacing={2} p={1}  justifyContent= "space-between" width="100%">
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleBookVenue}
          disabled={loading || venue.bookingStatus === "closed"}
        >
          {loading ? <CircularProgress size={22} /> : "Book Venue"}
        </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default VenueBookingFormModal;
