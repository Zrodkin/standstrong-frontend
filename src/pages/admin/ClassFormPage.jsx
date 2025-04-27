// src/pages/admin/ClassFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiTrash2, FiX, FiUpload, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { getClassById, createClass, updateClass, deleteClass } from '../../services/classService';
import { useClasses } from '../../context/ClassContext';
import PlacesAutocompleteInput from '../../components/PlacesAutocompleteInput';
import api from '../../services/api'; // <== for uploading files

const ClassFormPage = () => {
  const { cities } = useClasses();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    location: { address: '' },
    instructor: { name: '', bio: '' },
    type: 'one-time',
    cost: 0,
    targetGender: 'any',
    targetAgeRange: { min: 18, max: '' }, // Max optional
    capacity: 10,
    schedule: [{ date: '', startTime: '', endTime: '' }],
    registrationType: 'internal',
    externalRegistrationLink: '',
    partnerLogo: '',
  });

  // New helper states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hasMaxAge, setHasMaxAge] = useState(true);

  
  
  // Repeat Weekly settings
  const [repeatSettings, setRepeatSettings] = useState({
    enabled: false,
    startDate: '',
    numberOfClasses: '',
    startTime: '',
    endTime: '',
  });
  // Load class data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchClassData = async () => {
        try {
          setLoading(true);
          const classData = await getClassById(id);

          setFormData({
            ...classData,
            targetAgeRange: {
              min: classData.targetAgeRange?.min || 0,
              max: classData.targetAgeRange?.max || '',
            },
          });
          setHasMaxAge(!!classData.targetAgeRange?.max); // If max exists, enable
        } catch (err) {
          console.error(err);
          setError('Failed to load class.');
        } finally {
          setLoading(false);
        }
      };
      fetchClassData();
    }
  }, [id, isEditMode]);

  
  

  // Helper to format date for input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const uploadPartnerLogo = async (e) => {
    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
  
    try {
      setUploadingLogo(true);
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        partnerLogo: data.filePath || data.path,
      }));
    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError('Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
  };
  
// Handle input changes
const handleChange = (e) => {
  const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else if (name === 'targetAgeMin') {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, min: parseInt(value) || 0 }
      }));
    } else if (name === 'targetAgeMax') {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, max: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
};

 // --- NEW: Function to process the link on Blur ---
 const handleLinkBlur = (e) => {
  // Get the current value directly from the state, as handleChange updated it
  const currentValue = formData.externalRegistrationLink;
  let processedValue = currentValue.trim(); // Remove leading/trailing whitespace

  // Check if the link is not empty and doesn't already have a protocol
  if (processedValue && !processedValue.startsWith('http://') && !processedValue.startsWith('https://')) {
    // Prepend https:// if protocol is missing
    processedValue = `https://${processedValue}`;
    // Update state specifically for this field if it changed
    if (processedValue !== currentValue) {
       setFormData((prev) => ({ ...prev, externalRegistrationLink: processedValue }));
    }
  }
   // Optional: If the value IS empty after trimming, ensure state is empty string
   else if (!processedValue && currentValue) {
       setFormData((prev) => ({ ...prev, externalRegistrationLink: '' }));
   }
};

// Handle schedule changes
const handleScheduleChange = (index, field, value) => {
  const newSchedule = [...formData.schedule];
  newSchedule[index][field] = value;
  setFormData((prev) => ({ ...prev, schedule: newSchedule }));
};

// Add a new empty session manually
const addScheduleSession = () => {
  setFormData((prev) => ({
    ...prev,
    schedule: [...prev.schedule, { date: '', startTime: '', endTime: '' }]
  }));
};

// Remove a session
const removeScheduleSession = (index) => {
  const newSchedule = [...formData.schedule];
  newSchedule.splice(index, 1);
  setFormData((prev) => ({ ...prev, schedule: newSchedule }));
};

