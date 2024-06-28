import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from './services/userService';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      try {
        const data = await fetchProfile(token);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching profile');
      }
    };

    loadProfile();
  }, [navigate]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile">
      <h2>Welcome, {profile.username}</h2>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
      <p>Gender: {profile.gender}</p>
      <p>Category: {profile.category}</p>
      <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
    </div>
  );
};

export default Profile;
