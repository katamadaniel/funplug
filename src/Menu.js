import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import './Menu.css';

const Menu = ({ onSearch, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="top-bar">
      <div className="menu">
        <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          {isOpen ? '✖' : '☰'}
        </button>

        <ul className={`menu-list ${isOpen ? 'open' : ''}`}>
          <li className="menu-item">
            <Link to="/" onClick={toggleMenu}>Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="menu-item">
                <Link to="/profile" onClick={toggleMenu}>Profile</Link>
              </li>
              <li className="menu-item">
                <Link to="/events" onClick={toggleMenu}>Events</Link>
              </li>
              <li className="menu-item">
                <Link to="/venues" onClick={toggleMenu}>Venues</Link>
              </li>
              <li className="menu-item">
                <Link to="/notifications" onClick={toggleMenu}>Notifications</Link>
              </li>
            </>
          ) : (
            <>
              <li className="menu-item">
                <Link to="/category" onClick={toggleMenu}>Category</Link>
              </li>
              <li className="menu-item">
                <Link to="/about" onClick={toggleMenu}>About</Link>
              </li>
              <li className="menu-item">
                <Link to="/faq" onClick={toggleMenu}>FAQ</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="main-search-box">
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
};

export default Menu;
