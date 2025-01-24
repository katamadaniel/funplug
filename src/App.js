import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Category from './Category';
import CategoryDetails from './CategoryDetails';
import About from './About';
import FAQ from './FAQ';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import SearchResults from './SearchResults';
import Profile from './Profile';
import UserProfile from './UserProfile';
import EventsPage from './EventsPage';
import EventDetails from './EventDetails';
import VenuesPage from './VenuesPage';
import Notifications from './Notifications';
import { fetchProfile, logoutUser } from './services/userService';
import { fetchAdminProfile, logoutAdmin } from './services/adminService';
import PasswordResetRequest from './PasswordResetRequest';
import PasswordResetVerify from './PasswordResetVerify';
import EmailUpdateVerification from './EmailUpdateVerification';
import VerifyEmail from './VerifyEmail';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import TermsAndAgreement from './TermsAndAgreement';
import ReportProblem from './ReportProblem';
import ContactSupport from './ContactSupport';
import './App.css';
import { CacheProvider } from './contexts/CacheContext';
import { UsersProvider } from './contexts/UsersContext';
import { TicketsProvider } from './contexts/TicketsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { EventsProvider } from './contexts/EventsContext';
import { VenuesProvider } from './contexts/VenuesContext';
import { useSearch, SearchProvider } from './contexts/SearchContext';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import Admins from './components/admin/Admins';
import EventsAdmin from './components/admin/EventsAdmin';
import UsersAdmin from './components/admin/UsersAdmin';
import VenuesAdmin from './components/admin/VenuesAdmin';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminEmails from './components/admin/AdminEmails';
import AdminInvoices from './components/admin/AdminInvoices';
import AdminSettings from './components/admin/AdminSettings';
import AdminLogin from './components/admin/AdminLogin';
import AdminNavbar from './components/admin/AdminNavbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdminAuthenticated, setAdminAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (token) {
        try {
          const profile = await fetchProfile(token);
          setUser(profile);
          localStorage.setItem('userId', profile._id);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
    };

    const loadAdminProfile = async () => {
      if (adminToken) {
        try {
          const adminProfile = await fetchAdminProfile(adminToken);
          setAdmin(adminProfile);
          localStorage.setItem('adminId', adminProfile._id);
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          localStorage.removeItem('adminToken');
          setAdminAuthenticated(false);
        }
      }
    };

    loadUserProfile();
    loadAdminProfile();
  }, [isAuthenticated, token, isAdminAuthenticated, adminToken]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    } catch (error) {
      console.error('Error during user logout:', error);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
      setAdminAuthenticated(false);
      setAdmin(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  return (
    <CacheProvider>
    <NotificationProvider>
      <UsersProvider>
        <TicketsProvider>
          <EventsProvider>
            <VenuesProvider>
              <SearchProvider>
                <Router>
                  {isAdminAuthenticated ? (
                    <div className="admin-portal">
                      <AdminNavbar  admin={admin} onLogout={handleAdminLogout}  setAdminAuthenticated={setAdminAuthenticated}  setAdmin={setAdmin} />
                      <AdminLayout>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="admins" element={<Admins />} />
                          <Route path="users" element={<UsersAdmin />} />
                          <Route path="events" element={<EventsAdmin />} />
                          <Route path="venues" element={<VenuesAdmin />} />
                          <Route path="notifications" element={<AdminNotifications />} />
                          <Route path="emails" element={<AdminEmails />} />
                          <Route path="invoices" element={<AdminInvoices />} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Routes>
                      </AdminLayout>
                    </div>
                  ) : (
                    <div className="App">
                      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} user={user} />
                      <Menu isAuthenticated={isAuthenticated} />
                      <div className="content">
                        <Routes>
                          <Route path="/admin" element={<AdminLogin setAdminAuthenticated={setAdminAuthenticated} setAdmin={setAdmin} />} />
                          <Route path="/reset" element={<PasswordResetRequest />} />
                          <Route path="/reset-password/:token" element={<PasswordResetVerify />} />
                          <Route path="/verify-email/:token" element={<VerifyEmail />} />
                          <Route path="/verify-email-update/:token" element={<EmailUpdateVerification />} />
                          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/searchResults" element={<SearchResultsWrapper />} />
                          <Route path="/profile/:id" element={<UserProfile />} />
                          <Route path="/events/:id" element={<EventDetails />} />
                          <Route path="/profile/*" element={<Profile token={localStorage.getItem('token')} />} />
                          <Route path="/category" element={<Category />} />
                          <Route path="/category/:category" element={<CategoryDetails />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/venues" element={<VenuesPage />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/change-password" element={<ChangePassword />} />
                          <Route path="/delete-account" element={<DeleteAccount />} />
                          <Route path="/terms-and-agreement" element={<TermsAndAgreement />} />
                          <Route path="/report-problem" element={<ReportProblem />} />
                          <Route path="/contact-support" element={<ContactSupport />} />
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </div>
                      <Footer />
                    </div>
                  )}
                </Router>
              </SearchProvider>
            </VenuesProvider>
          </EventsProvider>
        </TicketsProvider>
      </UsersProvider>
    </NotificationProvider>
    </CacheProvider>
  );
}

function SearchResultsWrapper() {
  const navigate = useNavigate();
  const { searchResults } = useSearch(); // Get searchResults from context

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleViewVenueDetails = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  return (
    <SearchResults results={searchResults} onViewProfile={handleViewProfile} onViewEventDetails={handleViewEventDetails} onExploreVenue={handleViewVenueDetails} />
  );
}

export default App;
