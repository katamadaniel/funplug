import React from 'react';
import Avatar from '@mui/material/Avatar';
import './EventModal.css';

const DEFAULT_AVATAR_URL = '/default-avatar.png';

const EventModal = ({ event, user, onClose, onBuyTicket }) => {
  const avatarSrc = user && user.avatar ? `http://localhost:5000${user.avatar}` : DEFAULT_AVATAR_URL;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
        <h2>{event.title}</h2>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Starts at:</strong> {event.startTime}</p>
        <p><strong>Ends at:</strong> {event.endTime}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <div className="ticket-selection">
          <h3>Tickets</h3>
          {event.regularPrice > 0 && (
            <div className="ticket-option">
              <span>Regular</span>
              <span>Ksh.{event.regularPrice}</span>
            </div>
          )}
          {event.vipPrice > 0 && (
            <div className="ticket-option">
              <span>VIP</span>
              <span>Ksh.{event.vipPrice}</span>
            </div>
          )}
          {event.vvipPrice > 0 && (
            <div className="ticket-option">
              <span>VVIP</span>
              <span>Ksh.{event.vvipPrice}</span>
            </div>
          )}
          {event.regularPrice === 0 && (
            <div className="ticket-option">
              <span>Regular</span>
              <span>Free</span>
            </div>
          )}
        </div>
        <button className="buy-ticket-button" onClick={onBuyTicket}>Buy Ticket</button>
      </div>
    </div>
  );
};

export default EventModal;
