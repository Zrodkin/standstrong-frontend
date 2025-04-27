// src/pages/admin/ClassFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiTrash2, FiX, FiUpload, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { getClassById, createClass, updateClass, deleteClass } from '../../services/classService';
import { useClasses } from '../../context/ClassContext';
import PlacesAutocompleteInput from '../../components/PlacesAutocompleteInput';
import api from '../../services/api'; // <== for uploading files

const SERVER_BASE_URL = 'https://standstrong.onrender.com';

// Helper function to construct full URL from relative path
const constructFullUrl = (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string' || !relativePath.startsWith('/')) {
    // Return empty or original if it's not a valid relative path starting with '/'
    // or if it already seems like a full URL
    if (typeof relativePath === 'string' && (relativePath.startsWith('http') || relativePath.startsWith('data:'))) {
         return relativePath;
    }
    return '';
  }
  // Prepend the server base URL
  return `${SERVER_BASE_URL}${relativePath}`;
};

// Helper function to get relative path from potentially full URL
const getRelativePath = (fullUrl) => {
    if (!fullUrl || typeof fullUrl !== 'string') return '';
    // Check if it starts with the known base URL and remove it
    if (fullUrl.startsWith(SERVER_BASE_URL)) {
        let path = fullUrl.substring(SERVER_BASE_URL.length);
        // Ensure it starts with a slash
        return path.startsWith('/') ? path : `/${path}`;
    }
    // If it doesn't start with the base URL but looks like a relative path, return it
    if (fullUrl.startsWith('/')) {
        return fullUrl;
    }
    // Otherwise, we cannot reliably determine the relative path
    console.warn("Could not determine relative path for:", fullUrl);
    return fullUrl; // Return original as fallback, might cause issues if backend expects relative
}

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

  // Helper to format date for input - Moved outside useEffect for potential reuse
  const formatDateForInput = (date) => {
     if (!date) return ''; // Handle null or undefined dates
     try {
       const d = new Date(date);
       // Add timezone offset to prevent date potentially shifting across midnight
       // when converting to ISO string in different timezones. Test carefully!
       const offset = d.getTimezoneOffset();
       const adjustedDate = new Date(d.getTime() - (offset*60*1000));
       return adjustedDate.toISOString().split('T')[0];
     } catch (e) {
        console.error("Error formatting date:", date, e);
        return ''; // Return empty string if date is invalid
     }
  };


  // Load class data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchClassData = async () => {
        try {
          setLoading(true);
          setError(null); // Clear previous errors
          const classData = await getClassById(id);
          // --- Construct Full Logo URL for Fetched Data ---
const fetchedRelativePath = classData.partnerLogo || ''; // e.g., "/uploads/..."
const fullLogoUrlForFetched = constructFullUrl(fetchedRelativePath); // Use helper
// --- End Logo URL Construction ---

          // --- MODIFIED SECTION START ---
          setFormData(prevData => ({ // Use functional update
            ...prevData, // Keep previous state as base
            ...classData, // Spread fetched data over it (handles most fields)
            partnerLogo: fullLogoUrlForFetched,

            // Explicitly handle schedule: Use fetched schedule or default
            schedule: classData.schedule && classData.schedule.length > 0
              ? classData.schedule.map(session => ({
                  // Ensure date exists and format it correctly
                  date: session.date ? formatDateForInput(session.date) : '',
                  startTime: session.startTime || '', // Provide fallback
                  endTime: session.endTime || '',   // Provide fallback
                }))
              : [{ date: '', startTime: '', endTime: '' }], // Default if no schedule fetched or empty

            // Explicitly handle nested objects with defaults
            targetAgeRange: {
              min: classData.targetAgeRange?.min || 0, // Use optional chaining and default
              max: classData.targetAgeRange?.max || '', // Use optional chaining and default
            },
            location: classData.location || { address: '' }, // Default if missing
            instructor: classData.instructor || { name: '', bio: '' }, // Default if missing

            // Ensure other potentially missing fields have defaults if needed
            title: classData.title || '',
            description: classData.description || '',
            city: classData.city || '',
            type: classData.type || 'one-time',
            cost: classData.cost || 0,
            targetGender: classData.targetGender || 'any',
            capacity: classData.capacity || 10,
            registrationType: classData.registrationType || 'internal',
            externalRegistrationLink: classData.externalRegistrationLink || '',
            

          }));
          // --- MODIFIED SECTION END ---

          // Update hasMaxAge based on the potentially updated targetAgeRange.max
          setHasMaxAge(!!(classData.targetAgeRange?.max)); // Use optional chaining

        } catch (err) {
          console.error("Error fetching class data:", err); // More specific log
          setError('Failed to load class data. Please try again.'); // User-friendly error
        } finally {
          setLoading(false);
        }
      };
      fetchClassData();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]); // Keep dependencies as they are


  const uploadPartnerLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setUploadingLogo(true);
      setError(null);
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedRelativePath = data.filePath || data.path || '';
      const fullLogoUrlAfterUpload = constructFullUrl(uploadedRelativePath);

      // Log before setting state
      console.log('[uploadPartnerLogo] Attempting to set logo state to:', fullLogoUrlAfterUpload);

      // Set state with log inside (using explicit return)
      setFormData((prev) => { // Start block body {
        console.log('[uploadPartnerLogo] Updating state. New logo URL:', fullLogoUrlAfterUpload); // Log inside
        return { // Use explicit return
          ...prev,
          partnerLogo: fullLogoUrlAfterUpload,
        };
      }); // End block body }

    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError('Logo upload failed.');
    } finally {
      console.log('[uploadPartnerLogo] Setting uploadingLogo to false.');
      setUploadingLogo(false);
    }
  };
  
