import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import './EventsPage.css';
import EventModal from './EventFormModal';
import {
  createEvent,
  fetchMyEvents,
  updateEvent,
  deleteEvent,
  fetchTicketPurchases,
} from './services/EventService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';

const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

const EventPage = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    venue: '',
    date: '',
    statTime: '',
    endTime: '',
    regularPrice: '',
    vipPrice: '',
    vvipPrice: '',
    ticketType: '',
    freeSlots: '',
    regularSlots: '',
    vipSlots:'',
    vvipSlots:'',
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState([]);

  // Fetch events and purchases
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventsData = await fetchMyEvents(token);
      setEvents(eventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching events:', error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const purchasesByEvent = {};
      for (const event of events) {
        const purchases = await fetchTicketPurchases(event._id);
        purchasesByEvent[event._id] = purchases.sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );
      }
      setPurchases(purchasesByEvent);
    } catch (error) {
      console.error('Error fetching purchases:', error.message);
    } finally {
      setLoading(false);
    }
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (showPurchases) {
      fetchPurchases();
    }
  }, [showPurchases, fetchPurchases]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

    // Enable/Disable price inputs based on ticket type
    const handleTicketTypeChange = (e) => {
      const ticketType = e.target.value;
      setFormData({
        ...formData,
        ticketType,
        regularPrice: ticketType === 'free' ? '0' : formData.regularPrice,
        vipPrice: ticketType === 'free' ? '0' : formData.vipPrice,
        vvipPrice: ticketType === 'free' ? '0' : formData.vvipPrice,
      });
    };

  const handleFormSubmit = async (data) => {
  // Adjust the formData based on ticketType
    if (data.ticketType === 'free') {
      data.regularPrice = '0';
      data.regularSlots = '0';
      data.vipPrice = '0';
      data.vipSlots = '0';
      data.vvipPrice = '0';
      data.vvipSlots = '0';
    }

    const formDataObj = new FormData();
    for (const key in data) {
      formDataObj.append(key, key === 'image' && data[key].length > 0 ? data[key][0] : data[key]);
    }

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, formDataObj);
        setStatusMessage('Event updated successfully');
      } else {
        await createEvent(formDataObj);
        setStatusMessage('Event created successfully');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error.message);
      setStatusMessage('Error saving event');
    }
  };

  const handleEditClick = (event) => {
    setFormData({
      title: event.title,
      image: 'null',
      description: event.description,
      venue: event.venue,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      startTime: event.startTime,
      endTime: event.endTime,
      regularPrice: event.regularPrice,
      vipPrice: event.vipPrice,
      vvipPrice: event.vvipPrice,
      ticketType: event.ticketType || 'paid',
      regularSlots: event.regularSlots,
      vipSlots: event.vipSlots,
      vvipSlots: event.vvipSlots,
    });
    setEditingEventId(event._id);
    openModal();
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        fetchEvents();
        setStatusMessage('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error.message);
        setStatusMessage('Error deleting event');
      }
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      description: '',
      venue: '',
      date: '',
      startTime: '',
      endTime: '',
      regularPrice: '',
      vipPrice: '',
      vvipPrice: '',
      ticketType: 'paid',
      regularSlots: '',
      vipSlots:'',
      vvipSlots:'',
    });
    setEditingEventId(null);
  };

  const currentDate = new Date();

  const pastEvents = events.filter((event) => new Date(event.date) < currentDate);
  const upcomingEvents = events.filter((event) => new Date(event.date) >= currentDate);

  const toggleView = () => {
    setShowPastEvents(!showPastEvents);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="event-page">
      <div className="button-container">
        <button id="add" onClick={openModal}>
          Create Event
        </button>
        <button id="toggle" onClick={toggleView}>
          {showPastEvents ? 'Upcoming Events' : 'Past Events'}
        </button>
        <button id="toggle" onClick={() => setShowPurchases(!showPurchases)}>
          {showPurchases ? 'Hide Purchases' : 'Show Purchases'}
        </button>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleFormSubmit}
        onCancel={closeModal}
        editingEventId={editingEventId}
        statusMessage={statusMessage}
        onTicketTypeChange={handleTicketTypeChange}
      />

      {showPurchases ? (
        <div>
          <h2>Event Purchases</h2>
          {events.map((event) => {
            const purchasesForEvent = purchases[event._id] || [];

            // Calculate total revenue for the event
            const totalRevenue = purchasesForEvent.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

            return (
              <div key={event._id}>
                <h3>{event.title}</h3>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Buyer Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Ticket Type</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total Amount (Ksh.)</TableCell>
                        <TableCell>Purchase Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchasesForEvent.length > 0 ? (
                        purchasesForEvent.map((purchase) => (
                          <TableRow key={purchase._id}>
                            <TableCell>{purchase.email}</TableCell>
                            <TableCell>{purchase.phone}</TableCell>
                            <TableCell>{purchase.ticketType}</TableCell>
                            <TableCell>{purchase.quantity}</TableCell>
                            <TableCell>{purchase.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(purchase.purchaseDate).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No purchases for this event.
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Total Revenue Row */}
                      {purchasesForEvent.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="right">
                            <strong>Total Revenue:</strong>
                          </TableCell>
                          <TableCell>
                            <strong> Ksh.{totalRevenue.toFixed(2)}</strong>
                          </TableCell>
                          <TableCell></TableCell> {/* Empty cell for alignment */}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {showPastEvents ? (
            <>
              <h2>Past Events</h2>
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Total Tickets</th>
                    <th>Total Revenue (Ksh.)</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEvents.map((event) => {
                    const purchasesForEvent = purchases[event._id] || [];

                    // Calculate total tickets and total revenue for past events
                    const totalTickets = purchasesForEvent.reduce((sum, purchase) => sum + purchase.quantity, 0);
                    const totalRevenue = purchasesForEvent.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

                    return (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleString()}</td>
                        <td>{event.venue}</td>
                        <td>{event.description}</td>
                        <td>{totalTickets}</td>
                        <td>{totalRevenue.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <>
          <h2>Upcoming Events</h2>
          <div className="events-container">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="event-card">
                <img
                  src={`${IMAGE_BASE_URL}/events/${event.image}`}
                  alt={event.title}
                />
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p>
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p>
                  <strong>Date:</strong> {format(new Date(event.date), 'dd-MM-yyyy')}
                </p>
                <p>
                  <strong>Starts at:</strong> {event.startTime}
                </p>
                <p>
                  <strong>Ends at:</strong> {event.endTime}
                </p>
                {event.ticketType === 'free' ? (
                  <p><strong>Price:</strong> Free</p>
                ) : (
                  <>
                    {event.regularPrice > 0 && <p><strong>Regular Price:</strong> Ksh.{event.regularPrice}</p>}
                    {event.vipPrice > 0 && <p><strong>VIP Price:</strong> Ksh.{event.vipPrice}</p>}
                    {event.vvipPrice > 0 && <p><strong>VVIP Price:</strong> Ksh.{event.vvipPrice}</p>}
                  </>
                )}
                <button onClick={() => handleEditClick(event)}>Edit</button>
                <button onClick={() => handleDeleteClick(event._id)}>Delete</button>
                <p className="event-created-at">
                  <strong>Created on:</strong> <i>{format(new Date(event.createdAt), 'PPP')}</i>
                </p>
              </div>
            ))}
              </div>
            </>
          )}
        </>
      )}
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default EventPage;
