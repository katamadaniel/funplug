import React from 'react';
import Modal from 'react-modal';
import ImageGallery from 'react-image-gallery';
import Avatar from '@mui/material/Avatar';
import 'react-image-gallery/styles/css/image-gallery.css';
import './VenueDetailsModal.css';

const DEFAULT_AVATAR_URL = '/default-avatar.png';

const VenueDetailsModal = ({ venue, user, onClose, onBookVenue }) => {
  const avatarSrc = user && user.avatar ? `http://localhost:5000${user.avatar}` : DEFAULT_AVATAR_URL;

  return (
    <Modal isOpen={!!venue} onRequestClose={onClose} className="venue-details-modal">
      {venue && (
        <>
          <button className="close-button" onClick={onClose}>X</button>
          <div className="modal-header">
          <Avatar
            src={avatarSrc}
            alt={user ? user.username : 'Unknown User'}
            sx={{ width: 60, height: 60, marginRight: '10px' }}
            className="creator-image"
          />
            <span className="creator-name">{user ? user.username : 'Unknown User'}</span>
          </div>
          <h2>{venue.name}</h2>
          <p>{venue.location}</p>
          <ImageGallery items={venue.images.map((img) => ({ original: `http://localhost:5000/uploads/venues/${img}` }))} />
          <p><strong>Size:</strong> {venue.size} square ft.</p>
          <p><strong>Capacity:</strong> {venue.capacity} people</p>
          <p><strong>Status:</strong> {venue.bookingStatus}</p>
          <p><strong>Duration:</strong> {venue.bookingDuration} hours</p>
          <p><strong>Charges:</strong> Ksh.{venue.charges}/hour</p>
          <button onClick={onBookVenue}>Book Venue</button>
        </>
      )}
    </Modal>
  );
};

export default VenueDetailsModal;
