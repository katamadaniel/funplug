import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Category from './categories/Category';
import CategoryRouter from './categories/CategoryRouter';
import About from './About';
import FAQ from './FAQ';
import Contact from './Contact';
import ScrollToTop from './ScrollToTop';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import SearchResults from './SearchResults';
import Profile from './Profile';
import UserProfile from './UserProfile';
import EventsPage from './EventsPage';
import VenuesPage from './VenuesPage';
import Performance from './Performance';
import Services from './Services';
import Notifications from './Notifications';
import { fetchProfile, logoutUser } from './services/userService';
import { fetchAdminProfile, logoutAdmin } from './services/adminService';
import PasswordResetRequest from './PasswordResetRequest';
import PasswordResetVerify from './PasswordResetVerify';
import EmailUpdateVerification from './EmailUpdateVerification';
import VerifyEmail from './VerifyEmail';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import PrivacyPolicy from './PrivacyPolicy';
import ReportProblem from './ReportProblem';
import ContactSupport from './ContactSupport';
import './App.css';
import { LocationProvider } from './contexts/LocationContext';
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
import PrivateRoute from './PrivateRoute';
import { decodeToken } from './utils/decodeToken';

Modal.setAppElement('#root');

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
        const decoded = decodeToken(token);
        const now = Date.now() / 1000; // in seconds

      if (decoded?.exp) {
        const timeout = (decoded.exp - now) * 1000; // ms
        const logoutTimer = setTimeout(() => {
          handleLogout();
        }, timeout);

        return () => clearTimeout(logoutTimer);
        }

        try {
          const profile = await fetchProfile(token).then(setUser);
          setUser(profile);
          localStorage.setItem('userId', profile._id);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          handleLogout();
        }
      }
    };

    const loadAdminProfile = async () => {
      if (adminToken) {
        const decoded = decodeToken(adminToken);
        const now = Date.now() / 1000;

      if (decoded?.exp) {
        const timeout = (decoded.exp - now) * 1000; // ms
        const logoutTimer = setTimeout(() => {
          handleLogout();
        }, timeout);

        return () => clearTimeout(logoutTimer);
        }

        try {
          const adminProfile = await fetchAdminProfile(adminToken).then(setAdmin);
          setAdmin(adminProfile);
          localStorage.setItem('adminId', adminProfile._id);
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          handleAdminLogout();
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
    <LocationProvider>
    <CacheProvider>
    <NotificationProvider userId={user?._id} token={token}>
      <UsersProvider>
        <TicketsProvider>
          <EventsProvider>
            <VenuesProvider>
              <SearchProvider>
                <Router>
                  <ScrollToTop />
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
                          <Route path="/verify-email-update/:userId/:token" element={<EmailUpdateVerification />} />
                          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/searchResults" element={<SearchResultsWrapper />} />
                          <Route path="/profile/:id" element={<UserProfile />} />
                          <Route path="/category" element={<Category />} />
                          <Route path="/category/:slug" element={<CategoryRouter />} />
                          <Route path="/category/:slug/:category" element={<CategoryRouter />} />

                          {/* Protected routes */}
                          <Route path="/profile/*" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <Profile token={token} /> </PrivateRoute> } />
                          <Route path="/events" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <EventsPage /> </PrivateRoute> } />
                          <Route path="/venues" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <VenuesPage /> </PrivateRoute> } />
                          <Route path="/performance" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <Performance /> </PrivateRoute> } />
                          <Route path="/services" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <Services /> </PrivateRoute> } />
                          <Route path="/notifications" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <Notifications /> </PrivateRoute> } />
                          <Route path="/change-password" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <ChangePassword /> </PrivateRoute> } />
                          <Route path="/delete-account" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <DeleteAccount /> </PrivateRoute> } />
                          <Route path="/privacy-policy" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <PrivacyPolicy /> </PrivateRoute> } />
                          <Route path="/report-problem" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <ReportProblem /> </PrivateRoute> } />
                          <Route path="/contact-support" element={ <PrivateRoute isAuthenticated={isAuthenticated}> <ContactSupport /> </PrivateRoute> } />
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
    </LocationProvider>
  );
}

function SearchResultsWrapper() {
  const navigate = useNavigate();
  const { searchResults } = useSearch();

  return (
    <SearchResults
      results={searchResults}
      onViewProfile={(id) => navigate(`/profile/${id}`)}
    />
  );
}

export default App;