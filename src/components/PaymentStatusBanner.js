import React from "react";
import { Alert, Stack, CircularProgress, Button } from "@mui/material";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PaymentStatusBanner = ({
  status,
  confirmationCode,
  onRetry
}) => {
  if (!status) return null;

  if (status === "pending") {
    return (
      <Alert severity="info" icon={false}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <span>Waiting for M-Pesa confirmation...</span>
        </Stack>
      </Alert>
    );
  }

  if (status === "success") {
    return (
      <Alert
        severity="success"
        icon={<FaCheckCircle />}
        sx={{ mt: 1 }}
      >
        Booking Successful!
        {confirmationCode && (
          <div>
            Confirmation Code: <strong>{confirmationCode}</strong>
          </div>
        )}
      </Alert>
    );
  }

  if (status === "failed") {
    return (
      <Alert
        severity="error"
        icon={<FaTimesCircle />}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Payment Failed. Please try again.
      </Alert>
    );
  }

  return null;
};

export default PaymentStatusBanner;
