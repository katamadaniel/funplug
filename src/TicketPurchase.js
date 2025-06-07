import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import usePaymentPolling from './hooks/usePaymentPolling';
import './TicketPurchase.css';

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const TicketPurchase = ({ event, onClose }) => {
  const [ticketType, setTicketType] = useState(event.ticketType === 'free' ? 'Free' : '');
  const [quantity, setQuantity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentOption, setPaymentOption] = useState('mpesa');
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [lastPurchaseId, setLastPurchaseId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [pollingKey, setPollingKey] = useState(0);

      useEffect(() => {
      if (!socket.connected) socket.connect();
  
      const handleSocketUpdate = ({ id, status, reason, mpesaCode }) => {
        if (id !== lastPurchaseId) return;
  
        if (status === 'Success') {
          setPurchaseStatus('success');
          if (mpesaCode) setConfirmationCode(mpesaCode);
          setSuccessMessage('Ticket purchase confirmed! Confirmation sent to your email.');
          setTimeout(() => onClose(), 10000);
        } else if (status === 'Failed') {
          setPurchaseStatus('failed');
          setErrors({ general: reason || 'Payment failed.' });
        }
        setLoading(false);
      };
  
      socket.on('ticketPaymentUpdate', handleSocketUpdate);
      return () => socket.off('ticketPaymentUpdate', handleSocketUpdate);
    }, [lastPurchaseId, onClose]);

  useEffect(() => {
    if (ticketType && quantity && event.ticketType !== 'free') {
      const price =
        ticketType === 'Regular' ? event.regularPrice :
        ticketType === 'VIP' ? event.vipPrice :
        event.vvipPrice;
      setTotalAmount(price * quantity);
    } else {
      setTotalAmount(0);
    }
  }, [ticketType, quantity, event]);

  const formatPhoneNumber = (input) => {
    const clean = input.replace(/\D/g, '');
    return clean.startsWith('0') ? `254${clean.slice(1)}` :
           clean.startsWith('254') ? clean : `254${clean}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!ticketType) newErrors.ticketType = 'Please select a ticket type';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Please select the number of tickets';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    const formatted = formatPhoneNumber(phone);
    if (!phone) newErrors.phone = 'Phone is required';
    else if (!/^(254\d{9})$/.test(formatted)) newErrors.phone = 'Please enter a valid 10-digit phone number';
    if (event.ticketType !== 'free' && !paymentOption) newErrors.paymentOption = 'Payment option is required';
    return newErrors;
  };

  const handleBuyTicket = async () => {
    const formattedPhone = formatPhoneNumber(phone);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setPurchaseStatus(null);
    setSuccessMessage('');
    setConfirmationCode('');

    try {
      const purchaseData = {
        ticketType,
        quantity,
        email,
        phone: formattedPhone,
        paymentOption: event.ticketType === 'free' ? 'free' : paymentOption,
        totalAmount: event.ticketType === 'free' ? 0 : totalAmount,
        eventId: event._id,
        creatorId: event.userId,
        eventTitle: event.title,
      };

      const response = await axios.post(`${API_URL}/api/ticket_purchases`, purchaseData);

      if (event.ticketType === 'free' || totalAmount === 0) {
        setPurchaseStatus('success');
        setTimeout(() => onClose(), 10000);
      } else {
        const { purchase, checkoutRequestId } = response.data;
        setLastPurchaseId(purchase._id);
        setCheckoutRequestId(checkoutRequestId);
        setPurchaseStatus('pending');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error.message);
      setPurchaseStatus('failed');
      setErrors({ general: error?.response?.data?.message || error.message || 'Error processing purchase.' });
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
  type: 'booking',
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
      if (res.data.status === 'Success') {
        setPurchaseStatus('success');
        if (res.data.mpesaCode) setConfirmationCode(res.data.mpesaCode);
        setSuccessMessage('Ticket purchase confirmed! Confirmation sent to your email.');
        setTimeout(() => onClose(), 10000);
      } else {
        setPurchaseStatus('failed');
        setErrors({ general: 'Payment still not completed.' });
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setErrors({ general: err.response?.data?.message || 'Retry failed.' });
      setPurchaseStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Buy {event.title} tickets</h2>
        {errors.general && typeof errors.general === 'string' && (
          <p className="error">{errors.general}</p>
        )}
        {successMessage && <p className="success">{successMessage}</p>}

        <div className="form-group">
          <label>Ticket Type:</label>
          <select 
            value={ticketType} 
            onChange={(e) => setTicketType(e.target.value)} 
            disabled={event.ticketType === 'free' || (
              event.regularTicketsRemaining <= 0 &&
              event.vipTicketsRemaining <= 0 &&
              event.vvipTicketsRemaining <= 0
            )}
          >
            <option value="">Select Ticket Type</option>
            {event.ticketType === 'free' && event.freeTicketsRemaining > 0 && (
              <option value="Free">Free</option>
            )}
            {event.ticketType !== 'free' && (
              <>
                {event.regularTicketsRemaining > 0 && (
                  <option value="Regular">Regular - Ksh.{event.regularPrice}</option>
                )}
                {event.vipTicketsRemaining > 0 && (
                  <option value="VIP">VIP - Ksh.{event.vipPrice}</option>
                )}
                {event.vvipTicketsRemaining > 0 && (
                  <option value="VVIP">VVIP - Ksh.{event.vvipPrice}</option>
                )}
              </>
            )}
          </select>
          {errors.ticketType && <p className="error">{errors.ticketType}</p>}
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            min="1"
            max={
              ticketType === 'Regular' ? event.regularTicketsRemaining :
              ticketType === 'VIP' ? event.vipTicketsRemaining :
              ticketType === 'VVIP' ? event.vvipTicketsRemaining :
              event.freeTicketsRemaining
            }
          />
          {errors.quantity && <p className="error">{errors.quantity}</p>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="07xxxxxxxx" 
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        {event.ticketType !== 'free' && (
          <div className="form-group">
            <label>Payment Option:</label>
            <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)}>
              <option value="">Select Payment Option</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card" disabled>Debit Card (Coming soon)</option>
            </select>
            {errors.paymentOption && <p className="error">{errors.paymentOption}</p>}
          </div>
        )}

        <div className="total-amount">
          <label>Total Amount:</label> <span>Ksh.{totalAmount.toFixed(2)}</span>
        </div>

        <button 
          className="buy-ticket-button" 
          onClick={handleBuyTicket} 
          disabled={loading || (
            event.ticketType === 'free' ? event.freeTicketsRemaining <= 0 :
            event.regularTicketsRemaining <= 0 &&
            event.vipTicketsRemaining <= 0 &&
            event.vvipTicketsRemaining <= 0
          )}
        >
          {loading ? 'Processing...' : event.ticketType === 'free' ? 'Get Free Ticket' : 'Buy Ticket'}
        </button>

        {purchaseStatus === 'pending' && (
          <div className="purchase-status pending blink">
            Waiting for payment confirmation via M-Pesa...
          </div>
        )}
        {purchaseStatus === 'success' && (
          <div className="purchase-status success fade-in">
            <FaCheckCircle /> Ticket Purchase Successful!
            {confirmationCode && (
              <div className="confirmation-code">Confirmation Code: <strong>{confirmationCode}</strong></div>
            )}
          </div>
        )}
        {purchaseStatus === 'failed' && (
          <div className="purchase-status error fade-in">
            <FaTimesCircle /> Payment Failed or Timed Out.
            <button onClick={handleRetry} className="retry-button">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;
