import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import io from "socket.io-client";
import PaymentStatusBanner from "./components/PaymentStatusBanner";
import usePaymentPolling from "./hooks/usePaymentPolling";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const TicketPurchase = ({ event, onClose }) => {
  const [ticketType, setTicketType] = useState(() => {
    if (event.ticketType === "free") return "Free";
    if (event.regularTicketsRemaining > 0) return "Regular";
    if (event.vipTicketsRemaining > 0) return "VIP";
    if (event.vvipTicketsRemaining > 0) return "VVIP";
    return "";
  });

  const [quantity, setQuantity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentOption, setPaymentOption] = useState("mpesa");
  const [totalAmount, setTotalAmount] = useState(0);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const [lastPurchaseId, setLastPurchaseId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [pollingKey, setPollingKey] = useState(0);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleSocketUpdate = ({ id, status, reason, mpesaCode }) => {
      if (id !== lastPurchaseId) return;

      if (status === "Success") {
        setPurchaseStatus("success");
        setConfirmationCode(mpesaCode);
        setSuccessMessage("Ticket purchase confirmed! Email sent.");
        setTimeout(() => onClose(), 6000);
      } else if (status === "Failed") {
        setPurchaseStatus("failed");
        setErrors({ general: reason || "Payment failed." });
      }

      setLoading(false);
    };

    socket.on("paymentUpdate", handleSocketUpdate);
    return () => socket.off("paymentUpdate", handleSocketUpdate);
  }, [lastPurchaseId, onClose]);

  useEffect(() => {
    setQuantity("");
  }, [ticketType]);

  useEffect(() => {
    if (!quantity || !ticketType) return setTotalAmount(0);

    const price =
      ticketType === "Regular" ? event.regularPrice :
      ticketType === "VIP" ? event.vipPrice :
      ticketType === "VVIP" ? event.vvipPrice : 0;

    setTotalAmount(price * quantity);
  }, [ticketType, quantity, event]);

  const formatPhoneNumber = (input) => {
    const clean = input.replace(/\D/g, "");
    return clean.startsWith("0")
      ? `254${clean.slice(1)}`
      : clean.startsWith("254")
      ? clean
      : `254${clean}`;
  };

  const validateForm = () => {
    const errs = {};

    if (!ticketType) errs.ticketType = "Please select a ticket type";
    if (!quantity || quantity <= 0) errs.quantity = "Enter ticket quantity";

    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      errs.email = "Enter a valid email";

    const formatted = formatPhoneNumber(phone);
    if (!phone) errs.phone = "Phone is required";
    else if (!/^(254\d{9})$/.test(formatted))
      errs.phone = "Invalid phone number";

    if (event.ticketType !== "free" && !paymentOption)
      errs.paymentOption = "Choose payment method";

    return errs;
  };

  const handleBuyTicket = async () => {
    const val = validateForm();
    if (Object.keys(val).length > 0) {
      setErrors(val);
      return;
    }

    setErrors({});
    setPurchaseStatus(null);
    setConfirmationCode("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);

      const purchaseData = {
        ticketType,
        quantity,
        email,
        phone: formattedPhone,
        paymentOption:
          event.ticketType === "free" ? "free" : paymentOption,
        totalAmount:
          event.ticketType === "free" ? 0 : totalAmount,
        eventId: event._id,
        creatorId: event.userId,
        eventTitle: event.title,
      };

      const res = await axios.post(
        `${API_URL}/api/ticket_purchases`,
        purchaseData
      );

      if (event.ticketType === "free") {
        setPurchaseStatus("success");
        setTimeout(() => onClose(), 4000);
        return;
      }

      const { purchase, checkoutRequestId } = res.data;
      setLastPurchaseId(purchase._id);
      setCheckoutRequestId(checkoutRequestId);
      setPurchaseStatus("pending");
    } catch (err) {
      console.error("Purchase error:", err);
      setPurchaseStatus("failed");
      setErrors({
        general: err.response?.data?.message || "Error processing purchase",
      });
      setLoading(false);
    }
  };

      const handleSuccess = useCallback((mpesaCode) => {
      setPurchaseStatus('success');
      if (mpesaCode) setConfirmationCode(mpesaCode);
      setSuccessMessage('Booking confirmed! Confirmation sent to your email.');
      setTimeout(() => onClose(), 10000);
    }, [onClose]);

    const handleFailure = useCallback((reason) => {
      setPurchaseStatus('failed');
      setErrors({ general: reason || 'Payment failed.' });
    }, []);

    const handleTimeout = useCallback(() => {
      setPurchaseStatus('failed');
      setErrors({ general: 'Payment timeout. Try again.' });
    }, []);

    usePaymentPolling({
    transactionId: lastPurchaseId,
    type: 'ticket',
    onSuccess: handleSuccess,
    onFailure: handleFailure,
    onTimeout: handleTimeout,
    pollingKey
  });

  const handleRetry = async () => {
  setPollingKey(prev => prev + 1);
    if (!lastPurchaseId || !checkoutRequestId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/mpesa/query`, {
        purchaseId: lastPurchaseId,
        checkoutRequestId,
      });

      if (res.data.status === "Success") {
        setPurchaseStatus("success");
        setConfirmationCode(res.data.mpesaCode);
        setTimeout(() => onClose(), 6000);
      } else {
        setPurchaseStatus("failed");
        setErrors({ general: "Still waiting for payment." });
      }
    } catch (err) {
      setErrors({ general: "Retry failed." });
    }

    setLoading(false);
  };

  const maxTickets =
    ticketType === "Regular"
      ? event.regularTicketsRemaining
      : ticketType === "VIP"
      ? event.vipTicketsRemaining
      : ticketType === "VVIP"
      ? event.vvipTicketsRemaining
      : event.freeTicketsRemaining;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Buy Tickets — {event.title}</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "65vh" }}>
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
          status={purchaseStatus}
          confirmationCode={confirmationCode}
          onRetry={handleRetry}
        />

        <Stack spacing={2} mt={2}>
          <TextField
            select
            label="Ticket Type"
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            error={!!errors.ticketType}
            helperText={errors.ticketType}
          >
            {event.ticketType === "free" && (
              <MenuItem value="Free">Free Ticket</MenuItem>
            )}

            {event.regularTicketsRemaining > 0 && (
              <MenuItem value="Regular">
                Regular — Ksh.{event.regularPrice}
              </MenuItem>
            )}

            {event.vipTicketsRemaining > 0 && (
              <MenuItem value="VIP">VIP — Ksh.{event.vipPrice}</MenuItem>
            )}

            {event.vvipTicketsRemaining > 0 && (
              <MenuItem value="VVIP">VVIP — Ksh.{event.vvipPrice}</MenuItem>
            )}
          </TextField>

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1, max: maxTickets }}
            error={!!errors.quantity}
            helperText={errors.quantity}
          />

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Phone (07xxxxxxxx)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
          />

          {event.ticketType !== "free" && (
            <TextField
              select
              label="Payment Method"
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              error={!!errors.paymentOption}
              helperText={errors.paymentOption}
            >
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="card" disabled>
                Debit Card (Coming Soon)
              </MenuItem>
            </TextField>
          )}

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Total Amount: Ksh.{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
      <Stack direction="row" spacing={2} p={1}  justifyContent= "space-between" width="100%">
        <Button onClick={onClose}> Cancel </Button>
        <Button
          variant="contained"
          onClick={handleBuyTicket}
          disabled={loading ||
            (event.ticketType !== "free" &&
              event.regularTicketsRemaining <= 0 &&
              event.vipTicketsRemaining <= 0 &&
              event.vvipTicketsRemaining <= 0)
          }
        >
          {loading ? <CircularProgress size={22} /> : "Buy Ticket"}
        </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TicketPurchase;
