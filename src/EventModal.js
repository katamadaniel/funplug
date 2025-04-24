import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { getAvatarUrl } from './utils/avatar';
import axios from 'axios';
import './EventModal.css';

const API_URL = process.env.REACT_APP_API_URL;

const EventModal = ({ event, user, onClose, onBuyTicket }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFollowFormOpen, setIsFollowFormOpen] = useState(false);
  const [followName, setFollowName] = useState('');
  const [followEmail, setFollowEmail] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const handleFollowClick = () => {
    setIsFollowFormOpen(!isFollowFormOpen);
  };

  const handleFollowSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/follow/${user._id}`, {
        name: followName,
        email: followEmail,
      });
      setIsFollowFormOpen(false);
      setFollowName('');
      setFollowEmail('');
      fetchFollowerCount(); // Refresh the count after following
      alert('Successfully followed!');
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow. Please try again.');
    }
  };

  const fetchFollowerCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/followers/count/${user._id}`);
      setFollowerCount(res.data.followerCount);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  const handleShareButtonClick = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this event: ${event.title} at ${event.venue}!`;

  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(shareUrl)}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  useEffect(() => {
    if (user) {
      fetchFollowerCount();
    }
  }, [user]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-left">
            <Avatar
              src={getAvatarUrl(user)}
              alt={user ? `${user.username}'s avatar` : 'Unknown User'}
              sx={{ width: 60, height: 60, marginRight: '10px' }}
              className="creator-image"
              onError={handleImageError}
            />
            <div className="creator-info">
              <span className="creator-name">{user?.username || 'Unknown User'}</span>
              <span className="follower-count">{followerCount} Followers</span>
            </div>

            <button className="follow-button" onClick={handleFollowClick}>
              {isFollowFormOpen ? 'Cancel' : 'Follow'}
            </button>
          </div>

          <div className="close-share-wrapper">
            <Tooltip title="Share this event">
              <IconButton onClick={handleShareButtonClick} className="share-button" aria-label="share">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <button className="close-button" onClick={onClose}>X</button>
          </div>
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

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="share-modal">
            <h4>Share this Event</h4>
            <div className="share-icons">
              <a href={whatsappShare} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon fontSize="large" color="success" />
              </a>
              <a href={facebookShare} target="_blank" rel="noopener noreferrer">
                <FacebookIcon fontSize="large" color="primary" />
              </a>
              <a href={twitterShare} target="_blank" rel="noopener noreferrer">
                <TwitterIcon fontSize="large" color="primary" />
              </a>
            </div>
          </div>
        )}

        {/* Event Details */}
        <h2>{event.title}</h2>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Starts at:</strong> {event.startTime}</p>
        <p><strong>Ends at:</strong> {event.endTime}</p>
        <p><strong>Description:</strong> {event.description}</p>

        {/* Tickets */}
        <div className="ticket-selection">
          <h3>Tickets</h3>
          {event.regularPrice > 0 && (
            <div className="ticket-option">
              <span>Regular</span>
              <span>Ksh.{event.regularPrice}</span>
            </div>
          )}
          {event.vipPrice > 0 && (
            <div className="ticket-option">
              <span>VIP</span>
              <span>Ksh.{event.vipPrice}</span>
            </div>
          )}
          {event.vvipPrice > 0 && (
            <div className="ticket-option">
              <span>VVIP</span>
              <span>Ksh.{event.vvipPrice}</span>
            </div>
          )}
          {event.regularPrice === 0 && (
            <div className="ticket-option">
              <span>Regular</span>
              <span>Free</span>
            </div>
          )}
        </div>

        <button className="buy-ticket-button" onClick={onBuyTicket}>Buy Ticket</button>
      </div>
    </div>
  );
};

export default EventModal;
