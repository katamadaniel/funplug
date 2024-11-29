import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';

const EVENTS_API_URL = 'http://localhost:5000/api/events';
const USERS_API_URL = 'http://localhost:5000/api/users';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [showTicketPurchase, setShowTicketPurchase] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await axios.get(`${EVENTS_API_URL}/${id}`);
        setEvent(eventResponse.data);

        const userResponse = await axios.get(`${USERS_API_URL}/${eventResponse.data.creatorId}`);
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to fetch event details. Please try again later.');
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleClose = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleBuyTicket = () => {
    setShowTicketPurchase(true);
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      {event && user ? (
        <EventModal
          event={event}
          user={user}
          onClose={handleClose}
          onBuyTicket={handleBuyTicket}
        />
      ) : (
        <p>Loading event details...</p>
      )}
      {showTicketPurchase && <TicketPurchase eventId={id} />}
    </>
  );
};

export default EventDetails;
