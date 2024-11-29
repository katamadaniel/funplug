// About.js
import React from 'react';
import './About.css';
import missionImage from './mission.jpg'; // Ensure you have a suitable image in the src folder

const About = () => {
  return (
    <div className="about-container">
      <h1>Our Mission</h1>
      <img src={missionImage} alt="Our Mission" className="mission-image" />
      <p>
        We are on a mission to inspire, motivate, and equip the next generation of stars and entrepreneurs with the knowledge and information they need 
        to get started and succeed in their careers by learning from those in the business. This is made possible by allowing our users to share their stories 
        through their profiles, which are accessible to their fans through a quick search or recommended on our home page through top picks.
      </p>

      <p>
        Our registered users have the acess to create personalized profiles, events, share booking schedule and rates, book event spaces which enables them to 
        get more sales and traction by simplifying the process.
      </p>

      <h2>FunPlug is your gateway to an insightful entertainment and events experience.</h2>
      <p>
        Start exploring FunPlug to unlock a whole new world of fun, inspiration, and entertainment. Using our platform, you can do that and much more just 
        by typing a name in the search bar and hitting ‘enter’.
      </p>

      <h3>
        We provide you with the information you need on creators, brands, and events to help you make an informed decision while planning to host or
        attend events. We know that you are specific about your taste and interests thus you often require more time and information before committing 
        to anything and that’s why we are here to make the search easy for you.
      </h3>
    </div>
  );
};

export default About;
