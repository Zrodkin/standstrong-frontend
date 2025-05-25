import axios from 'axios';

// Use Vite's environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Log the API URL for debugging
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api`, // <- attaches "/api" to base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
