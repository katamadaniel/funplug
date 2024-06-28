import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Category from './Category';
import About from './About';
import FAQ from './FAQ';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import SearchResults from './SearchResults';
import Profile from './Profile';
import Events from './Events';
import Portfolio from './Portfolio';
import Notifications from './Notifications';
import PrivateRoute from './PrivateRoute';
import { users, events } from './data';
import UserMenu from './UserMenu';
import { fetchProfile } from './services/userService';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null); 

  const handleSearch = (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredUsers = users
      .filter(user => user.name.toLowerCase().includes(lowerCaseQuery))
      .map(user => ({ ...user, type: 'user' }));

    const filteredEvents = events
      .filter(event => event.title.toLowerCase().includes(lowerCaseQuery))
      .map(event => ({ ...event, type: 'event' }));

    setSearchResults([...filteredUsers, ...filteredEvents]);
  };
  useEffect(() => {
    //fetch user profile if authenticated
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await fetchProfile(token);
          setUser(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="App">
        <Header />
        {isAuthenticated && user && <UserMenu user={user} />}
        <Menu onSearch={handleSearch} />
        <Routes> 
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/search" element={<SearchResults results={searchResults} />} />
          <Route path="/profile//*" element={<PrivateRoute component={Profile} />} />
          <Route path="/events" element={<PrivateRoute component={Events} />} />
          <Route path="/portfolio" element={<PrivateRoute component={Portfolio} />} />
          <Route path="/notifications" element={<PrivateRoute component={Notifications} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
