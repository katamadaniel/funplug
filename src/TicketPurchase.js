import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './TicketPurchase.css';

const TicketPurchase = ({ event, onClose }) => {
  const [ticketType, setTicketType] = useState(event.ticketType === 'free' ? 'Free' : '');
  const [quantity, setQuantity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  useEffect(() => {
    if (ticketType && quantity && event.ticketType !== 'free') {
      const selectedTicketPrice = 
        ticketType === 'Regular' ? event.regularPrice : 
        ticketType === 'VIP' ? event.vipPrice : 
        event.vvipPrice;
      setTotalAmount(selectedTicketPrice * quantity);
    } else {
      setTotalAmount(0);
    }
  }, [ticketType, quantity, event]);

  const validateForm = () => {
    const newErrors = {};
    if (!ticketType) newErrors.ticketType = 'Ticket type is required';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Quantity is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (event.ticketType !== 'free' && !paymentOption) {
      newErrors.paymentOption = 'Payment option is required';
    }
    return newErrors;
  };

  const handleBuyTicket = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setPurchaseStatus(null);

    try {
      const purchaseData = {
        ticketType,
        quantity,
        email,
        phone,
        paymentOption: event.ticketType === 'free' ? 'free' : paymentOption,
        totalAmount: event.ticketType === 'free' ? 0 : totalAmount,
        eventId: event._id,
        creatorId: event.userId,
        eventTitle: event.title,
      };
      
      await axios.post('http://localhost:5000/api/ticket_purchases', purchaseData);
      setPurchaseStatus('success');
    } catch (error) {
      console.error('Error purchasing ticket:', error.message);
      setPurchaseStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Purchase Tickets for {event.title}</h2>
        <div className="form-group">
          <label>Ticket Type:</label>
          <select 
            value={ticketType} 
            onChange={(e) => setTicketType(e.target.value)} 
            disabled={
              event.ticketType === 'free' || 
              (event.regularTicketsRemaining <= 0 && event.vipTicketsRemaining <= 0 && event.vvipTicketsRemaining <= 0)
            }
          >
            <option value="">Select Ticket Type</option>
            {event.ticketType === 'free' ? (
              <option value="Free" disabled={event.freeTicketsRemaining <= 0}>
                Free {event.freeTicketsRemaining <= 0 && '(Sold Out)'}
              </option>
            ) : (
              <>
                <option value="Regular" disabled={event.regularTicketsRemaining <= 0}>
                  Regular - Ksh.{event.regularPrice} {event.regularTicketsRemaining <= 0 && '(Sold Out)'}
                </option>
                <option value="VIP" disabled={event.vipTicketsRemaining <= 0}>
                  VIP - Ksh.{event.vipPrice} {event.vipTicketsRemaining <= 0 && '(Sold Out)'}
                </option>
                <option value="VVIP" disabled={event.vvipTicketsRemaining <= 0}>
                  VVIP - Ksh.{event.vvipPrice} {event.vvipTicketsRemaining <= 0 && '(Sold Out)'}
                </option>
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
            max={event.ticketType === 'free' ? event.freeTicketsRemaining : 100}
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
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>
        {event.ticketType !== 'free' && (
          <div className="form-group">
            <label>Payment Option:</label>
            <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)}>
              <option value="">Select Payment Option</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card">Debit Card</option>
            </select>
            {errors.paymentOption && <p className="error">{errors.paymentOption}</p>}
          </div>
        )}
        <div className="total-amount">
          <label>Total Amount: </label>
          <span>Ksh.{totalAmount.toFixed(2)}</span>
        </div>
        <button 
          className="buy-ticket-button" 
          onClick={handleBuyTicket} 
          disabled={
            event.ticketType === 'free' ? event.freeTicketsRemaining <= 0 : 
            (event.regularTicketsRemaining <= 0 && event.vipTicketsRemaining <= 0 && event.vvipTicketsRemaining <= 0)
          }
        >
          {event.ticketType === 'free' ? 'Get Free Ticket' : 'Buy Ticket'}
        </button>
        {loading && <div className="loader">Processing...</div>}
        {purchaseStatus === 'success' && (
          <div className="purchase-status success">
            <FaCheckCircle /> {event.ticketType === 'free' ? 'Ticket Reserved Successfully!' : 'Purchase Successful!'}
          </div>
        )}
        {purchaseStatus === 'failed' && (
          <div className="purchase-status error">
            <FaTimesCircle /> {event.ticketType === 'free' ? 'Reservation Failed. Please try again.' : 'Purchase Failed. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;
