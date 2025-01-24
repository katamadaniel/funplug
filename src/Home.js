import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCache } from './contexts/CacheContext';
import UserProfileCarousel from './UserProfileCarousel';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import VenueDetailsModal from './VenueDetailsModal';
import BookingFormModal from './BookingFormModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CircularProgress } from '@mui/material';
import './Home.css';

const EVENTS_API_URL = 'http://localhost:5000/api/events';
const USERS_API_URL = 'http://localhost:5000/api/users'; 
const VENUES_API_URL = 'http://localhost:5000/api/venues';

const DEFAULT_AVATAR_URL = '/default-avatar.png'; 

const ITEMS_PER_PAGE = 4;
const VENUES_PER_PAGE = 4;

const Home = () => {
  const { getFromCache, addToCache } = useCache();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isVenueModalOpen, setVenueModalOpen] = useState(false);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [currentEventPage, setCurrentEventPage] = useState(1);
  const [currentVenuePage, setCurrentVenuePage] = useState(1);
  const [animate, setAnimate] = useState('');
  const [loading, setLoading] = useState (true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check cache first
        const cachedUsers = getFromCache('users');
        const cachedEvents = getFromCache('events');
        const cachedVenues = getFromCache('venues');

        if (cachedUsers && cachedEvents && cachedVenues) {
          setUsers(cachedUsers);
          setEvents(cachedEvents);
          setVenues(cachedVenues);
          setLoading(false);
          return;
        }

        // Fetch data from APIs if not in cache
        const [usersResponse, eventsResponse, venuesResponse] = await Promise.all([
          axios.get(USERS_API_URL),
          axios.get(EVENTS_API_URL),
          axios.get(VENUES_API_URL),
        ]);

        const usersData = usersResponse.data;
        addToCache('users', usersData);
        setUsers(usersData);

        const validUserIds = new Set(usersData.map(user => user._id));
        const filteredEvents = eventsResponse.data
          .filter(event => validUserIds.has(event.userId) && new Date(event.date) >= new Date())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        addToCache('events', filteredEvents);
        setEvents(filteredEvents);

        const filteredVenues = venuesResponse.data.filter(venue => validUserIds.has(venue.userId));
        addToCache('venues', filteredVenues);
        setVenues(filteredVenues);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getFromCache, addToCache]);

  const handleViewDetails = (event) => {
    const user = users.find(user => user._id === event.userId);
    setSelectedEvent(event);
    setSelectedUser(user || { username: 'Unknown User', avatar: DEFAULT_AVATAR_URL });
  };

  const handleViewVenueDetails = (venue) => {
    const user = users.find(user => user._id === venue.userId);
    setSelectedVenue(venue);
    setSelectedUser(user || { username: 'Unknown User', avatar: DEFAULT_AVATAR_URL });
    setVenueModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setTicketModalOpen(false);
    setVenueModalOpen(false);
    setBookingModalOpen(false);
  };

  const handleBuyTicket = () => {
    setTicketModalOpen(true);
  };

  const handleBookVenue = () => {
    setBookingModalOpen(true);
  };

  const handleNextEventPage = () => {
    if (currentEventPage < Math.ceil(events.length / ITEMS_PER_PAGE)) {
      setAnimate('slide-in-right');
      setTimeout(() => {
        setCurrentEventPage(currentEventPage + 1);
        setAnimate('');
      }, 300);
    }
  };

  const handlePreviousEventPage = () => {
    if (currentEventPage > 1) {
      setAnimate('slide-in-left');
      setTimeout(() => {
        setCurrentEventPage(currentEventPage - 1);
        setAnimate('');
      }, 300);
    }
  };

  const handleNextVenuePage = () => {
    if (currentVenuePage < Math.ceil(venues.length / VENUES_PER_PAGE)) {
      setAnimate('slide-in-right');
      setTimeout(() => {
        setCurrentVenuePage(currentVenuePage + 1);
        setAnimate('');
      }, 300);
    }
  };

  const handlePreviousVenuePage = () => {
    if (currentVenuePage > 1) {
      setAnimate('slide-in-left');
      setTimeout(() => {
        setCurrentVenuePage(currentVenuePage - 1);
        setAnimate('');
      }, 300);
    }
  };

  const paginatedEvents = events.slice((currentEventPage - 1) * ITEMS_PER_PAGE, currentEventPage * ITEMS_PER_PAGE);
  const paginatedVenues = venues.slice((currentVenuePage - 1) * VENUES_PER_PAGE, currentVenuePage * VENUES_PER_PAGE);
  
  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="landing-page">
      <h3>User Profiles</h3>
      {users.length > 0 ? (
        <UserProfileCarousel users={users} />
      ) : (
        <p>No user profiles found.</p>
      )}
      <h3>Upcoming Events</h3>
      {events.length > 0 ? (
        <div className={`events ${animate}`}>
          {paginatedEvents.map((event) => (
            <div key={event._id} className="card">
              <img src={`http://localhost:5000/uploads/events/${event.image}`} alt={event.title} className="card-image" />
              <h3 className="event-title">{event.title}</h3>
              <div className="card-content">
                <p>{event.description}</p>
              </div>
              <button className="view-details-button" onClick={() => handleViewDetails(event)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming events found.</p>
      )}
      <div className="pagination">
        <button onClick={handlePreviousEventPage} disabled={currentEventPage === 1} className="pagination-icon">
          <ArrowBackIcon fontSize="large" />
        </button>
        <span className="page-number">Page {currentEventPage} of {Math.ceil(events.length / ITEMS_PER_PAGE)}</span>
        <button onClick={handleNextEventPage} disabled={currentEventPage === Math.ceil(events.length / ITEMS_PER_PAGE)} className="pagination-icon">
          <ArrowForwardIcon fontSize="large" />
        </button>
      </div>
      <h3>Available Venues</h3>
      {venues.length > 0 ? (
        <div className={`venues ${animate}`}>
          {paginatedVenues.map((venue) => (
            <div key={venue._id} className="venue-card">
              <img src={`http://localhost:5000/uploads/venues/${venue.images[0]}`} alt={venue.name} className="venue-image" />
              <div className="venue-info">
                <h3>{venue.name}</h3>
                <p>{venue.location}</p>
                <button onClick={() => handleViewVenueDetails(venue)}>Explore Venue</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No venues available.</p>
      )}
      <div className="pagination">
        <button onClick={handlePreviousVenuePage} disabled={currentVenuePage === 1} className="pagination-icon">
          <ArrowBackIcon fontSize="large" />
        </button>
        <span className="page-number">Page {currentVenuePage} of {Math.ceil(venues.length / VENUES_PER_PAGE)}</span>
        <button onClick={handleNextVenuePage} disabled={currentVenuePage === Math.ceil(venues.length / VENUES_PER_PAGE)} className="pagination-icon">
          <ArrowForwardIcon fontSize="large" />
        </button>
      </div>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          user={selectedUser}
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
      {isVenueModalOpen && selectedVenue && (
        <VenueDetailsModal
          venue={selectedVenue}
          user={selectedUser}
          onClose={handleCloseModal}
          onBookVenue={handleBookVenue}
        />
      )}
      {isBookingModalOpen && selectedVenue && (
        <BookingFormModal
          venue={selectedVenue}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Home;
