// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile, isAuthenticated, login, logout, register, updateProfile } from '../services/authService';
const AuthContext = createContext(null);

// Export the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    const authenticated = isAuthenticated();
    
    if (user && authenticated) {
      setCurrentUser(user);
    }
    
    setLoading(false);
  }, []);

  // Register a new user
  const registerUser = async (userData) => {
    try {
      setError(null);
      const data = await register(userData);
      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login a user
  const loginUser = async (email, password) => {
    try {
      setError(null);
      const data = await login(email, password);
      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout the current user
  const logoutUser = () => {
    logout();
    setCurrentUser(null);
  };

  // Update user profile
  const updateUserProfile = async (userData) => {
    try {
      setError(null);
      const data = await updateProfile(userData);
      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  const refreshCurrentUser = async () => {
    try {
      console.log("Starting refreshCurrentUser...");
      setLoading(true);
      setError(null);
      
      // Get updated user profile from API
      const userData = await getUserProfile();
      console.log("Received updated user data:", userData);
      
    
      // Explicitly update localStorage with full user data including registeredClasses
      localStorage.setItem('user', JSON.stringify(userData));
      
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error("Error in refreshCurrentUser:", err);
      setError(err.response?.data?.message || 'Failed to refresh user data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    refreshCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook as a named function declaration instead of an arrow function
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}