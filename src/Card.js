// Card.js
import React from 'react';
import './Card.css';

const Card = ({ event,title, image, description, onViewDetails }) => {
  return (
    <div className="card">
      <img src={event.image} alt={event.title} className="card-image" />
      <h3 className="event-title">{event.title}</h3>
      <p className="event-description">{event.description}</p>
      <button className="view-details-button" onClick={() => onViewDetails(event)}>
        View Details
      </button>
    </div>
  );
};

export default Card;
