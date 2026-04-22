import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the contexts and services
jest.mock('./contexts/LocationContext', () => ({
  LocationProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/CacheContext', () => ({
  CacheProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/UsersContext', () => ({
  UsersProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/TicketsContext', () => ({
  TicketsProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/EventsContext', () => ({
  EventsProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/VenuesContext', () => ({
  VenuesProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/PerformanceContext', () => ({
  PerformanceProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/ServicesContext', () => ({
  ServicesProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./contexts/SearchContext', () => ({
  SearchProvider: ({ children }) => <div>{children}</div>,
  useSearch: () => ({})
}));

jest.mock('./contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./services/userService', () => ({
  fetchProfile: jest.fn(),
  logoutUser: jest.fn(),
}));

jest.mock('./services/adminService', () => ({
  fetchAdminProfile: jest.fn(),
  logoutAdmin: jest.fn(),
}));

jest.mock('./hooks/useOffline', () => jest.fn(() => false));

jest.mock('./utils/decodeToken', () => jest.fn(() => ({ exp: Date.now() / 1000 + 3600 })));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('renders FunPlug header', () => {
  renderWithRouter(<App />);
  const headerElement = screen.getByText(/FunPlug/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders login and signup buttons when not authenticated', () => {
  // Mock localStorage to simulate no authentication
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

  renderWithRouter(<App />);

  const loginButton = screen.getByText(/Login/i);
  const signupButton = screen.getByText(/Signup/i);

  expect(loginButton).toBeInTheDocument();
  expect(signupButton).toBeInTheDocument();
});