// Handle input changes
const handleChange = (e) => {
  const { name, value, type, checked } = e.target; // Include type and checked for checkboxes

    // Handle nested properties like instructor.name or targetAgeRange.min
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    }
    // Specific handling for age range direct inputs if needed (though covered by dot notation above)
    else if (name === 'targetAgeMin') {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, min: parseInt(value) || 0 }
      }));
    } else if (name === 'targetAgeMax') {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, max: value === '' ? '' : parseInt(value) || '' } // Allow empty string
      }));
    }
    // Handle checkboxes (like hasMaxAge, though that has its own state)
    else if (type === 'checkbox') {
         setFormData((prev) => ({ ...prev, [name]: checked }));
    }
    // Handle standard inputs
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
};

 // --- Function to process the link on Blur ---
 const handleLinkBlur = (e) => {
  const currentValue = formData.externalRegistrationLink || ''; // Default to empty string
  let processedValue = currentValue.trim();

  if (processedValue && !processedValue.startsWith('http://') && !processedValue.startsWith('https://')) {
    processedValue = `https://${processedValue}`;
    if (processedValue !== currentValue) {
       setFormData((prev) => ({ ...prev, externalRegistrationLink: processedValue }));
    }
  }
   else if (!processedValue && currentValue) {
       setFormData((prev) => ({ ...prev, externalRegistrationLink: '' }));
   }
};

// Handle schedule changes for date, startTime, endTime
const handleScheduleChange = (index, field, value) => {
  const newSchedule = [...formData.schedule];
  // Create a new object for the session to ensure state update immutability
  newSchedule[index] = { ...newSchedule[index], [field]: value };
  setFormData((prev) => ({ ...prev, schedule: newSchedule }));
};

// Add a new empty session manually
const addScheduleSession = () => {
  // Prevent adding if the last session is completely empty? (Optional check)
  // const lastSession = formData.schedule[formData.schedule.length - 1];
  // if (lastSession && !lastSession.date && !lastSession.startTime && !lastSession.endTime) {
  //   return; // Don't add another empty one yet
  // }

  setFormData((prev) => ({
    ...prev,
    schedule: [...prev.schedule, { date: '', startTime: '', endTime: '' }] // Add new empty session
  }));
};

