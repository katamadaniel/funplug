import { useEffect } from "react";
import axios from "axios";

const usePaymentPolling = ({
  transactionId,
  type,               // "ticket" | "venue" | "service" | "performance"
  onSuccess,
  onFailure,
  onTimeout,
  pollingInterval = 15000,
  timeoutLimit = 90000,
  pollingKey,
}) => {
  useEffect(() => {
    if (!transactionId || !type) return;

    let attempts = 0;
    const maxAttempts = Math.floor(timeoutLimit / pollingInterval);
    const startTime = Date.now();
    let hasTriggeredQuery = false;

    // Map type → status endpoint
    const STATUS_ENDPOINTS = {
      ticket: `/api/ticket_purchases/status/${transactionId}`,
      venue: `/api/venue_bookings/status/${transactionId}`,
      performance: `/api/performance_bookings/status/${transactionId}`,
      service: `/api/service_bookings/status/${transactionId}`,
    };

    const poll = setInterval(async () => {
      try {
        const res = await axios.get(STATUS_ENDPOINTS[type]);

        const {
          status,
          mpesaCode,
          reason,
          checkoutRequestId,
        } = res.data;

        // --------------------------------
        // SUCCESS
        // --------------------------------
        if (status === "success") {
          clearInterval(poll);
          onSuccess(mpesaCode);
          return;
        }

        // --------------------------------
        // FAILURE
        // --------------------------------
        if (status === "failed") {
          clearInterval(poll);
          onFailure(reason);
          return;
        }

        // --------------------------------
        // TIMEOUT → TRIGGER FALLBACK QUERY
        // --------------------------------
        const timedOut =
          ++attempts >= maxAttempts ||
          Date.now() - startTime >= timeoutLimit;

        if (timedOut && !hasTriggeredQuery) {
          hasTriggeredQuery = true;
          clearInterval(poll);

          // Ensure we have a checkoutRequestId
          if (checkoutRequestId) {
            await axios.post(`/api/mpesa/query`, {
              checkoutRequestId,
            });
          }

          onTimeout();
        }
      } catch (err) {
        console.error("Payment polling error:", err);
      }
    }, pollingInterval);

    return () => clearInterval(poll);
  }, [
    transactionId,
    type,
    pollingInterval,
    timeoutLimit,
    onSuccess,
    onFailure,
    onTimeout,
    pollingKey,
  ]);
};

export default usePaymentPolling;
