// D:/StandStrong/frontend/src/pages/student/ClassRegistrationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClassById } from '/src/services/classService.js'; // Keep if needed, use absolute path
import { createRegistration } from '/src/services/registrationService.js';
import { format } from 'date-fns';
import { FiInfo, FiCheckCircle, FiXCircle, FiLogIn, FiLoader, FiArrowLeft, FiClock, FiMapPin, FiDollarSign, FiUsers } from 'react-icons/fi';

const ClassRegistrationPage = () => {
    const { classId } = useParams();
    // Get all context values in one place
    const { currentUser, isAuthenticated, refreshCurrentUser } = useAuth();
    const navigate = useNavigate();

    const [classDetails, setClassDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState('idle'); // 'idle', 'loading', 'alreadyRegistered', 'classFull', 'success', 'error', 'loginRequired'

    // Fetch class details on component mount
    const fetchClassDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        setRegistrationStatus('loading');
        try {
            const data = await getClassById(classId);
            setClassDetails(data);
            // Determine initial registration status after fetching details
            if (!isAuthenticated) {
                setRegistrationStatus('loginRequired');
            } else if (data.registeredStudents?.some(reg => reg.student?._id === currentUser?._id)) {
                setRegistrationStatus('alreadyRegistered');
            } else if (data.registeredStudents?.length >= data.capacity) {
                setRegistrationStatus('classFull');
            } else {
                setRegistrationStatus('idle'); // Can register
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load class details.');
            setRegistrationStatus('error');
        } finally {
            setLoading(false);
        }
    }, [classId, isAuthenticated, currentUser]);

    useEffect(() => {
        fetchClassDetails();
    }, [fetchClassDetails]);

    const handleRegistration = async () => {
        if (registrationStatus !== 'idle' || isSubmitting) return;
    
        setIsSubmitting(true);
        setError('');
        try {
          console.log("Starting registration for class:", classId);
    
          // --- CHANGE THIS LINE ---
          // const response = await registerForClass(classId); // OLD FUNCTION CALL
          const response = await createRegistration(classId); // NEW FUNCTION CALL
          // --- END CHANGE ---
    
          console.log("Registration response:", response); // Response from createRegistration
    
          // --- DELETE THIS BLOCK ---
          // // Manually update localStorage
          // const userData = JSON.parse(localStorage.getItem('user')) || {};
          // if (!userData.registeredClasses) {
          //   userData.registeredClasses = [];
          // }
          // if (!userData.registeredClasses.includes(classId)) {
          //   userData.registeredClasses.push(classId);
          //   localStorage.setItem('user', JSON.stringify(userData));
          //   console.log("Updated localStorage with new class ID");
          // }
          // --- END DELETE ---
    
          setRegistrationStatus('success');
    
          // Optional: Refresh user's registration list if needed for UI updates elsewhere
          // Example: If you have a fetchUserRegistrations function available:
          // fetchUserRegistrations();
    
        } catch (err) {
          console.error("Registration error:", err);
          setError(err.response?.data?.message || 'Registration failed. Please try again.');
          setRegistrationStatus('error');
        } finally {
          setIsSubmitting(false);
        }
      };


    // Helper to format schedule (basic example)
    const formatSchedule = (schedule) => {
       if (!schedule || schedule.length === 0) return 'Schedule TBD';
       // Example: Format first session date/time
       const firstSession = schedule[0];
       try {
         return `${format(new Date(firstSession.date), 'EEE, MMM d, yyyy')} at ${firstSession.startTime}`;
       } catch {
         return 'Invalid date';
       }
    };

    // --- Render Logic ---

    if (loading) {
        return <div className="text-center p-10"><FiLoader className="animate-spin h-8 w-8 mx-auto text-primary-600" /></div>;
    }

    if (error && !classDetails) { // Show general fetch error only if class details failed to load
        return (
            <div className="text-center p-10 bg-red-50 border border-red-200 rounded-md max-w-md mx-auto">
                <FiXCircle className="h-8 w-8 mx-auto text-red-500 mb-3" />
                <p className="text-red-700 font-medium">Error loading class details:</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <Link to="/classes" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
                    &larr; Back to Classes
                </Link>
            </div>
        );
    }

    if (!classDetails) {
        // Should ideally be covered by error state, but as a fallback
        return <div className="text-center p-10">Class not found.</div>;
    }

    // --- Display Class Info and Registration Status/Button ---
    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
             <Link to={`/classes/${classId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
                <FiArrowLeft className="mr-1 h-4 w-4" /> Back to Class Details
            </Link>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                 <div className="p-6 border-b border-gray-200">
                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{classDetails.title}</h1>
                     <p className="mt-1 text-sm text-gray-500">Instructor: {classDetails.instructor?.name || 'TBD'}</p>
                 </div>

                 <div className="p-6 space-y-4">
                      {/* Display key class details for confirmation */}
                      <div className="flex items-start space-x-3">
                          <FiClock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                              <h3 className="text-sm font-medium text-gray-900">Schedule</h3>
                              <p className="text-sm text-gray-600">{formatSchedule(classDetails.schedule)} ({classDetails.type})</p>
                          </div>
                      </div>
                      <div className="flex items-start space-x-3">
                          <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                           <div>
                              <h3 className="text-sm font-medium text-gray-900">Location</h3>
                              <p className="text-sm text-gray-600">{classDetails.location || 'Details TBD'}, {classDetails.city}</p>
                          </div>
                      </div>
                      <div className="flex items-start space-x-3">
                          <FiDollarSign className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                           <div>
                              <h3 className="text-sm font-medium text-gray-900">Cost</h3>
                              <p className="text-sm text-gray-600">{classDetails.cost === 0 ? 'Free' : `$${classDetails.cost}`}</p>
                          </div>
                      </div>
                      <div className="flex items-start space-x-3">
                          <FiUsers className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                           <div>
                              <h3 className="text-sm font-medium text-gray-900">Availability</h3>
                              <p className="text-sm text-gray-600">
                                  {classDetails.capacity - (classDetails.registeredStudents?.length || 0)} / {classDetails.capacity} spots remaining
                              </p>
                          </div>
                      </div>
                 </div>

                 {/* Registration Action Area */}
                 <div className="p-6 bg-gray-50 border-t border-gray-200">
                     {/* Display submission error message */}
                     {error && registrationStatus === 'error' && (
                         <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center" role="alert">
                             <FiXCircle className="h-5 w-5 mr-2 flex-shrink-0"/> {error}
                         </div>
                     )}

                     {/* Display success message */}
                     {registrationStatus === 'success' && (
                         <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center" role="alert">
                              <FiCheckCircle className="h-5 w-5 mr-2 flex-shrink-0"/> Successfully registered! You can view your classes on your dashboard.
                         </div>
                     )}

                     {registrationStatus === 'loginRequired' && (
                        <div className="text-center p-4 border border-blue-200 bg-blue-50 rounded-md">
                           <FiLogIn className="h-6 w-6 mx-auto text-blue-500 mb-2"/>
                            <p className="text-sm text-blue-700 mb-3">You must be logged in to register.</p>
                            <Link
                                to="/login"
                                state={{ from: location }} // Redirect back here after login
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Login to Register
                            </Link>
                        </div>
                     )}

                    {registrationStatus === 'alreadyRegistered' && (
                         <div className="text-center p-4 border border-green-200 bg-green-50 rounded-md">
                             <FiCheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2"/>
                             <p className="text-sm text-green-700">You are already registered for this class.</p>
                              <Link to="/dashboard" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                                 Go to Dashboard &rarr;
                             </Link>
                         </div>
                     )}

                     {registrationStatus === 'classFull' && (
                         <div className="text-center p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                            <FiInfo className="h-6 w-6 mx-auto text-yellow-500 mb-2"/>
                            <p className="text-sm text-yellow-700">Sorry, this class is currently full.</p>
                             <Link to="/classes" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                                 Find Other Classes &rarr;
                             </Link>
                         </div>
                     )}

                    {registrationStatus === 'idle' && (
                         <button
                             type="button"
                             onClick={handleRegistration}
                             disabled={isSubmitting}
                             className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                         >
                             {isSubmitting ? (
                                 <>
                                     <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                     Processing...
                                 </>
                             ) : (
                                 'Confirm Registration'
                             )}
                         </button>
                     )}

                     {/* Show generic error state if registration failed but wasn't a specific known issue */}
                      {registrationStatus === 'error' && !error && (
                           <div className="text-center p-4 border border-red-200 bg-red-50 rounded-md">
                             <FiXCircle className="h-6 w-6 mx-auto text-red-500 mb-2"/>
                              <p className="text-sm text-red-700">An unexpected error occurred during registration.</p>
                          </div>
                      )}
                 </div>
            </div>
        </div>
    );
};

export default ClassRegistrationPage;