// Remove a session
const removeScheduleSession = (index) => {
  // Prevent removing the last session if it's the only one (optional)
  // if (formData.schedule.length <= 1) return;

  const newSchedule = formData.schedule.filter((_, i) => i !== index); // Use filter for immutability

  // If the schedule becomes empty after removal, add back one empty session
  if (newSchedule.length === 0) {
       setFormData((prev) => ({ ...prev, schedule: [{ date: '', startTime: '', endTime: '' }] }));
  } else {
       setFormData((prev) => ({ ...prev, schedule: newSchedule }));
  }
};

// Generate repeated weekly sessions
const generateRepeatedSessions = () => {
  setError(null); // Clear previous errors
  const { startDate, numberOfClasses, startTime, endTime } = repeatSettings;

  if (!startDate || !numberOfClasses || !startTime || !endTime) {
    setError('Please fill in all fields for generating weekly sessions (Start Date, Number of Classes, Start Time, End Time).');
    return;
  }

  const numClasses = parseInt(numberOfClasses);
  if (isNaN(numClasses) || numClasses <= 0) {
     setError('Number of classes must be a positive number.');
     return;
  }


  const sessions = [];
  try {
      // Use a date object that correctly interprets the input date string
      // Adjust for potential timezone issues if needed, similar to formatDateForInput
      const start = new Date(startDate);
      const offset = start.getTimezoneOffset();
      let current = new Date(start.getTime() + (offset*60*1000)); // Adjust to treat date as local

      for (let i = 0; i < numClasses; i++) {
        sessions.push({
          date: formatDateForInput(current), // Use the robust formatter
          startTime: startTime,
          endTime: endTime,
        });

        // Increment date by 7 days
        current.setDate(current.getDate() + 7);
      }

       // Overwrite the existing schedule with the generated ones
      setFormData((prev) => ({ ...prev, schedule: sessions }));

  } catch (err) {
       console.error("Error generating repeated sessions:", err);
       setError("Failed to generate sessions. Check the start date format.");
  }
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null); // Clear previous errors

  // Basic validation
  if (!formData.title || !formData.city || !formData.location?.address || !formData.instructor?.name) {
    setError('Please fill out all required fields: Title, City, Address, Instructor Name.');
    return;
  }
   if (!formData.schedule || formData.schedule.length === 0 || !formData.schedule[0].date || !formData.schedule[0].startTime || !formData.schedule[0].endTime) {
       setError('Please add at least one valid schedule entry (Date, Start Time, End Time).');
       return;
   }
   // Add more specific validation as needed

  try {
    setLoading(true);

    // --- Convert logo URL back to relative path for backend ---
    const relativeLogoPathToSend = getRelativePath(formData.partnerLogo); // Use helper

    // Prepare data for submission
    const formattedData = {
          ...formData, // Spread other data first
          // --- Use the relative path expected by the backend ---
          partnerLogo: relativeLogoPathToSend, // Explicitly use the converted path
          // --- End Use Relative Path ---
          // Ensure numeric fields are numbers
          cost: parseFloat(formData.cost) || 0,
          capacity: parseInt(formData.capacity) || 0,
          targetAgeRange: {
            min: parseInt(formData.targetAgeRange.min) || 0,
            max: hasMaxAge && formData.targetAgeRange.max ? parseInt(formData.targetAgeRange.max) : undefined,
          },
         };

    // Remove max age if checkbox is unchecked
    if (!hasMaxAge) {
      formattedData.targetAgeRange.max = undefined;
    }
    // Remove external link if registration is internal
     if (formData.registrationType === 'internal') {
         formattedData.externalRegistrationLink = undefined;
     }


    if (isEditMode) {
      await updateClass(id, formattedData);
    } else {
      await createClass(formattedData);
    }

    navigate('/admin/classes'); // Redirect on success
  } catch (err) {
    console.error('Failed to save class:', err);
    // Provide more specific error if possible (e.g., from err.response.data)
    setError(err.response?.data?.message || 'Failed to save class. An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
};

console.log('Logo URL in State:', formData.partnerLogo); // <-- ADD THIS LINE


  // --- JSX Structure ---
  return (
    <div>
      {/* Header */}
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading Indicator (Optional Full Page Overlay) */}
      {/* {loading && <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"><p className="text-white">Loading...</p></div>} */}


      <form onSubmit={handleSubmit} className="space-y-10">

        {/* --- Basic Information Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Class Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                aria-describedby="title-required"
              />
               <p className="mt-1 text-xs text-gray-500" id="title-required">Required.</p>
            </div>
            {/* Class Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Class Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="one-time">Defender Course</option>
                <option value="ongoing">Seminar</option>
                {/* Add other types as needed */}
              </select>
            </div>
             {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 aria-describedby="city-required"
              >
                <option value="">Select a City</option>
                {cities.map(city => (
                  <option key={city._id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
               <p className="mt-1 text-xs text-gray-500" id="city-required">Required.</p>
            </div>
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
              {/* Ensure PlacesAutocompleteInput accepts id and forwards required if needed */}
              <PlacesAutocompleteInput
                 id="address"
                onAddressSelect={(selected) =>
                  setFormData((prev) => ({ ...prev, location: { address: selected.address } }))
                }
                initialValue={formData.location.address}
                 aria-describedby="address-required"
              />
                <p className="mt-1 text-xs text-gray-500" id="address-required">Required.</p>
            </div>
            {/* Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost ($)</label>
              <input
                id="cost"
                type="number"
                name="cost"
                 min="0"
                 step="0.01" // Allow cents
                value={formData.cost}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
             {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity *</label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                 min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 aria-describedby="capacity-required"
              />
               <p className="mt-1 text-xs text-gray-500" id="capacity-required">Required.</p>
            </div>
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               aria-describedby="description-required"
            ></textarea>
             <p className="mt-1 text-xs text-gray-500" id="description-required">Required.</p>
          </div>
        </section>

        {/* --- Instructor Info Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Instructor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructor Name */}
            <div>
              <label htmlFor="instructor.name" className="block text-sm font-medium text-gray-700">Instructor Name *</label>
              <input
                id="instructor.name"
                type="text"
                name="instructor.name" // Use dot notation for nested state
                value={formData.instructor.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 aria-describedby="instructor-required"
              />
               <p className="mt-1 text-xs text-gray-500" id="instructor-required">Required.</p>
            </div>
            {/* Instructor Bio */}
            <div>
              <label htmlFor="instructor.bio" className="block text-sm font-medium text-gray-700">Instructor Bio</label>
              <textarea
                id="instructor.bio"
                name="instructor.bio" // Use dot notation
                rows="4"
                value={formData.instructor.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        </section>

        {/* --- Registration Info Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
           <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Registration Settings</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Type */}
               <div>
                  <label htmlFor="registrationType" className="block text-sm font-medium text-gray-700">Registration Type</label>
                   <select
                     id="registrationType"
                     name="registrationType"
                     value={formData.registrationType}
                     onChange={handleChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                   >
                     <option value="internal">Use StandStrong Form</option>
                     <option value="external">Redirect to Partner Website</option>
                   </select>
               </div>
                {/* External URL (Conditional) */}
               {formData.registrationType === 'external' && (
               <div>
                   <label htmlFor="externalRegistrationLink" className="block text-sm font-medium text-gray-700">Partner Registration URL</label>
                   <input
                     id="externalRegistrationLink"
                     type="url" // Use type="url" for basic browser validation
                     name="externalRegistrationLink"
                     value={formData.externalRegistrationLink}
                     onChange={handleChange}
                     onBlur={handleLinkBlur} // Add https:// on blur if missing
                     placeholder="https://partnerwebsite.com/register"
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                   />
                     <p className="mt-1 text-xs text-gray-500">Required if registration type is 'Redirect'. Ensure it starts with http:// or https://.</p>
               </div>
             )}
           </div>
            {/* Partner Logo Upload */}
           <div>
             <label htmlFor="partnerLogoFile" className="block text-sm font-medium text-gray-700 mb-1">Partner Logo (Optional)</label>
             <input
               id="partnerLogoFile"
               type="file"
               accept="image/png, image/jpeg, image/gif, image/webp" // Be specific about accepted types
               onChange={uploadPartnerLogo}
               className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
             />
             {uploadingLogo && <p className="text-sm text-indigo-600 mt-2 animate-pulse">Uploading logo...</p>}
             {/* Display current logo */}
             {formData.partnerLogo && !uploadingLogo && (
                 <div className="mt-4">
                     <p className="text-sm font-medium text-gray-700">Current Logo:</p>
                    <img src={formData.partnerLogo} alt="Partner Logo Preview" className="h-24 w-auto mt-2 rounded border border-gray-200 shadow-sm" />
                 </div>
             )}
              <p className="mt-1 text-xs text-gray-500">Upload an image file (PNG, JPG, GIF, WEBP). Max size X MB (if applicable).</p>
           </div>
        </section>

         {/* --- Target Audience Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
           <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Target Audience</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"> {/* Use items-start */}
                {/* Audience Type (Gender) */}
               <div>
                   <label htmlFor="targetGender" className="block text-sm font-medium text-gray-700">Audience Type</label>
                   <select
                     id="targetGender"
                     name="targetGender"
                     value={formData.targetGender}
                     onChange={handleChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                   >
                     <option value="any">Co-ed Class</option>
                     <option value="male">Men Only</option>
                     <option value="female">Women Only</option>
                   </select>
               </div>
                {/* Minimum Age */}
               <div>
                   <label htmlFor="targetAgeMin" className="block text-sm font-medium text-gray-700">Minimum Age</label>
                   <input
                     id="targetAgeMin"
                     type="number"
                     name="targetAgeRange.min" // Use dot notation
                     min="0"
                     value={formData.targetAgeRange.min}
                     onChange={handleChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                   />
               </div>
                {/* Maximum Age (Conditional) */}
               <div className="space-y-2"> {/* Group checkbox and input */}
                   <label className="block text-sm font-medium text-gray-700">Maximum Age</label>
                   <div className="flex items-center">
                     <input
                       id="hasMaxAge"
                       type="checkbox"
                       checked={hasMaxAge}
                       onChange={(e) => setHasMaxAge(e.target.checked)}
                       className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                       aria-describedby="max-age-label"
                     />
                     <label htmlFor="hasMaxAge" id="max-age-label" className="ml-2 block text-sm text-gray-900">
                       Set Maximum Age
                     </label>
                   </div>
                   {/* Conditionally render Max Age Input */}
                   {hasMaxAge && (
                     <input
                       id="targetAgeMax"
                       type="number"
                       name="targetAgeRange.max" // Use dot notation
                       min={formData.targetAgeRange.min || 0} // Min should be at least min age
                       value={formData.targetAgeRange.max}
                       onChange={handleChange}
                       placeholder="e.g. 65"
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     />
                   )}
               </div>
           </div>
        </section>

         {/* --- Schedule Builder Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Schedule</h2>

            {/* Repeat Weekly Generator */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
                 <legend className="text-sm font-medium text-gray-700 px-1">Generate Weekly Sessions (Optional)</legend>
                 <div className="space-y-4 mt-2">
                     <div className="flex items-center">
                       <input
                         id="repeatEnabled"
                         type="checkbox"
                         checked={repeatSettings.enabled}
                         onChange={(e) => setRepeatSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                         aria-describedby="repeat-label"
                       />
                       <label htmlFor="repeatEnabled" id="repeat-label" className="ml-2 block text-sm text-gray-900">
                         Enable Generator
                       </label>
                     </div>

                    {/* Generator Inputs (Conditional) */}
                     {repeatSettings.enabled && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end border-t pt-4 mt-4">
                         <div>
                           <label htmlFor="repeatStartDate" className="block text-xs font-medium text-gray-700">Start Date *</label>
                           <input
                             id="repeatStartDate"
                             type="date"
                             value={repeatSettings.startDate}
                             onChange={(e) => setRepeatSettings((prev) => ({ ...prev, startDate: e.target.value }))}
                             required={repeatSettings.enabled} // Required only if generator enabled
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                         <div>
                           <label htmlFor="repeatNumClasses" className="block text-xs font-medium text-gray-700"># Classes *</label>
                           <input
                             id="repeatNumClasses"
                             type="number"
                             min="1"
                             value={repeatSettings.numberOfClasses}
                             onChange={(e) => setRepeatSettings((prev) => ({ ...prev, numberOfClasses: e.target.value }))}
                             required={repeatSettings.enabled}
                             placeholder="e.g., 6"
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                          <div>
                           <label htmlFor="repeatStartTime" className="block text-xs font-medium text-gray-700">Start Time *</label>
                           <input
                             id="repeatStartTime"
                             type="time"
                              step="900" // 15 min increments
                             value={repeatSettings.startTime}
                             onChange={(e) => setRepeatSettings((prev) => ({ ...prev, startTime: e.target.value }))}
                             required={repeatSettings.enabled}
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                         <div>
                           <label htmlFor="repeatEndTime" className="block text-xs font-medium text-gray-700">End Time *</label>
                           <input
                             id="repeatEndTime"
                             type="time"
                              step="900" // 15 min increments
                             value={repeatSettings.endTime}
                             onChange={(e) => setRepeatSettings((prev) => ({ ...prev, endTime: e.target.value }))}
                             required={repeatSettings.enabled}
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                         {/* Generate Button */}
                         <div>
                           <button
                             type="button"
                             onClick={generateRepeatedSessions}
                             disabled={!repeatSettings.startDate || !repeatSettings.numberOfClasses || !repeatSettings.startTime || !repeatSettings.endTime}
                             className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                           >
                             <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" /> Generate
                           </button>
                         </div>
                       </div>
                     )}
                      <p className="mt-1 text-xs text-gray-500">Check 'Enable Generator' to automatically create multiple weekly sessions below. This will replace any manually entered sessions.</p>
                 </div>
            </fieldset>

            {/* Manual Schedule List */}
            <div className="space-y-4 border-t pt-4 mt-6">
                 <h3 className="text-md font-medium text-gray-800">Class Sessions</h3>
                 {/* Check if schedule exists and has items before mapping */}
                {formData.schedule && formData.schedule.length > 0 ? (
                     formData.schedule.map((session, index) => (
                       <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start p-3 border rounded-md relative">
                          {/* Date Input */}
                         <div>
                           <label htmlFor={`schedule-date-${index}`} className="block text-xs font-medium text-gray-700">Date *</label>
                           <input
                             id={`schedule-date-${index}`}
                             type="date"
                             value={session.date || ''} // Ensure value is controlled
                             onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                             required // Make individual sessions required
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                          {/* Start Time Input */}
                         <div>
                           <label htmlFor={`schedule-startTime-${index}`} className="block text-xs font-medium text-gray-700">Start Time *</label>
                           <input
                             id={`schedule-startTime-${index}`}
                             type="time"
                              step="900" // 15 min increments
                             value={session.startTime || ''} // Ensure value is controlled
                             onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                             required
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                          {/* End Time Input */}
                         <div>
                           <label htmlFor={`schedule-endTime-${index}`} className="block text-xs font-medium text-gray-700">End Time *</label>
                           <input
                             id={`schedule-endTime-${index}`}
                             type="time"
                             step="900" // 15 min increments
                             value={session.endTime || ''} // Ensure value is controlled
                             onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                             required
                             className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           />
                         </div>
                          {/* Remove Button */}
                         <div className="sm:absolute sm:top-2 sm:right-2"> {/* Position button */}
                            {/* Allow removing even if it's the last one, handled in removeScheduleSession */}
                             <button
                               type="button"
                               onClick={() => removeScheduleSession(index)}
                               className="inline-flex items-center justify-center p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                               title="Remove this session" // Tooltip for accessibility
                             >
                               <FiTrash2 className="h-4 w-4" />
                               <span className="sr-only">Remove Session</span> {/* Screen reader text */}
                             </button>
                         </div>
                       </div>
                     ))
                 ) : (
                     <p className="text-sm text-gray-500">No sessions added yet. Use the button below or the generator above.</p>
                 )}
            </div>

            {/* Add Manual Session Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={addScheduleSession}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Add Another Session Manually
              </button>
            </div>
        </section>

        {/* --- Save/Cancel Actions --- */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link
            to="/admin/classes"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className="inline-flex justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                    Saving...
                 </>
            ) : (isEditMode ? 'Save Changes' : 'Create Class')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassFormPage;