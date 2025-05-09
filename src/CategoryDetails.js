import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EventModal from './EventModal';
import TicketPurchase from './TicketPurchase';
import CircularProgress from '@mui/material/CircularProgress';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import './CategoryDetails.css';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;
const USERS_API_URL = `${API_URL}/api/users`;
const DEFAULT_AVATAR_URL = process.env.REACT_APP_AVATAR_URL;

const CategoryDetails = () => {
  const { category } = useParams();
  const [groupedEvents, setGroupedEvents] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTicketPurchaseOpen, setIsTicketPurchaseOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          axios.get(USERS_API_URL),
          axios.get(`${EVENTS_API_URL}/category/${encodeURIComponent(category)}`)
        ]);
        setUsers(usersRes.data);
        setGroupedEvents(eventsRes.data);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

  const handleViewEventDetails = (event) => {
    const user = users.find(user => user._id === event.userId);
    setSelectedEvent(event);
    setSelectedUser(user || { username: 'Unknown User', avatar: DEFAULT_AVATAR_URL });
    setIsEventModalOpen(true);
  };

  const handleBuyTicket = () => {
    setIsEventModalOpen(false);
    setIsTicketPurchaseOpen(true);
  };

  const handleCloseTicketPurchase = () => {
    setIsTicketPurchaseOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  const CollapsibleSubcategory = ({ subcategory, events }) => {
    const [open, setOpen] = useState(true);
    const toggleOpen = () => setOpen(prev => !prev);

    return (
      <div className="subcategory-section">
        <div
          className="subcategory-header"
          onClick={toggleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleOpen()}
        >
          <h2>{subcategory}</h2>
          {open ? <ExpandLess className="toggle-icon" /> : <ExpandMore className="toggle-icon" />}
        </div>

        {open && (
          <div className="events-group">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <img
                  src={event.image || '/default-event.jpg'}
                  alt={event.title}
                  className="event-image"
                />
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {event.startTime}</p>
                <button
                  className="view-details-btn"
                  onClick={() => handleViewEventDetails(event)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="events-container">
      {Object.keys(groupedEvents).length > 0 ? (
        Object.entries(groupedEvents).map(([subCategory, events]) => (
          <CollapsibleSubcategory
            key={subCategory}
            subcategory={subCategory}
            events={events}
          />
        ))
      ) : (
        <p>No upcoming events found for this category.</p>
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
