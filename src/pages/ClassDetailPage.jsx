// client/src/pages/ClassDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers, 
  FiClock, 
  FiUserCheck, 
  FiAlertCircle 
} from 'react-icons/fi';
import { getClassById, registerForClass } from '../services/classService';
import { useAuth } from '../context/AuthContext';

const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClassById(id);
        setClassData(data);
      } catch (err) {
        setError('Failed to load class details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/classes/${id}`);
      return;
    }

    try {
      setRegistering(true);
      setRegisterError(null);
      await registerForClass(id);
      setRegisterSuccess(true);
      
      // Refresh class data to update enrolled count
      const updatedClass = await getClassById(id);
      setClassData(updatedClass);
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Failed to register for class. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const isUserRegistered = () => {
    if (!currentUser || !classData) return false;
    return classData.registeredStudents.some(
      registration => registration.student._id === currentUser._id
    );
  };

  const isClassFull = () => {
    if (!classData) return false;
    return classData.registeredStudents.length >= classData.capacity;
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return [];
    
    return schedule.map(session => ({
      date: format(new Date(session.date), 'EEEE, MMMM d, yyyy'),
      time: `${session.startTime} - ${session.endTime}`
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/classes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Class not found</h2>
        <p className="mt-2 text-gray-600">The class you're looking for doesn't exist or has been removed.</p>
        <div className="mt-6">
          <Link
            to="/classes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Browse Classes
          </Link>
        </div>
      </div>
    );
  }

  const scheduleItems = formatSchedule(classData.schedule);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Class Header */}
        <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{classData.title}</h2>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              classData.type === 'one-time' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {classData.type === 'one-time' ? 'One-time' : 'Ongoing'}
            </span>
          </div>
          <p className="mt-1 text-primary-100">Instructor: {classData.instructor.name}</p>
        </div>

        {/* Class Details */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="md:col-span-2">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-3">About This Class</h3>
                <p>{classData.description}</p>
                
                <h4 className="text-lg font-semibold mt-6 mb-3">Instructor Bio</h4>
                <p>{classData.instructor.bio || "No instructor bio available."}</p>
                
                <h4 className="text-lg font-semibold mt-6 mb-3">Schedule</h4>
                {scheduleItems.length > 0 ? (
                  <div className="space-y-2">
                    {scheduleItems.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <FiCalendar className="mt-1 mr-2 h-5 w-5 text-primary-500" />
                        <div>
                          <div className="font-medium">{item.date}</div>
                          <div className="text-gray-500">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No schedule information available.</p>
                )}
              </div>
            </div>

            {/* Right Column - Meta & Register */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMapPin className="flex-shrink-0 mr-2 h-5 w-5 text-primary-500" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-gray-500">{classData.city}</div>
                    <div className="text-gray-500">{classData.location.address}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUsers className="flex-shrink-0 mr-2 h-5 w-5 text-primary-500" />
                  <div>
                    <div className="font-medium">Enrollment</div>
                    <div className="text-gray-500">
                      {classData.registeredStudents.length} / {classData.capacity} enrolled
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiDollarSign className="flex-shrink-0 mr-2 h-5 w-5 text-primary-500" />
                  <div>
                    <div className="font-medium">Cost</div>
                    <div className="text-gray-500">
                      {classData.cost === 0 ? 'Free' : `$${classData.cost}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiUserCheck className="flex-shrink-0 mr-2 h-5 w-5 text-primary-500" />
                  <div>
                    <div className="font-medium">Target</div>
                    <div className="text-gray-500">
                      {classData.targetGender === 'any' 
                        ? 'Open to all genders' 
                        : `${classData.targetGender} only`}
                    </div>
                    <div className="text-gray-500">
                      Ages {classData.targetAgeRange.min} to {classData.targetAgeRange.max}
                    </div>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {registerSuccess ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            You've successfully registered for this class!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : registerError ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FiAlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{registerError}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {isUserRegistered() ? (
                    <div className="mt-4 text-center">
                      <div className="bg-primary-50 rounded-md p-4 text-primary-800">
                        <FiUserCheck className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">You're registered for this class!</p>
                        <Link
                          to="/dashboard"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View in Dashboard
                        </Link>
                      </div>
                    </div>
                  ) : isClassFull() ? (
                    <div className="text-center">
                      <button
                        disabled
                        className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                      >
                        Class Full
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        This class has reached its capacity.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {registering ? 'Registering...' : 'Register for Class'}
                      </motion.button>
                      {!isAuthenticated && (
                        <p className="mt-2 text-sm text-gray-500">
                          You'll need to log in to register.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/classes"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Classes
        </Link>
      </div>
    </div>
  );
};

export default ClassDetailPage;