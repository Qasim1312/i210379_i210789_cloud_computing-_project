import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on initial app load
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Verify token is not expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // Token valid
            setUser(JSON.parse(userData));
            
            // Optionally, verify token with backend
            try {
              const response = await authService.getProfile();
              setUser(response.data);
            } catch (err) {
              console.error('Error fetching user profile', err);
              // Keep using cached user data if API call fails
            }
          }
        } catch (err) {
          // Invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.register(userData);
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.user;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Profile update failed');
      return { success: false, message: err.response?.data?.message || 'Profile update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 