import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingFormModal.css';

const API_URL = process.env.REACT_APP_API_URL;

const BookingFormModal = ({ venue, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState(''); 
  const [endTime, setEndTime] = useState(''); 
  const [duration, setDuration] = useState(0); 
  const [total, setTotal] = useState(venue.charges); 
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 0) {
        setDuration(hours);
        setTotal(hours * venue.charges);
      } else {
        setDuration(0);
        setTotal(0);
        setError('End time must be after start time.');
      }
    }
  }, [startTime, endTime, venue.charges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !bookingDate || !startTime || !endTime || duration <= 0) {
      setError('Please fill in all fields correctly.');
      return;
    }

    const bookingData = {
      name,
      phone,
      email,
      bookingDate,
      startTime,
      endTime,
      duration,
      total,
      venueId: venue._id,
      creatorId: venue.userId,
      venueTitle: venue.name,
    };

    try {
      const response = await axios.post(`${API_URL}/api/venue_bookings`, bookingData);

      if (response.data.available) {
        setSuccessMessage('Booking successful!');
        setError('');
        // Clear form fields
        setName('');
        setPhone('');
        setEmail('');
        setBookingDate('');
        setStartTime('');
        setEndTime('');
        setDuration(0);
        setTotal(venue.charges);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError(error.response.data.message || 'This time slot is already booked.');
      } else {
        console.error('Error booking venue:', error.message);
        setError('Booking failed. Please try again.');
      }
      setSuccessMessage('');
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <button className="close-button" onClick={onClose}>X</button>
      <h2>Book {venue.name}</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            placeholder="Your number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bookingDate">Booking Date</label>
          <input
            type="date"
            id="bookingDate"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (hours)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="total">Total (Ksh)</label>
          <input
            type="number"
            id="total"
            value={total}
            readOnly
          />
        </div>
        <button type="submit">Book Venue</button>
      </form>
      </div>
      </div>
  );
};

export default BookingFormModal;
