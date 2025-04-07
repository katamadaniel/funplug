import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EmailUpdateVerification = () => {
  const { userId, token } = useParams();
  const [statusMessage, setStatusMessage] = useState('Verifying your email update...');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailUpdate = async () => {
      try {
        // Call the API to verify the token
        const response = await axios.get(`${API_BASE_URL}/api/users/verify-email-update/${userId}/${token}`);
        setStatusMessage(response.data.message || 'Email update verified successfully!');
        setIsVerified(true);
      } catch (error) {
        console.error('Error verifying email update:', error);
        setStatusMessage(
          error.response?.data?.message || 'Failed to verify email update. Please try again later.'
        );
        setIsVerified(false);
      }
    };

    verifyEmailUpdate();
  }, [userId, token]);

  const handleGoToProfile = () => {
    navigate('/profile'); // Redirect to the user's profile page
  };

  return (
    <div className="email-update-verification">
      <h1>Email Update Verification</h1>
      <p>{statusMessage}</p>
      {isVerified && (
        <button onClick={handleGoToProfile} className="btn btn-primary">
          Go to Profile
        </button>
      )}
    </div>
  );
};

export default EmailUpdateVerification;
