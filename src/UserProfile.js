import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import './UserProfile.css';

const DEFAULT_AVATAR_URL = '/default-avatar.png';

const UserProfile = () => {
  const { id } = useParams(); // user ID from the URL
  const [user, setUser] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the user's profile
        const userResponse = await axios.get(`http://localhost:5000/api/search/user/${id}`);
        setUser(userResponse.data.user);

        // Fetch all events
        const eventsResponse = await axios.get(`http://localhost:5000/api/events`);
        
        // Filter events by the current user's ID and sort by creation date
        const userEvents = eventsResponse.data
          .filter(event => event.userId === id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Separate events into upcoming and past events based on the current date
        const now = new Date();
        setUpcomingEvents(userEvents.filter(event => new Date(event.date) >= now));
        setPastEvents(userEvents.filter(event => new Date(event.date) < now));

      } catch (error) {
        console.error('Error fetching user profile or events:', error);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleViewEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setTicketModalOpen(false);
  };

  const handleBuyTicket = () => {
    setTicketModalOpen(true);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      {/* User Details Card */}
      <div className="user-details-card">
        <img 
          src={user.avatar ? `data:image/png;base64,${user.avatar}` : DEFAULT_AVATAR_URL}
          alt={`${user.username}'s avatar`} 
          className="avatar" 
        />
        <div className="user-info">
          <h2>{user.username}</h2>
          <p><strong>Category:</strong> {user.category}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <h2>Upcoming Events by {user.username}</h2>
      <div className="user-events upcoming-events">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <div key={event._id} className="user-event-card">
              <img src={`http://localhost:5000/uploads/${event.image}`} alt={event.title} className="event-image" />
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.startTime}</p>
              <button className="view-details-button" onClick={() => handleViewEventDetails(event)}>
                View Details
              </button>
            </div>
          ))
        ) : (
          <p>No upcoming events created by this user.</p>
        )}
      </div>

      {/* Past Events Section */}
      <h2>Past Events by {user.username}</h2>
      <div className="user-events past-events">
        {pastEvents.length > 0 ? (
          pastEvents.map(event => (
            <div key={event._id} className="user-event-card">
              <img src={`http://localhost:5000/uploads/${event.image}`} alt={event.title} className="event-image" />
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.startTime}</p>
            </div>
          ))
        ) : (
          <p>No past events created by this user.</p>
        )}
      </div>

      {/* Event Modal for viewing details */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          user={user}
          onClose={handleCloseModal}
          onBuyTicket={handleBuyTicket}
        />
      )}

      {/* Ticket Purchase Modal */}
      {isTicketModalOpen && selectedEvent && (
        <TicketPurchase
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserProfile;
