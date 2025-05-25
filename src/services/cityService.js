import api from './api';

// GET all cities (e.g., for dropdowns and homepage)
export const getAllCityRecords = async () => {
  const response = await api.get('/cities'); // this becomes /api/cities
  return response.data;
};

// POST a new city (e.g., from AdminCityFormPage)
export const addCity = async (formData) => {
  const response = await api.post('/cities', formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // required for file uploads
    }
  });
  return response.data;
};

export const deleteCityById = async (id) => {
    const response = await api.delete(`/cities/${id}`);
    return response.data;
  };