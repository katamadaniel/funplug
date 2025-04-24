import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { getAvatarUrl } from './utils/avatar';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import './UserProfile.css';

const API_URL = process.env.REACT_APP_API_URL;
const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isFollowFormOpen, setIsFollowFormOpen] = useState(false);
  const [followName, setFollowName] = useState('');
  const [followEmail, setFollowEmail] = useState('');
  const [followersCount, setFollowersCount] = useState(0);

  const handleFollowClick = () => {
    setIsFollowFormOpen(!isFollowFormOpen);
  };

  const handleFollowSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/follow/${id}`, { name: followName, email: followEmail });
      alert('Successfully followed!');
      setIsFollowFormOpen(false);
      setFollowName('');
      setFollowEmail('');
      fetchFollowersCount(); // refresh followers after following
    } catch (error) {
      console.error('Error following creator:', error);
      alert('Error following creator. Maybe already following?');
    }
  };

  const fetchFollowersCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/followers/count/${id}`);
      setFollowersCount(response.data.followerCount);
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/api/search/user/${id}`);
        setUser(userResponse.data.user);

        const eventsResponse = await axios.get(`${API_URL}/api/events`);
        const userEvents = eventsResponse.data
          .filter(event => event.userId === id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const now = new Date();
        setUpcomingEvents(userEvents.filter(event => new Date(event.date) >= now));
        setPastEvents(userEvents.filter(event => new Date(event.date) < now));

        fetchFollowersCount();
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
      <div className="user-details-card">
        <Avatar 
          src={getAvatarUrl(user)}
          alt={user ? `${user.username}'s avatar` : 'Unknown User'}
          sx={{
            width: { xs: 70, md: 100 },
            height: { xs: 70, md: 100 },
            mb: 2,
          }}
          onError={handleImageError}
        />
        <div className="follow-section">
          <h2>{user.username}</h2>
          <p className="followers-count">{followersCount} Followers</p>
          <button className="follow-button" onClick={handleFollowClick}>
            {isFollowFormOpen ? 'Cancel' : 'Follow'}
          </button>
        </div>

        {isFollowFormOpen && (
          <form className="follow-form" onSubmit={handleFollowSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={followName}
              onChange={(e) => setFollowName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={followEmail}
              onChange={(e) => setFollowEmail(e.target.value)}
              required
            />
            <button type="submit" className="submit-follow-button">Subscribe</button>
          </form>
        )}

        <div className="user-info">
          <p><strong>Category:</strong> {user.category}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <h2 className="events-heading">Upcoming Events by {user.username}</h2>
      <div className="user-events">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <div key={event._id} className="user-event-card">
              <img src={`${IMAGE_BASE_URL}/events/${event.image}`} alt={event.title} className="event-image" />
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

      {/* Past Events */}
      <h2 className="events-heading">Past Events by {user.username}</h2>
      <div className="user-events">
        {pastEvents.length > 0 ? (
          pastEvents.map(event => (
            <div key={event._id} className="user-event-card">
              <img src={`${IMAGE_BASE_URL}/events/${event.image}`} alt={event.title} className="event-image" />
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

      {/* Event Modal */}
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