const generateRepeatedSessions = () => {
  if (!repeatSettings.startDate || !repeatSettings.numberOfClasses || !repeatSettings.startTime || !repeatSettings.endTime) {
    console.error('Missing fields for generating sessions');
    return;
  }

  const sessions = [];
  let current = new Date(repeatSettings.startDate);

  for (let i = 0; i < repeatSettings.numberOfClasses; i++) {
    sessions.push({
      date: formatDateForInput(current),
      startTime: repeatSettings.startTime,
      endTime: repeatSettings.endTime,
    });

    current.setDate(current.getDate() + 7); // Add 7 days each time
  }

  setFormData((prev) => ({ ...prev, schedule: sessions }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.city || !formData.location.address) {
      setError('Please fill out all required fields.');
      setLoading(false);
      return;
    }

    const formattedData = { ...formData };

    // If no max age, remove it
    if (!hasMaxAge) {
      formattedData.targetAgeRange.max = undefined;
    }

    if (isEditMode) {
      await updateClass(id, formattedData);
    } else {
      await createClass(formattedData);
    }

    navigate('/admin/classes');
  } catch (err) {
    console.error(err);
    setError('Failed to save class.');
  } finally {
    setLoading(false);
  }
};


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
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Class Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="one-time">Defender Course</option>
                <option value="ongoing">Seminar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select a City</option>
                {cities.map(city => (
                  <option key={city._id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <PlacesAutocompleteInput
                onAddressSelect={(selected) =>
                  setFormData((prev) => ({ ...prev, location: { address: selected.address } }))
                }
                initialValue={formData.location.address}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            ></textarea>
          </div>
        </section>

        {/* Instructor Info */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Instructor</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Instructor Name *</label>
              <input
                type="text"
                name="instructor.name"
                value={formData.instructor.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instructor Bio</label>
              <textarea
                name="instructor.bio"
                rows="4"
                value={formData.instructor.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Registration Info */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Registration Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Type</label>
              <select
                name="registrationType"
                value={formData.registrationType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="internal">Use StandStrong Form</option>
                <option value="external">Redirect to Partner Website</option>
              </select>
            </div>

            {formData.registrationType === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Partner Registration URL</label>
              <input
                type="url"
                name="externalRegistrationLink"
                value={formData.externalRegistrationLink}
                onChange={handleChange} // Keep the original onChange
                onBlur={handleLinkBlur}   // <---- ADD THIS LINE
                placeholder="partnerwebsite.com/register" // <-- Optional: Changed placeholder
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          )}
          </div>

          {/* Upload Partner Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Partner Logo Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={uploadPartnerLogo}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadingLogo && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
            {formData.partnerLogo && (
              <img src={formData.partnerLogo} alt="Partner Logo" className="h-24 mt-4 rounded shadow" />
            )}
          </div>
        </section>
        {/* Target Audience */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Audience</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Audience Type</label>
              <select
                name="targetGender"
                value={formData.targetGender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="any">Co-ed Class</option>
                <option value="male">Men's Class</option>
                <option value="female">Women's Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
              <input
                type="number"
                name="targetAgeMin"
                value={formData.targetAgeRange.min}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Age?</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasMaxAge}
                  onChange={(e) => setHasMaxAge(e.target.checked)}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Max Age</span>
              </div>
              {hasMaxAge && (
                <input
                  type="number"
                  name="targetAgeMax"
                  value={formData.targetAgeRange.max}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                />
              )}
            </div>
          </div>
        </section>

        {/* Schedule Builder */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">Schedule</h2>

          {/* Repeat Weekly Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={repeatSettings.enabled}
                onChange={(e) =>
                  setRepeatSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Repeat Weekly (Auto-generate sessions)</span>
            </div>

            {repeatSettings.enabled && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">Start Date *</label>
      <input
        type="date"
        value={repeatSettings.startDate}
        onChange={(e) =>
          setRepeatSettings((prev) => ({ ...prev, startDate: e.target.value }))
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Number of Classes *</label>
      <input
        type="number"
        min="1"
        value={repeatSettings.numberOfClasses}
        onChange={(e) =>
          setRepeatSettings((prev) => ({ ...prev, numberOfClasses: e.target.value }))
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        placeholder="e.g. 6"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Start Time *</label>
      <input
        type="time"
        value={repeatSettings.startTime}
        onChange={(e) =>
          setRepeatSettings((prev) => ({ ...prev, startTime: e.target.value }))
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">End Time *</label>
      <input
        type="time"
        value={repeatSettings.endTime}
        onChange={(e) =>
          setRepeatSettings((prev) => ({ ...prev, endTime: e.target.value }))
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </div>

    <div className="flex items-end">
      <button
        type="button"
        onClick={generateRepeatedSessions}
        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
      >
        <FiRefreshCw className="mr-2" /> Generate Sessions
      </button>
    </div>
  </div>
)}

          </div>

          {/* Manual Schedule List */}
          <div className="space-y-6">
            {formData.schedule.map((session, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                  <input
                    type="time"
                    value={session.startTime}
                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time *</label>
                  <input
                    type="time"
                    value={session.endTime}
                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>

                {formData.schedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleSession(index)}
                    className="text-red-500 hover:text-red-700 text-sm mt-4"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Manual Session */}
          <div className="pt-6">
            <button
              type="button"
              onClick={addScheduleSession}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
            >
              <FiPlus className="mr-2" /> Add Another Session
            </button>
          </div>
        </section>

        {/* Save/Cancel */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/admin/classes"
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md text-sm"
          >
            {loading ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassFormPage;
