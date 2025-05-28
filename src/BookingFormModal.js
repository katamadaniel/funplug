import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './BookingFormModal.css';

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL, { autoConnect: false });

const BookingFormModal = ({ venue, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
  });
  const [duration, setDuration] = useState(0);
  const [total, setTotal] = useState(venue.charges);
  const [reservationFee, setReservationFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [lastBookingId, setLastBookingId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleSocketUpdate = ({ id, status, reason, mpesaCode }) => {
      if (id !== lastBookingId) return;

      if (status === 'Success') {
        setBookingStatus('success');
        if (mpesaCode) setConfirmationCode(mpesaCode);
        setSuccessMessage('Booking confirmed! Confirmation sent to your email.');
        setTimeout(() => onClose(), 10000);
      } else if (status === 'Failed') {
        setBookingStatus('failed');
        setErrors({ general: reason || 'Payment failed.' });
      }
      setLoading(false);
    };

    socket.on('bookingPaymentUpdate', handleSocketUpdate);
    return () => socket.off('bookingPaymentUpdate', handleSocketUpdate);
  }, [lastBookingId, onClose]);

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
        setErrors(prev => ({ ...prev, endTime: 'End time must be after start time.' }));
      }
    }
  }, [form.startTime, form.endTime]);

  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('0') ? `254${digits.slice(1)}` :
           digits.startsWith('254') ? digits : `254${digits}`;
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name) errs.name = 'Enter your name';
    if (!form.phone) errs.phone = 'Enter your phone number';
    else if (!/^254\d{9}$/.test(formatPhone(form.phone))) errs.phone = 'Invalid phone number';
    if (!form.email) errs.email = 'Enter your email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.bookingDate) errs.bookingDate = 'Select a date';
    if (!form.startTime) errs.startTime = 'Select a start time';
    if (!form.endTime) errs.endTime = 'Select an end time';
    if (!paymentMethod) errs.paymentMethod = 'Select a payment method';
    return errs;
  };

  const handleInputChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleBookVenue = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setSuccessMessage('');
    setBookingStatus(null);
    setConfirmationCode('');

    try {
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
      setBookingStatus('pending');

      // Poll for status every 20s for up to 2 minutes
      let attempts = 0;
      const maxAttempts = 8;
      const pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/api/venue_bookings/status/${booking._id}`);
          const { status, confirmationCode, failureReason } = res.data;

          if (status === 'success') {
            clearInterval(pollInterval);
            setBookingStatus('success');
            if (confirmationCode) setConfirmationCode(confirmationCode);
            setSuccessMessage('Booking confirmed! Confirmation sent to your email.');
            setTimeout(() => onClose(), 10000);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setBookingStatus('failed');
            setErrors({ general: failureReason || 'Payment failed.' });
          } else if (++attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setErrors({ general: 'Payment timeout. Try again.' });
            setBookingStatus('failed');
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 15000);
    } catch (err) {
      console.error('Booking error:', err);
      setErrors({ general: err?.response?.data?.message || 'Booking failed.' });
      setBookingStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!lastBookingId || !checkoutRequestId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/mpesa/query`, {
        bookingId: lastBookingId,
        checkoutRequestId,
      });

      if (res.data.status === 'Success') {
        setBookingStatus('success');
        setConfirmationCode(res.data.mpesaCode);
        setSuccessMessage('Booking confirmed! Confirmation sent to your email.');
        setTimeout(() => onClose(), 10000);
      } else {
        setBookingStatus('failed');
        setErrors({ general: 'Payment still not completed.' });
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setErrors({ general: err.response?.data?.message || 'Retry failed.' });
      setBookingStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Book {venue.name}</h2>

        {errors.general && <p className="error">{errors.general}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        {['name', 'phone', 'email', 'bookingDate', 'startTime', 'endTime'].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.replace(/([A-Z])/g, ' $1')}:</label>
            <input
              type={field.includes('Time') ? 'time' : field === 'bookingDate' ? 'date' : 'text'}
              value={form[field]}
              onChange={handleInputChange(field)}
            />
            {errors[field] && <p className="error">{errors[field]}</p>}
          </div>
        ))}

        <div className="form-group">
          <label>Duration (hours):</label>
          <input type="number" value={duration} readOnly />
        </div>

        <div className="form-group">
          <label>Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="mpesa">M-Pesa</option>
            <option value="card" disabled>Debit Card (coming soon)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Total (Ksh):</label>
          <input type="number" value={total} readOnly />
        </div>

        <div className="form-group">
          <label>Reservation Fee:</label>
          <input type="number" value={reservationFee} readOnly />
        </div>

        <button className="venue-booking-button" onClick={handleBookVenue} disabled={loading}>
          {loading ? 'Processing...' : 'Book Venue'}
        </button>

        {bookingStatus === 'pending' && (
          <div className="booking-status pending blink">Waiting for M-Pesa confirmation...</div>
        )}
        {bookingStatus === 'success' && (
          <div className="purchase-status success fade-in">
            <FaCheckCircle /> Booking Successful!
            {confirmationCode && (
              <div className="confirmation-code">
                M-Pesa Code: <strong>{confirmationCode}</strong>
              </div>
            )}
          </div>
        )}
        {bookingStatus === 'failed' && (
          <div className="purchase-status error fade-in">
            <FaTimesCircle /> Payment Failed. Please try again.
            <button onClick={handleRetry} className="retry-button">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;
