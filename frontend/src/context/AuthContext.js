import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Create context
const AuthContext = createContext(initialState);

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user data with token - using useCallback to memoize
  const loadUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users/me`);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: res.data,
          token: state.token,
        },
      });
    } catch (err) {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.token]);

  // Set auth token in Axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      // Fetch user data if token exists but no user data
      if (!state.user) {
        loadUser();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token, loadUser, state.user]);

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      localStorage.setItem('token', res.data.token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Login failed',
      });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      
      localStorage.setItem('token', res.data.token);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 