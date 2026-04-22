import axiosInstance from '../axiosInstance';
import { signup, login, fetchProfile, updateProfile, logoutUser } from './userService';

// Mock axios
jest.mock('../axiosInstance');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should call signup API and return response data', async () => {
      const mockFormData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        data: {
          message: 'User created successfully',
          user: { id: 1, username: 'testuser' }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await signup(mockFormData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/users/signup`,
        mockFormData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when API call fails', async () => {
      const mockError = {
        response: {
          data: { message: 'User already exists' }
        }
      };

      axiosInstance.post.mockRejectedValue(mockError);

      await expect(signup({})).rejects.toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should call login API and return response data', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'jwt-token',
          user: { id: 1, username: 'testuser' }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await login(mockCredentials);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when login fails', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };

      axiosInstance.post.mockRejectedValue(mockError);

      await expect(login({})).rejects.toEqual(mockError);
    });
  });

  describe('fetchProfile', () => {
    it('should call profile API and return user data', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      };

      const mockResponse = {
        data: mockUserData
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchProfile();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/users/profile`
      );
      expect(result).toEqual(mockUserData);
    });

    it('should throw error when profile fetch fails', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' }
        }
      };

      axiosInstance.get.mockRejectedValue(mockError);

      await expect(fetchProfile()).rejects.toEqual(mockError);
    });
  });

  describe('updateProfile', () => {
    it('should call update profile API with form data', async () => {
      const mockFormData = new FormData();
      mockFormData.append('username', 'updateduser');

      const mockResponse = {
        data: {
          message: 'Profile updated successfully',
          user: { username: 'updateduser' }
        }
      };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const result = await updateProfile(mockFormData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        mockFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logoutUser', () => {
    it('should call logout API', async () => {
      const mockResponse = {
        data: { message: 'Logged out successfully' }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await logoutUser();

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/users/logout`
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});