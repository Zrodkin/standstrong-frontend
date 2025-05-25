// frontend/src/context/ClassContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass,  
  getClassesByCity 
} from '../services/classService';

import { getAllCityRecords } from '../services/cityService';



const ClassContext = createContext(null);

// Export the provider component
export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 

  // Get all cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const citiesData = await getAllCityRecords(); // ✅ correct service
        setCities(citiesData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch all classes (with optional filters)
  const fetchClasses = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const classesData = await getClasses(filters);
      setClasses(classesData);
      return classesData;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific class by ID
  const fetchClassById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const classData = await getClassById(id);
      return classData;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch class');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new class (admin only)
  const addClass = async (classData) => {
    try {
      setLoading(true);
      setError(null);
      const newClass = await createClass(classData);
      setClasses([...classes, newClass]);
      return newClass;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing class (admin only)
  const editClass = async (id, classData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClass = await updateClass(id, classData);
      setClasses(classes.map(c => c._id === id ? updatedClass : c));
      return updatedClass;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update class');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a class (admin only)
  const removeClass = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteClass(id);
      setClasses(classes.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete class');
      throw err;
    } finally {
      setLoading(false);
    }
  };



  // Fetch classes by city
  const fetchClassesByCity = async (city) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCity(city);
      const cityClasses = await getClassesByCity(city);
      setClasses(cityClasses);
      return cityClasses;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch classes for ${city}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    classes,
    cities,
    selectedCity,
    loading,
    error,
    fetchClasses,
    fetchClassById,
    addClass,
    editClass,
    removeClass,
    fetchClassesByCity,
    setSelectedCity,
  };
  

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};


// Export the hook as a named function declaration instead of an arrow function
export function useClasses() {
  const context = React.useContext(ClassContext);
  if (context === null) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
}