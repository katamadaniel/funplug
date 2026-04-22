import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

// Mock the theme context
jest.mock('./theme/ThemeContext', () => ({
  useThemeMode: () => ({
    mode: 'light',
    toggleTheme: jest.fn(),
  }),
}));

// Mock the avatar utility
jest.mock('./utils/avatar', () => ({
  getAvatarUrl: jest.fn((user) => user?.avatar || null),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('renders login and signup buttons', () => {
      renderWithRouter(
        <Header
          isAuthenticated={false}
          user={null}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Signup')).toBeInTheDocument();
    });

    it('does not render user avatar or menu', () => {
      renderWithRouter(
        <Header
          isAuthenticated={false}
          user={null}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.queryByRole('img', { name: /avatar/i })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = {
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg'
    };

    it('renders user avatar when user has avatar', () => {
      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={mockUser}
          onLogout={mockOnLogout}
        />
      );

      const avatar = screen.getByAltText('testuser');
      expect(avatar).toBeInTheDocument();
      expect(avatar.src).toContain('avatar.jpg');
    });

    it('renders skeleton when user has no avatar', () => {
      const userWithoutAvatar = { ...mockUser, avatar: null };

      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={userWithoutAvatar}
          onLogout={mockOnLogout}
        />
      );

      // Should show skeleton for desktop view
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('calls onLogout when logout is clicked', () => {
      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={mockUser}
          onLogout={mockOnLogout}
        />
      );

      // Click on avatar to open menu
      const avatarButton = screen.getByRole('button', { name: /account settings/i });
      fireEvent.click(avatarButton);

      // Click logout in the menu
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('renders theme toggle button', () => {
      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={mockUser}
          onLogout={mockOnLogout}
        />
      );

      const themeButton = screen.getByLabelText('Toggle theme');
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe('mobile view', () => {
    beforeEach(() => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders mobile menu button with avatar', () => {
      const mockUser = {
        username: 'mobileuser',
        avatar: 'https://example.com/mobile-avatar.jpg'
      };

      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={mockUser}
          onLogout={mockOnLogout}
        />
      );

      const avatar = screen.getByAltText('mobileuser');
      expect(avatar).toBeInTheDocument();
    });

    it('opens mobile menu when clicked', () => {
      const mockUser = {
        username: 'mobileuser',
        avatar: 'https://example.com/mobile-avatar.jpg'
      };

      renderWithRouter(
        <Header
          isAuthenticated={true}
          user={mockUser}
          onLogout={mockOnLogout}
        />
      );

      // Click on mobile menu button
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);

      // Check if menu items are visible
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});