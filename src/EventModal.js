// EventModal.js
import React from 'react';
import './EventModal.css';

const EventModal = ({ event, onClose, onBuyTicket }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <div className="modal-header">
          <img src={event.creatorImage} alt={event.creatorName} className="creator-image" />
          <span className="creator-name">{event.creatorName}</span>
        </div>
        <h2>{event.title}</h2>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <div className="ticket-selection">
          <h3>Tickets</h3>
          {event.tickets.map(ticket => (
            <div key={ticket.type} className="ticket-option">
              <span>{ticket.type}</span>
              <span>${ticket.price}</span>
            </div>
          ))}
        </div>
        <button className="buy-ticket-button" onClick={onBuyTicket}>Buy Ticket</button>
      </div>
    </div>
  );
};

export default EventModal;
