import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import Avatar from '@mui/material/Avatar';
import './UserProfileCarousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getAvatarUrl } from './utils/avatar';

const UserProfileCarousel = ({ users }) => {
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1440,
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true, dots: true }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2, slidesToScroll: 1, initialSlide: 1 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  return (
    <div className="user-profile-carousel">
      <Slider {...settings}>
        {users.slice(0, 10).map(user => (
          <div 
            key={user.id} 
            className="user-profile-card"
            onClick={() => handleProfileClick(user._id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar-container">
              <Avatar
                src={getAvatarUrl(user)}
                alt={user ? `${user.username}'s avatar` : 'Unknown User'}
                sx={{ width: 120, height: 120, margin: 'auto' }}
                onError={handleImageError}
              />
            </div>
            <h3 className="user-name">{user.username}</h3>
            <p className="user-details">{user.category}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default UserProfileCarousel;
