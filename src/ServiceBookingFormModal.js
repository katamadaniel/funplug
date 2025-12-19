import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import PaymentStatusBanner from "./components/PaymentStatusBanner";
import usePaymentPolling from "./hooks/usePaymentPolling";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const ServiceBookingFormModal = ({ service, open, onClose, onBooked }) => {
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    bookingDate: "",
    from: "",
    to: "",
    quantity: 1,
    eventDetails: "",
  });

  const [duration, setDuration] = useState(0);
  const [total, setTotal] = useState(0);
  const [reservationFee, setReservationFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
        setSuccessMessage("Booking confirmed! A confirmation email has been sent.");

        setTimeout(() => {
          onClose?.();
          onBooked?.();
        }, 9000);
      } else if (status === "Failed") {
        setBookingStatus("failed");
        setErrors({ general: reason || "Payment failed" });
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
      } else {
        setDuration(0);
      }
    }

    const total = Number(service?.charges || 0);
    setTotal(total);
    setReservationFee(Math.ceil(total * 0.1));
  }, [form.from, form.to, service?.charges]);

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
      errs.email = "Invalid email format";
    if (!form.bookingDate) errs.bookingDate = "Select a date";
    if (!form.from) errs.from = "Start time required";
    if (!form.to) errs.to = "End time required";
    if (duration <= 0) errs.duration = "Invalid duration";
    if (!form.quantity || form.quantity < 1)
      errs.quantity = "Enter a valid quantity";
    return errs;
  };

  const handleInputChange = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const checkAvailability = async () => {
    try {
      const params = new URLSearchParams();
      params.append("serviceId", service._id);
      params.append("bookingDate", form.bookingDate);
      params.append("from", form.from);
      params.append("to", form.to);

      const res = await axios.get(
        `${API_URL}/api/service_bookings/check?${params.toString()}`
      );

      return res.data;
      
  } catch (err) {
    console.error("Availability check error:", err);

    return {
      available: false,
      reason: err?.response?.data?.message || "Availability check failed",
    };
  }
};


  const handleBookService = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        serviceId: service._id,
        creatorId: service.userId,
        clientName: form.clientName,
        email: form.email,
        phone: formatPhone(form.phone),
        bookingDate: form.bookingDate,
        from: form.from,
        to: form.to,
        duration: String(duration),
        quantity: form.quantity,
        eventDetails: form.eventDetails,
        totalAmount: total,
        paymentMethod,
        amount: reservationFee,
      };

      const response = await axios.post(`${API_URL}/api/service_bookings`, payload);
      const { booking, checkoutRequestId } = response.data;

      setLastBookingId(booking._id);
      setCheckoutRequestId(checkoutRequestId);
      setBookingStatus("pending");
    } catch (err) {
      setErrors({ general: err?.response?.data?.message || "Booking failed" });
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
    type: "service",
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>Book Service — {service.serviceType}</DialogTitle>

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
              label="Name"
              fullWidth
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
              label="Phone"
              fullWidth
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
              label="Email"
              fullWidth
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
              label="Booking Date"
              type="date"
              fullWidth
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
              label="Estimate number of guests"
              type="number"
              fullWidth
              value={form.quantity}
              onChange={handleInputChange("quantity")}
              error={Boolean(errors.endTime)}
              helperText={errors.quantity}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Event Details / Notes"
              fullWidth
              multiline
              minRows={3}
              value={form.eventDetails}
              onChange={handleInputChange("eventDetails")}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={loading || service.status === "closed"}
          onClick={handleBookService}
        >
          {loading ? <CircularProgress size={22} /> : "Book Service"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceBookingFormModal;
