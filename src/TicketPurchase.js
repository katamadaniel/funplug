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
import { fetchEventById } from "./services/eventService";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const TicketPurchase = ({ event, onClose }) => {
  const [eventData, setEventData] = useState(event);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Fetch full event details when modal mounts
  useEffect(() => {
    if (!event?._id) return;

    const fetchDetails = async () => {
      try {
        setIsLoadingDetails(true);
        setLoadError(null);
        const fullEvent = await fetchEventById(event._id);
        if (fullEvent) {
          setEventData(fullEvent);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        setLoadError("Failed to load event details");
        setEventData(event);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [event?._id, event]);

  const [ticketType, setTicketType] = useState(() => {
    if (eventData.ticketType === "free") return "Free";
    if (eventData.regularTicketsRemaining > 0) return "Regular";
    if (eventData.vipTicketsRemaining > 0) return "VIP";
    if (eventData.vvipTicketsRemaining > 0) return "VVIP";
    return "";
  });

  // Update ticket type when detailed data is loaded
  useEffect(() => {
    if (eventData) {
      if (eventData.ticketType === "free") setTicketType("Free");
      else if (eventData.regularTicketsRemaining > 0) setTicketType("Regular");
      else if (eventData.vipTicketsRemaining > 0) setTicketType("VIP");
      else if (eventData.vvipTicketsRemaining > 0) setTicketType("VVIP");
      else setTicketType("");
    }
  }, [eventData.ticketType, eventData.regularTicketsRemaining, eventData.vipTicketsRemaining, eventData.vvipTicketsRemaining]);

  const [quantity, setQuantity] = useState("");
  const [clientName, setClientName] = useState("");
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
      ticketType === "Regular" ? eventData.regularPrice :
      ticketType === "VIP" ? eventData.vipPrice :
      ticketType === "VVIP" ? eventData.vvipPrice : 0;

    setTotalAmount(price * quantity);
  }, [ticketType, quantity, eventData]);

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

    const max =
      ticketType === "Regular"
        ? eventData.regularTicketsRemaining
        : ticketType === "VIP"
        ? eventData.vipTicketsRemaining
        : ticketType === "VVIP"
        ? eventData.vvipTicketsRemaining
        : eventData.freeTicketsRemaining;

    if (!quantity || quantity <= 0) {
      errs.quantity = "Enter ticket quantity";
    } else if (quantity > max) {
      errs.quantity = `Only ${max} ticket(s) remaining`;
    }

    if (!clientName) errs.clientName = "Enter your name";

    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";

    const formatted = formatPhoneNumber(phone);
    if (!phone) errs.phone = "Phone is required";
    else if (!/^(254\d{9})$/.test(formatted)) errs.phone = "Invalid phone number";

    if (eventData.ticketType !== "free" && !paymentOption)
      errs.paymentOption = "Choose payment method";

    // block sold out ticket types
    if (max <= 0) {
      errs.ticketType = "Selected ticket type is sold out";
    }

    return errs;
  };

  const handleBuyTicket = async () => {
    // Ensure event data is fully loaded
    if (isLoadingDetails) {
      setErrors({ general: "Please wait while event details are loading..." });
      return;
    }

    if (!eventData?._id || !eventData?.userId) {
      setErrors({ general: "Event data is incomplete. Please refresh and try again." });
      return;
    }

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
        ticketType: ticketType.toUpperCase(),
        quantity: parseInt(quantity),
        clientName: clientName.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        paymentOption: eventData.ticketType === "free" ? "cash" : paymentOption,
        eventId: eventData._id,
        creatorId: eventData.userId,
        eventTitle: eventData.title,
        eventVenue: eventData.venue,
        eventDate: eventData.date,
        from: eventData.startTime,
        to: eventData.endTime,
      };

      const res = await axios.post(
        `${API_URL}/api/ticket_purchases`,
        purchaseData
      );

      if (eventData.ticketType === "free") {
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
      ? eventData.regularTicketsRemaining
      : ticketType === "VIP"
      ? eventData.vipTicketsRemaining
      : ticketType === "VVIP"
      ? eventData.vvipTicketsRemaining
      : eventData.freeTicketsRemaining;

  const isSelectedSoldOut =
    ticketType === "Regular"
      ? eventData.regularTicketsRemaining <= 0
      : ticketType === "VIP"
      ? eventData.vipTicketsRemaining <= 0
      : ticketType === "VVIP"
      ? eventData.vvipTicketsRemaining <= 0
      : ticketType === "Free"
      ? eventData.freeTicketsRemaining <= 0
      : true;      
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Buy Tickets — {eventData.title}</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "65vh" }}>
        {isLoadingDetails && (
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress size={40} />
          </Box>
        )}

        {loadError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}

        {isSelectedSoldOut && ticketType && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The selected ticket type is sold out.
          </Alert>
        )}
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
            {eventData.ticketType === "free" && (
              <MenuItem value="Free">Free Ticket</MenuItem>
            )}

            <MenuItem value="Regular" disabled={eventData.regularTicketsRemaining <= 0}>
              Regular — Ksh.{eventData.regularPrice} {eventData.regularTicketsRemaining <= 0 ? '(Sold Out)' : ''}
            </MenuItem>
            <MenuItem value="VIP" disabled={eventData.vipTicketsRemaining <= 0}>
              VIP — Ksh.{eventData.vipPrice} {eventData.vipTicketsRemaining <= 0 ? '(Sold Out)' : ''}
            </MenuItem>
            <MenuItem value="VVIP" disabled={eventData.vvipTicketsRemaining <= 0}>
              VVIP — Ksh.{eventData.vvipPrice} {eventData.vvipTicketsRemaining <= 0 ? '(Sold Out)' : ''}
            </MenuItem>
          </TextField>

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);

              if (!value) return setQuantity("");

              if (value > maxTickets) setQuantity(maxTickets);
              else if (value < 1) setQuantity(1);
              else setQuantity(value);
            }}
            inputProps={{ min: 1, max: maxTickets }}
            error={!!errors.quantity}
            helperText={errors.quantity}
          />

          <TextField
            label="Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            error={!!errors.clientName}
            helperText={errors.clientName}
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

          {eventData.ticketType !== "free" && (
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
          disabled={
            loading ||
            isLoadingDetails ||
            !ticketType ||
            isSelectedSoldOut ||
            !quantity ||
            quantity <= 0 ||
            quantity > maxTickets
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