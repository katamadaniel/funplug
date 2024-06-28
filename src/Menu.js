// Menu.js
import React from 'react';
import SearchBar from './SearchBar';
import {Link} from 'react-router-dom';
import './Menu.css';

const Menu = ({ onSearch }) => {
  return (
    <nav className="menu">
      <ul className="menu-list">
      <li className="menu-item">
            <Link to="/">Home</Link>
          </li>
          <li className="menu-item">
            <Link to="/category">Category</Link>
          </li>
          <li className="menu-item">
            <Link to="/about">About</Link>
          </li>
          <li className="menu-item">
            <Link to="/faq">FAQ</Link>
          </li>
      </ul>
            <div className="main-search-box">
        <SearchBar onSearch={onSearch} />
      </div>
    </nav>
  );
};

export default Menu;
