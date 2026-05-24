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

  const [selectedPackageId, setSelectedPackageId] = useState("");

  useEffect(() => {
    if (!eventData) return;
    if (eventData.ticketType === "free") {
      setSelectedPackageId("");
    } else if (Array.isArray(eventData.ticketPackages) && eventData.ticketPackages.length > 0) {
      setSelectedPackageId(eventData.ticketPackages[0]._id || "");
    } else {
      setSelectedPackageId("");
    }
  }, [eventData]);

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
  }, [selectedPackageId, eventData?.ticketType]);

  useEffect(() => {
    if (!quantity) {
      setTotalAmount(0);
      return;
    }

    const selectedPackage = eventData.ticketPackages?.find((pkg) => pkg._id === selectedPackageId);
    const price = selectedPackage ? selectedPackage.price : 0;
    setTotalAmount(price * quantity);
  }, [quantity, eventData, selectedPackageId]);

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
    const selectedPackage = eventData.ticketPackages?.find((pkg) => pkg._id === selectedPackageId);

    if (eventData.ticketType === "free") {
      if (!quantity || quantity <= 0) {
        errs.quantity = "Enter ticket quantity";
      } else if (quantity > eventData.freeTicketsRemaining) {
        errs.quantity = `Only ${eventData.freeTicketsRemaining} ticket(s) remaining`;
      }
    } else {
      if (!selectedPackageId) {
        errs.ticketType = "Please select a ticket package.";
      } else if (!selectedPackage) {
        errs.ticketType = "Please select a valid ticket package.";
      }

      const remainingPackageSeats = selectedPackage?.slots != null ? selectedPackage.slots - (selectedPackage.ticketsSold || 0) : Infinity;
      const minQuantity = selectedPackage?.minQuantity || 1;
      const maxQuantity = selectedPackage?.maxPerUser || remainingPackageSeats;

      if (!quantity || quantity <= 0) {
        errs.quantity = "Enter ticket quantity";
      } else if (quantity < minQuantity) {
        errs.quantity = `Minimum quantity for this package is ${minQuantity}`;
      } else if (quantity > maxQuantity) {
        errs.quantity = selectedPackage?.slots != null
          ? `Only ${remainingPackageSeats} ticket(s) remaining for this package`
          : `Maximum quantity per user is ${selectedPackage?.maxPerUser || remainingPackageSeats}`;
      }

      if (selectedPackage && selectedPackage.slots != null && remainingPackageSeats <= 0) {
        errs.ticketType = "Selected package is sold out.";
      }
    }

    if (!clientName) errs.clientName = "Enter your name";

    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";

    const formatted = formatPhoneNumber(phone);
    if (!phone) errs.phone = "Phone is required";
    else if (!/^(254\d{9})$/.test(formatted)) errs.phone = "Invalid phone number";

    const totalAmountIsPositive = totalAmount > 0;
    if (totalAmountIsPositive && !paymentOption) {
      errs.paymentOption = "Choose payment method";
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

      const selectedPackage = eventData.ticketPackages?.find((pkg) => pkg._id === selectedPackageId);
      const purchaseData = {
        ticketType: eventData.ticketType === "free" ? "Free" : selectedPackage?.name || "",
        quantity: parseInt(quantity),
        clientName: clientName.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        paymentOption: totalAmount > 0 ? paymentOption : null,
        eventId: eventData._id,
        creatorId: eventData.userId,
        eventTitle: eventData.title,
        eventVenue: eventData.venue,
        eventDate: eventData.date,
        from: eventData.startTime,
        to: eventData.endTime,
        ticketPackageId: selectedPackage ? selectedPackageId : null,
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

  const selectedPackage = eventData.ticketPackages?.find((pkg) => pkg._id === selectedPackageId);
  const maxTickets = selectedPackage
    ? selectedPackage.slots != null
      ? selectedPackage.slots - (selectedPackage.ticketsSold || 0)
      : Infinity
    : eventData.ticketType === "free"
    ? eventData.freeTicketsRemaining
    : 0;

  const isSelectedSoldOut = selectedPackage
    ? selectedPackage.slots != null
      ? selectedPackage.slots - (selectedPackage.ticketsSold || 0) <= 0
      : false
    : eventData.ticketType === "free"
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

        {isSelectedSoldOut && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The selected ticket package is sold out.
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
          {eventData.ticketType !== "free" && (
            eventData.ticketPackages?.length > 0 ? (
              <TextField
                select
                label="Ticket Package"
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                error={!!errors.ticketType}
                helperText={errors.ticketType}
              >
                <MenuItem value="">Select a package</MenuItem>
                {eventData.ticketPackages.map((pkg) => {
                  const remaining = pkg.slots != null ? pkg.slots - (pkg.ticketsSold || 0) : Infinity;
                  return (
                    <MenuItem key={pkg._id} value={pkg._id} disabled={pkg.slots != null && remaining <= 0}>
                      {pkg.name} — Ksh.{pkg.price} {pkg.slots != null ? `(${remaining} left)` : ''}
                    </MenuItem>
                  );
                })}
              </TextField>
            ) : (
              <Alert severity="warning">This paid event has no ticket packages available.</Alert>
            )
          )}

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);

              if (!value) return setQuantity("");

              const minAllowed = selectedPackage?.minQuantity || 1;
              const maxAllowed = selectedPackage?.maxPerUser || maxTickets;

              if (value > maxAllowed) setQuantity(maxAllowed);
              else if (value < minAllowed) setQuantity(minAllowed);
              else setQuantity(value);
            }}
            inputProps={{ min: selectedPackage?.minQuantity || 1, max: selectedPackage?.maxPerUser || maxTickets }}
            error={!!errors.quantity}
            helperText={errors.quantity || (selectedPackage?.minQuantity ? `Min ${selectedPackage.minQuantity}` : '')}
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
            (eventData.ticketType !== "free" && !selectedPackageId) ||
            isSelectedSoldOut ||
            !quantity ||
            quantity <= 0 ||
            quantity > (selectedPackage?.maxPerUser || maxTickets) ||
            (selectedPackage?.minQuantity && quantity < selectedPackage.minQuantity)
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