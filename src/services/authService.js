// frontend/src/services/authService.js
import api from './api';
import { jwtDecode } from 'jwt-decode';

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/users', userData);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login a user
export const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout a user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get the current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    // Check if token is expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      // Token has expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Check if user is an admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  
  // Update stored user data
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
  }
  
  return response.data;
};

// Get all users (for admin dashboard)
export const getUsers = async () => {
    // Assuming your API endpoint for fetching all users is '/users'
    // Adjust the endpoint if necessary (e.g., '/admin/users')
    // This likely requires authentication, which your 'api' instance should handle
    const response = await api.get('/users');
    return response.data; // Assuming the API returns an array of user objects
};

// Get user profile data - add this to authService.js
export const getUserProfile = async () => {
    const response = await api.get('/users/profile');
    
    // Update stored user data if needed
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  };