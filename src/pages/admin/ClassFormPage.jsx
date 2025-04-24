// client/src/pages/admin/ClassFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { getClassById, createClass, updateClass, deleteClass } from '../../services/classService';
import { useClasses } from '../../context/ClassContext';


    

const ClassFormPage = () => {
  const { cities } = useClasses(); 
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    location: {
      address: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    instructor: {
      name: '',
      bio: ''
    },
    type: 'one-time',
    cost: 0,
    targetGender: 'any',
    targetAgeRange: {
      min: 18,
      max: 65
    },
    capacity: 10,
    schedule: [
      {
        date: '',
        startTime: '',
        endTime: ''
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load class data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchClassData = async () => {
        try {
          setLoading(true);
          setError(null);
          const classData = await getClassById(id);
          
          // Format dates and times for the form
          const formattedSchedule = classData.schedule.map(session => ({
            ...session,
            date: formatDateForInput(new Date(session.date))
          }));
          
          setFormData({
            ...classData,
            schedule: formattedSchedule
          });
        } catch (err) {
          setError('Failed to load class data. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchClassData();
    }
  }, [id, isEditMode]);

  // Helper function to format date for input field
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., "location.address")
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'targetAgeMin') {
      setFormData(prev => ({
        ...prev,
        targetAgeRange: {
          ...prev.targetAgeRange,
          min: parseInt(value) || 0
        }
      }));
    } else if (name === 'targetAgeMax') {
      setFormData(prev => ({
        ...prev,
        targetAgeRange: {
          ...prev.targetAgeRange,
          max: parseInt(value) || 0
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: name === 'cost' || name === 'capacity' 
          ? parseInt(value) || 0 
          : value
      }));
    }
  };

  // Handle schedule changes
  const handleScheduleChange = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value
      };
      return {
        ...prev,
        schedule: newSchedule
      };
    });
  };

  // Add a new schedule session
  const addScheduleSession = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        {
          date: '',
          startTime: '',
          endTime: ''
        }
      ]
    }));
  };

  // Remove a schedule session
  const removeScheduleSession = (index) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule.splice(index, 1);
      return {
        ...prev,
        schedule: newSchedule
      };
    });
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.title || !formData.city || !formData.location.address) {
        setError('Please fill out all required fields.');
        setLoading(false);
        return;
      }
      
      // Check if any schedule sessions are incomplete
      const hasIncompleteSchedule = formData.schedule.some(
        session => !session.date || !session.startTime || !session.endTime
      );
      
      if (hasIncompleteSchedule) {
        setError('Please complete all schedule sessions or remove incomplete ones.');
        setLoading(false);
        return;
      }
      
      // Format schedule dates for API
      const formattedData = {
        ...formData,
        schedule: formData.schedule.map(session => ({
          ...session,
          date: new Date(session.date)
        }))
      };
      
      if (isEditMode) {
        await updateClass(id, formattedData);
      } else {
        await createClass(formattedData);
      }
      
      // Navigate back to classes list
      navigate('/admin/classes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle class deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteClass(id);
      navigate('/admin/classes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete class. Please try again.');
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.title) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Class' : 'Create New Class'}
        </h1>
        <Link
          to="/admin/classes"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to Classes
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Basic Information */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Basic Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Class details and attributes.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Class Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Class Type
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    name="type"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="one-time">One-time</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                  Cost ($)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    min="0"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.cost}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description of the class and what students can expect.
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Location
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
      City *
    </label>
    <div className="mt-1">
      <select
        id="city"
        name="city"
        required
        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
        value={formData.city}
        onChange={handleChange}
      >
        <option value="">Select a city</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
        {/* Allow adding a new city if it's not in the list */}
        {formData.city && !cities.includes(formData.city) && (
          <option value={formData.city}>{formData.city} (New)</option>
        )}
      </select>
    </div>
  </div>

              <div className="sm:col-span-6">
                <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location.address"
                    id="location.address"
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.location.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="location.coordinates.lat" className="block text-sm font-medium text-gray-700">
                  Latitude (optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location.coordinates.lat"
                    id="location.coordinates.lat"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.location.coordinates.lat}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="location.coordinates.lng" className="block text-sm font-medium text-gray-700">
                  Longitude (optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location.coordinates.lng"
                    id="location.coordinates.lng"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.location.coordinates.lng}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Instructor Information
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="instructor.name" className="block text-sm font-medium text-gray-700">
                  Instructor Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="instructor.name"
                    id="instructor.name"
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.instructor.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="instructor.bio" className="block text-sm font-medium text-gray-700">
                  Instructor Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="instructor.bio"
                    name="instructor.bio"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.instructor.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Class Details */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Class Details
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="targetGender" className="block text-sm font-medium text-gray-700">
                  Target Gender
                </label>
                <div className="mt-1">
                  <select
                    id="targetGender"
                    name="targetGender"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.targetGender}
                    onChange={handleChange}
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="targetAgeMin" className="block text-sm font-medium text-gray-700">
                  Min Age
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="targetAgeMin"
                    id="targetAgeMin"
                    min="0"
                    max="100"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.targetAgeRange.min}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="targetAgeMax" className="block text-sm font-medium text-gray-700">
                  Max Age
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="targetAgeMax"
                    id="targetAgeMax"
                    min="0"
                    max="100"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.targetAgeRange.max}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    required
                    min="1"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Schedule
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Add dates and times for this class.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={addScheduleSession}
              >
                Add Session
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {formData.schedule.map((session, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:mb-0 last:pb-0 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Session {index + 1}</h4>
                  {formData.schedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScheduleSession(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={`schedule[${index}].date`} className="block text-sm font-medium text-gray-700">
                      Date *
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id={`schedule[${index}].date`}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={session.date}
                        onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`schedule[${index}].startTime`} className="block text-sm font-medium text-gray-700">
                      Start Time *
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        id={`schedule[${index}].startTime`}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={session.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`schedule[${index}].endTime`} className="block text-sm font-medium text-gray-700">
                      End Time *
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        id={`schedule[${index}].endTime`}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={session.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
            {isEditMode && (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-700">Confirm deletion?</span>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <FiTrash2 className="mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
            <div>
              <Link
                to="/admin/classes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                <FiSave className="mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClassFormPage;