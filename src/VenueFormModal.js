import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './VenueFormModal.css';

const defaultVenue = {
  name: '',
  location: '',
  size: '',
  capacity: '',
  bookingStatus: '',
  bookingDuration: '',
  charges: '',
  images: [],
};

const VenueFormModal = ({ isOpen, onRequestClose, onSubmit, initialVenue }) => {
  const [venue, setVenue] = useState(defaultVenue);

  useEffect(() => {
    setVenue(initialVenue || defaultVenue);
  }, [initialVenue]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVenue({ ...venue, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setVenue({ ...venue, images: files });
  };

  const validateForm = () => {
    const { name, location, size, capacity, bookingStatus, bookingDuration, charges } = venue;
    return name && location && size && capacity && bookingStatus && bookingDuration && charges;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(venue);
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <form onSubmit={handleSubmit} className="venue-form">
        <h2>{initialVenue ? 'Edit Venue' : 'Add Venue'}</h2>
        <input type="text" name="name" placeholder="Name" value={venue.name} onChange={handleInputChange} />
        <input type="text" name="location" placeholder="Location" value={venue.location} onChange={handleInputChange} />
        <input type="text" name="size" placeholder="Size" value={venue.size} onChange={handleInputChange} />
        <input type="number" name="capacity" placeholder="Capacity" value={venue.capacity} onChange={handleInputChange} />
        <select name="bookingStatus" value={venue.bookingStatus} onChange={handleInputChange}>
          <option value="">Select Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <input type="text" name="bookingDuration" placeholder="Booking Duration" value={venue.bookingDuration} onChange={handleInputChange} />
        <input type="number" name="charges" placeholder="Charges per hour" value={venue.charges} onChange={handleInputChange} />
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <div className="button-container">
          <button type="submit">Save</button>
          <button type="button" onClick={onRequestClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default VenueFormModal;
