import React from 'react';
import './UserCard.css';

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <img src={`http://localhost:5000/uploads/${user.avatar}`} alt={user.username} className="user-avatar" />
      <h3 className="user-name">{user.username}</h3>
      <p className="user-category">{user.category}</p>
      <button className="view-profile-button">View Profile</button>
    </div>
  );
};

export default UserCard;
