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

// Register for a class
export const registerForClass = async (classId) => {
    try {
      // Ensure classId is a string
      const id = typeof classId === 'object' ? classId.toString() : classId;
      
      // Make the API call with the correct ID format
      const response = await api.post(`/classes/${id}/register`);
      
      // After registration, call getUserProfile to get fresh user data
      if (response.data) {
        // Import getUserProfile from authService
        const { getUserProfile } = await import('./authService');
        await getUserProfile();
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering for class:', error);
      throw error;
    }
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