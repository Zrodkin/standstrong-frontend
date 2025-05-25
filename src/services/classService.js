// frontend/src/services/classService.js
import api from './api';

// Get all classes with optional filters
export const getClasses = async (filters = {}) => {
  const response = await api.get('/classes', { params: filters });
  return response.data;
};

// Get class by ID
export const getClassById = async (id) => {
  const response = await api.get(`/classes/${id}`);
  return response.data;
};

// Create a new class (admin only)
export const createClass = async (classData) => {
  const response = await api.post('/classes', classData);
  return response.data;
};

// Update a class (admin only)
export const updateClass = async (id, classData) => {
  const response = await api.put(`/classes/${id}`, classData);
  return response.data;
};

// Delete a class (admin only)
export const deleteClass = async (id) => {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
};

// Get all cities with classes
export const getAllCities = async () => {
  const response = await api.get('/classes/cities');
  return response.data;
};

// Get classes by city
export const getClassesByCity = async (city) => {
  const response = await api.get(`/classes/cities/${city}`);
  return response.data;
};

export const getClassesByCityName = async (cityName) => {
  try {
    // Encode the city name to handle spaces or special characters in the URL path
    const encodedCityName = encodeURIComponent(cityName);
    // Uses the GET /api/classes/cities/:city endpoint
    const response = await api.get(`/classes/cities/${encodedCityName}`);
    return response.data; // response.data will contain the array of classes
  } catch (error) {
    console.error(`Error fetching classes for city ${cityName}:`, error);
    // Rethrow the error so the component can catch it
    throw error;
  }
};