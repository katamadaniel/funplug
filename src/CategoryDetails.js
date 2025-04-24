import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import CircularProgress from '@mui/material/CircularProgress';
import './CategoryDetails.css';

const API_URL = process.env.REACT_APP_API_URL;
const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

const EVENTS_API_URL = `${API_URL}/api/events`;
const USERS_API_URL = `${API_URL}/api/users`;
const DEFAULT_AVATAR_URL = process.env.REACT_APP_AVATAR_URL; 

const CategoryDetails = () => {
  const { category } = useParams();
  const [filteredUserIds, setFilteredUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTicketPurchaseOpen, setIsTicketPurchaseOpen] = useState(false);

  useEffect(() => {
    // Fetch all users and all events from the server
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(USERS_API_URL);
        setUsers(usersResponse.data);

        const eventsResponse = await axios.get(EVENTS_API_URL);

        // Filter users based on category and extract their IDs
        const filteredUsers = usersResponse.data.filter(user => user.category === category);
        const userIds = filteredUsers.map(user => user._id);
        setFilteredUserIds(userIds);

        // Get today's date for comparison
        const today = new Date().setHours(0, 0, 0, 0);

        // Filter events to include only upcoming events associated with the filtered user IDs
        const userUpcomingEvents = eventsResponse.data
          .filter(event => userIds.includes(event.userId) && new Date(event.date).getTime() >= today);

        setEvents(userUpcomingEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  // Show CircularProgress while loading
  if (loading) return <div className="loading-container"><CircularProgress /></div>;

  // Function to handle viewing event details
  const handleViewEventDetails = (event) => {
    const user = users.find(user => user._id === event.userId);
    setSelectedEvent(event);
    setSelectedUser(user || { username: 'Unknown User', avatar: DEFAULT_AVATAR_URL });
    setIsEventModalOpen(true);
  };

  // Function to handle opening the ticket purchase modal from the event modal
  const handleBuyTicket = () => {
    setIsEventModalOpen(false);
    setIsTicketPurchaseOpen(true); 
  };

  // Function to close the ticket purchase modal
  const handleCloseTicketPurchase = () => {
    setIsTicketPurchaseOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="events-container">
      {filteredUserIds.length > 0 && events.length > 0 ? (
        events.map(event => (
          <div key={event._id} className="event-card">
            <img
              src={event.image ? `${IMAGE_BASE_URL}/events/${event.image}` : '/default-event-image.png'}
              alt={event.title}
              className="event-image"
            />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.startTime}</p>
            <button 
              className="view-details-btn" onClick={() => handleViewEventDetails(event)}>
              View Details
            </button>
          </div>
        ))
      ) : (
        <p>No upcoming events found for users in this category.</p>
      )}

      {selectedEvent && isEventModalOpen && (
        <EventModal
          event={selectedEvent}
          user={selectedUser}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onBuyTicket={handleBuyTicket}
        />
      )}

      {selectedEvent && isTicketPurchaseOpen && (
        <TicketPurchase
          event={selectedEvent}
          isOpen={isTicketPurchaseOpen}
          onClose={handleCloseTicketPurchase}
        />
      )}
    </div>
  );
};

export default CategoryDetails;
