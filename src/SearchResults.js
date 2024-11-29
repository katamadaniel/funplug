import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import VenueDetailsModal from './VenueDetailsModal';
import BookingFormModal from './BookingFormModal';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearch } from './contexts/SearchContext';
import './SearchResults.css';

const USERS_API_URL = 'http://localhost:5000/api/users'; 
const DEFAULT_AVATAR_URL = '/default-avatar.png'; 

const SearchResults = ({ results, onViewProfile }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isVenueModalOpen, setVenueModalOpen] = useState(false);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // State for loading

  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(USERS_API_URL);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewEventDetails = (event) => {
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
    setSelectedVenue(null);
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

  const filteredResults = results.filter(result => {
    const query = searchQuery.toLowerCase();
    const userExists = result.userId ? users.some(user => user._id === result.userId) : true;

    if (result.type === 'event' && userExists) {
      return (
        (result.title.toLowerCase().includes(query) ||
         result.description.toLowerCase().includes(query) ||
         result.venue.toLowerCase().includes(query)) &&
        new Date(result.date) >= new Date()
      );
    } else if (result.type === 'user') {
      return result.username.toLowerCase().includes(query);
    } else if (result.type === 'venue' && userExists) {
      return (
        result.name.toLowerCase().includes(query) ||
        result.location.toLowerCase().includes(query)
      );
    }
    return false;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="search-results">
      {filteredResults.length > 0 ? (
        filteredResults.map((result, index) => (
          <div key={index} className="search-result-card">
            {result.type === 'user' ? (
              <>
                <img src={result.avatar ? `data:image/png;base64,${result.avatar}` : DEFAULT_AVATAR_URL} alt={result.username} className="result-avatar" />
                <h3>{result.username}</h3>
                <p>{result.category}</p>
                <button className="view-profile-button" onClick={() => onViewProfile(result._id)}>
                  View Profile
                </button>
              </>
            ) : result.type === 'event' ? (
              <>
                <img src={`http://localhost:5000/uploads/${result.image}`} alt={result.title} className="result-image" />
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <p><strong>Venue:</strong> {result.venue}</p>
                <p><strong>Date:</strong> {new Date(result.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {result.startTime}</p>
                <button className="view-details-button" onClick={() => handleViewEventDetails(result)}>
                  View Details
                </button>
              </>
            ) : result.type === 'venue' ? (
              <>
                <img src={`http://localhost:5000${result.images[0]}`} alt={result.name} className="venue-image" />
                <div className="venue-info">
                  <h3>{result.name}</h3>
                  <p>{result.location}</p>
                  <button onClick={() => handleViewVenueDetails(result)}>
                    Explore Venue
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ))
      ) : (
        <p>No results found</p>
      )}

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

export default SearchResults;
