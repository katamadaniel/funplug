// UserProfileCarousel.js
import React from 'react';
import Slider from 'react-slick';
import './UserProfileCarousel.css'; // Create a CSS file for custom styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const UserProfileCarousel = ({ users }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
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
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  return (
    <div className="user-profile-carousel">
      <Slider {...settings}>
        {users.map(user => (
          <div key={user.id} className="user-profile">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <h3 className="user-name">{user.name}</h3>
            <p className="user-details">{user.details}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default UserProfileCarousel;
