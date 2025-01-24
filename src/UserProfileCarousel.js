import React from 'react';
import Slider from 'react-slick';
import Avatar from '@mui/material/Avatar';
import './UserProfileCarousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const DEFAULT_AVATAR_URL = '/default-avatar.png';

const UserProfileCarousel = ({ users }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="user-profile-carousel">
      <Slider {...settings}>
        {users.slice(0, 10).map(user => ( // Display up to 10 profiles
          <div key={user.id} className="user-profile-card">
            <div className="avatar-container">
              <Avatar
                src={user.avatar ? `http://localhost:5000${user.avatar}` : DEFAULT_AVATAR_URL}
                alt={`${user.username}'s avatar`}
                sx={{ width: 120, height: 120, margin: 'auto' }}
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
