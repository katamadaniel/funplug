// LandingPage.js
import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// import Carousel from './Carousel';
import UserProfileCarousel from './UserProfileCarousel';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import Card from './Card';
import { events, users } from './data';
import './Home.css';


const Home = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setTicketModalOpen(false);
  };

  const handleBuyTicket = () => {
    setTicketModalOpen(true);
  };

  return (
      <div className="landing-page">

        <h3>User Profiles</h3>
        <UserProfileCarousel users={users} />
        <h3>Trending upcoming Events</h3>
        <div className="events">
          {events.map((event, index) => (
            <Card 
              key={index}
              title={event.title}
              image={event.image}
              description={event.description} 
              event={event} 
              onViewDetails={() => handleViewDetails(event)} />
          ))}
        </div>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={handleCloseModal} 
            onBuyTicket={handleBuyTicket} 
          />
        )}
        {isTicketModalOpen && selectedEvent && (
          <TicketPurchase 
            event={selectedEvent} 
            onClose={handleCloseModal} 
          />
        )}
      </div>
  );
};
export default Home;
