// TicketPurchase.js
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './TicketPurchase.css';

const TicketPurchase = ({ event, onClose }) => {
  const [ticketType, setTicketType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [email, setEmail] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  useEffect(() => {
    if (ticketType && quantity) {
      const selectedTicket = event.tickets.find(ticket => ticket.type === ticketType);
      setTotalAmount(selectedTicket ? selectedTicket.price * quantity : 0);
    } else {
      setTotalAmount(0);
    }
  }, [ticketType, quantity, event.tickets]);

  const validateForm = () => {
    const newErrors = {};
    if (!ticketType) newErrors.ticketType = 'Ticket type is required';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Quantity is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!paymentOption) newErrors.paymentOption = 'Payment option is required';
    return newErrors;
  };

  const handleBuyTicket = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setPurchaseStatus(null);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      const success = Math.random() > 0.2; // 80% chance of success
      setPurchaseStatus(success ? 'success' : 'failed');
      if (success) {
        alert('Payment successful! Confirmation sent to your email.');
      }
    }, 5000); // 5 seconds delay
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Purchase Tickets for {event.title}</h2>
        <div className="form-group">
          <label>Ticket Type:</label>
          <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
            <option value="">Select Ticket Type</option>
            {event.tickets.map(ticket => (
              <option key={ticket.type} value={ticket.type}>
                {ticket.type} - ${ticket.price}
              </option>
            ))}
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
          <label>Payment Option:</label>
          <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)}>
            <option value="">Select Payment Option</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Debit Card</option>
          </select>
          {errors.paymentOption && <p className="error">{errors.paymentOption}</p>}
        </div>
        <div className="total-amount">
          <label>Total Amount: </label>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <button className="buy-ticket-button" onClick={handleBuyTicket}>Buy Ticket</button>
        {loading && <div className="loader">Processing Payment...</div>}
        {purchaseStatus === 'success' && (
          <div className="purchase-status success">
            <FaCheckCircle /> Payment successful! Confirmation sent to your email.
          </div>
        )}
        {purchaseStatus === 'failed' && (
          <div className="purchase-status failed">
            <FaTimesCircle /> Payment failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;
