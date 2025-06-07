import { useEffect } from 'react';
import axios from 'axios';

const usePaymentPolling = ({
  transactionId,
  type = 'booking',
  onSuccess,
  onFailure,
  onTimeout,
  pollingInterval = 15000,
  timeoutLimit = 90000,
  pollingKey,
}) => {
  useEffect(() => {
    if (!transactionId) return;

    let attempts = 0;
    const maxAttempts = Math.floor(timeoutLimit / pollingInterval);
    const startTime = Date.now();

    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`/api/${type === 'booking' ? 'venue_bookings' : 'ticket_purchases'}/status/${transactionId}`);
        const { status, mpesaCode, failureReason, checkoutRequestId } = res.data;

        if (status === 'success') {
          clearInterval(poll);
          onSuccess(mpesaCode);
        } else if (status === 'failed') {
          clearInterval(poll);
          onFailure(failureReason);
        } else if (++attempts >= maxAttempts || Date.now() - startTime > timeoutLimit) {
          clearInterval(poll);
            await axios.post(`/api/mpesa/query`, {
              type,
              checkoutRequestId,
              purchaseId: type === 'ticket' ? transactionId : undefined,
              bookingId: type === 'booking' ? transactionId : undefined,
              });
          onTimeout();
          return;
        }
      } catch (err) {
        console.error('Polling error:', err);
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
