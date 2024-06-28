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
        Our registered users have the privilege to create and share their events, profiles, and portfolios with their fan-base on other platforms to create
        traction and engagement for their content, enabling them to build a community of loyal supporters.
      </p>

      <h2>FunPlug is your gateway to an insightful entertainment and events experience.</h2>
      <p>
        Start exploring FunPlug to unlock a whole new world of fun, inspiration, and entertainment. Using our platform, you can do that and much more just 
        by typing a name in the search bar and hitting ‘enter’.
      </p>

      <h3>
        We provide you with all the information you need on celebrities, brands, and events to help you make an informed decision on who to support and 
        which events to attend. We know that you are passionate about what you like and you want to have as much information on it before committing 
        to anything, and that’s what we are here for.
      </h3>
    </div>
  );
};

export default About;
