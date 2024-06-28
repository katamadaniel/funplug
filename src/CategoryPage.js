// CategoryPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { events, users } from './data'; // Import your events and users data

const CategoryPage = () => {
  const { category } = useParams();

  const filteredEvents = events.filter(event => event.category === category);
  const filteredUsers = users.filter(user => user.category === category);

  return (
    <div>
      <h2>{category}</h2>
      <h3>Events</h3>
      <div className="event-list">
        {filteredEvents.map(event => (
          <div key={event.id} className="event-card">
            <h4>{event.title}</h4>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
      <h3>Users</h3>
      <div className="user-list">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <h4>{user.name}</h4>
            <p>{user.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
