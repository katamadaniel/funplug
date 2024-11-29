import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { fetchEvents, fetchMyEvents, createEvent, updateEvent, deleteEvent } from './services/EventService';
import './Events.css';

Modal.setAppElement('#root');

const Events = () => {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: '',
    image: null,
    description: '',
    venue: '',
    date: '',
    time: '',
    regularPrice: '',
    vipPrice: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    fetchAllEvents();
    fetchUserEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const events = await fetchEvents();
      setEvents(events);
    } catch (error) {
      setErrorMessage('Error fetching events');
    }
  };

  const fetchUserEvents = async () => {
    try {
      const userEvents = await fetchMyEvents();
      setMyEvents(userEvents);
    } catch (error) {
      setErrorMessage('Error fetching your events');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      image: e.target.files[0],
    }));
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await updateEvent(currentEventId, eventDetails);
        setStatusMessage('Event updated successfully!');
      } else {
        await createEvent(eventDetails);
        setStatusMessage('Event added successfully!');
      }
      fetchUserEvents();
      setModalIsOpen(false);
    } catch (error) {
      setErrorMessage('Error saving event');
    }
  };

  const handleEdit = (event) => {
    setEventDetails({
      title: event.title,
      image: event.image,
      description: event.description,
      venue: event.venue,
      date: event.date,
      time: event.time,
      regularPrice: event.regularPrice,
      vipPrice: event.vipPrice,
    });
    setCurrentEventId(event._id);
    setEditMode(true);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      fetchUserEvents();
      setStatusMessage('Event deleted successfully!');
    } catch (error) {
      setErrorMessage('Error deleting event');
    }
  };

  const handleCancel = () => {
    setModalIsOpen(false);
    setEditMode(false);
    setEventDetails({
      title: '',
      image: null,
      description: '',
      venue: '',
      date: '',
      time: '',
      regularPrice: '',
      vipPrice: '',
    });
  };

  return (
    <div className="events-page">
      <button className="add-event-button" onClick={() => setModalIsOpen(true)}>Add Event</button>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <Modal isOpen={modalIsOpen} onRequestClose={handleCancel} className="modal" overlayClassName="overlay">
        <h2>{editMode ? 'Edit Event' : 'Add Event'}</h2>
        <form className="event-form">
          <input name="title" placeholder="Title" value={eventDetails.title} onChange={handleChange} />
          <input type="file" name="image" onChange={handleFileChange} />
          <textarea name="description" placeholder="Description" value={eventDetails.description} onChange={handleChange}></textarea>
          <input name="venue" placeholder="Venue" value={eventDetails.venue} onChange={handleChange} />
          <input type="date" name="date" value={eventDetails.date} onChange={handleChange} />
          <input type="time" name="time" value={eventDetails.time} onChange={handleChange} />
          <input type="number" name="regularPrice" placeholder="Regular Price" value={eventDetails.regularPrice} onChange={handleChange} />
          <input type="number" name="vipPrice" placeholder="VIP Price" value={eventDetails.vipPrice} onChange={handleChange} />
          <div className="form-buttons">
            <button type="button" className="save-button" onClick={handleSave}>{editMode ? 'Update' : 'Save'}</button>
            <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </Modal>
      <div className="my-events-container">
        <h2>My Events</h2>
        {myEvents.map((event) => (
          <div className="event-card" key={event._id}>
            <h3>{event.title}</h3>
            <img src={`http://localhost:5000${event.image}`} alt={event.title} />
            <p>{event.description}</p>
            <p>Venue: {event.venue}</p>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
            <p>Regular Price: ${event.regularPrice}</p>
            <p>VIP Price: ${event.vipPrice}</p>
            <button onClick={() => handleEdit(event)}>Edit</button>
            <button onClick={() => handleDelete(event._id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="all-events-container">
        <h2>All Events</h2>
        {events.map((event) => (
          <div className="event-card" key={event._id}>
            <h3>{event.title}</h3>
            <img src={`http://localhost:5000${event.image}`} alt={event.title} />
            <p>{event.description}</p>
            <p>Venue: {event.venue}</p>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
            <p>Regular Price: ${event.regularPrice}</p>
            <p>VIP Price: ${event.vipPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
