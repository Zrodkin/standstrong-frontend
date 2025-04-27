// src/pages/ClassDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiUserCheck,
  FiExternalLink,
  FiHome
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';
import { format } from 'date-fns';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading Class Details...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-300 p-6 rounded-lg flex flex-col items-center">
    <FiArrowLeft className="h-12 w-12 text-red-600 animate-pulse" />
    <p className="text-lg font-bold text-red-800 mt-4">{message || 'An error occurred.'}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    )}
  </div>
);
const ClassDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useAuth();
    const { fetchClassById, registerClass } = useClasses();
  
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [registerError, setRegisterError] = useState(null);
  
    const getFullImageUrl = (partialUrl) => {
      if (!partialUrl) return '';
      
      // If it's already a complete URL (starts with http/https), use it as is
      if (partialUrl.startsWith('http')) return partialUrl;
      
      // First approach: Use environment variable API URL
      const apiBaseUrl = import.meta.env.VITE_API_URL;
      
      // Second approach: Dynamically determine the backend URL
      const backendUrl = (() => {
        // If API URL is explicitly defined, use it
        if (apiBaseUrl) return apiBaseUrl;
        
        // For same-origin deployments, use relative URL (works in both dev and prod)
        return '';
      })();
      
      // Ensure there's no double slash when combining URLs
      const formattedPartialUrl = partialUrl.startsWith('/') 
        ? partialUrl 
        : `/${partialUrl}`;
      
      return `${backendUrl}${formattedPartialUrl}`;
    };

    const fetchClassData = async () => {
      try {
        nprogress.start();
        setLoading(true);
        const data = await fetchClassById(id);
        setClassData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load class details.');
      } finally {
        setLoading(false);
        nprogress.done();
      }
    };
  
    useEffect(() => {
      fetchClassData();
      // eslint-disable-next-line
    }, [id]);
  
    useEffect(() => {
      if (classData) {
        console.log('Partner logo path:', classData.partnerLogo);
      }
    }, [classData]);

    const handleRegister = async () => {
      if (!isAuthenticated) {
        navigate(`/login?redirect=/classes/${id}`);
        return;
      }
      try {
        setRegistering(true);
        await registerClass(id);
        setRegisterSuccess(true);
        setTimeout(fetchClassData, 500); // Refresh after register
      } catch (err) {
        console.error(err);
        setRegisterError(err.response?.data?.message || 'Registration failed.');
      } finally {
        setRegistering(false);
      }
    };
  
    const isUserRegistered = () => {
      if (!isAuthenticated || !currentUser || !classData?.registeredStudents) return false;
      return classData.registeredStudents.some(
        reg => reg.student && reg.student._id === currentUser._id
      );
    };
  
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      const [hour, minute] = timeStr.split(':').map(Number);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = (hour % 12) || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };


  
    const googleMapsUrl = classData?.location?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(classData.location.address)}`
      : null;
      if (loading) return <LoadingSpinner />;
      if (error) return <ErrorMessage message={error} onRetry={fetchClassData} />;
      if (!classData) return <ErrorMessage message="Class not found." />;
    
      const alreadyRegistered = isUserRegistered();
      const isExternal = classData.registrationType === 'external';
      const schedule = classData.schedule || [];
      
      return (
        <div className="bg-gray-50 min-h-screen">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center space-x-2">
              <Link to="/" className="text-gray-400 hover:text-gray-600 flex items-center">
                <FiHome className="mr-1" /> Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/classes" className="text-gray-400 hover:text-gray-600">Classes</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-semibold">{classData.title}</span>
            </div>
          </div>
    
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 sm:py-24">
            {classData.imageUrl && (
              <img src={classData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
            )}
            <div className="relative max-w-4xl mx-auto px-4 text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-extrabold">
                {classData.title}
              </motion.h1>
    
              {classData.partnerLogo && (
  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
    <img 
      src={getFullImageUrl(classData.partnerLogo)} 
      alt="Partner Logo" 
      className="h-20 mx-auto mt-6 rounded shadow-md bg-white p-2"
      onError={(e) => {
        // REPLACE THIS ENTIRE FUNCTION with the improved error handling
        console.error('Failed to load logo:', e.target.src);
        
        // Try a fallback approach - sometimes removing the domain helps
        const fallbackUrl = classData.partnerLogo.startsWith('/') 
          ? classData.partnerLogo 
          : `/${classData.partnerLogo}`;
          
        // Only try fallback if it's different from the original
        if (e.target.src !== fallbackUrl) {
          console.log('Trying fallback URL:', fallbackUrl);
          e.target.src = fallbackUrl;
        } else {
          // If fallback also fails, hide the image
          console.log('Fallback also failed, hiding image');
          e.target.style.display = 'none';
        }
      }}
    />
  </motion.div>
)}
    
              <p className="mt-4 text-lg text-blue-100">
                Led by: {classData.instructor?.name || 'Instructor TBD'}
              </p>
            </div>
          </div>
    
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-8">
            
            {/* Left Column (About, Schedule) */}
            <div className="lg:col-span-2 space-y-10">
              {/* About Class */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Class</h2>
                <div className="prose prose-lg text-gray-700">
                  <p>{classData.description || "No description provided."}</p>
                </div>
              </section>
    
              {/* Schedule */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Schedule</h2>
                {schedule.length > 0 ? (
                  <ul className="space-y-6">
                    {schedule.map((session, idx) => (
                      <li key={idx} className="flex items-center space-x-4">
                        <FiCalendar className="text-blue-500" />
                        <div>
                          <p className="text-gray-900 font-semibold">{format(new Date(session.date), 'EEE, MMM d, yyyy')}</p>
                          <p className="text-gray-600 text-sm">{formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Schedule details coming soon.</p>
                )}
              </section>
            </div>
    
            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
                {/* Location */}
                <div className="flex items-center space-x-4">
                  <FiMapPin className="text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Location</p>
                    <p className="text-gray-800">{classData.location?.address || 'TBD'}</p>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-blue-600 text-sm hover:underline"
                      >
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
    
                {/* Audience - Gender as Heading */}
                <div className="flex items-center space-x-4">
                  <FiUsers className="text-blue-500" />
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {classData.targetGender === 'male' && "Men's Class"}
                      {classData.targetGender === 'female' && "Women's Class"}
                      {classData.targetGender === 'any' && "Co-ed Class"}
                    </p>
                  </div>
                </div>
    
                {/* Cost */}
                <div className="flex items-center space-x-4">
                  <FiDollarSign className="text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Cost</p>
                    <p className="text-gray-800">{classData.cost === 0 ? 'Free' : `$${classData.cost}`}</p>
                  </div>
                </div>
    
                {/* Register Button */}
                <div className="pt-6">
                  {registerSuccess && (
                    <div className="flex items-center bg-green-100 p-3 rounded-lg text-green-800 mb-4">
                      <FiUserCheck className="h-6 w-6 mr-2" />
                      Successfully Registered!
                    </div>
                  )}
                  {registerError && (
                    <div className="flex items-center bg-red-100 p-3 rounded-lg text-red-800 mb-4">
                      <FiExternalLink className="h-6 w-6 mr-2" />
                      {registerError}
                    </div>
                  )}
    
                  {alreadyRegistered ? (
                    <div className="text-center bg-blue-50 p-4 rounded-lg text-blue-700">
                      <FiUserCheck className="h-6 w-6 mx-auto mb-2" />
                      You're registered!
                      <Link to="/dashboard" className="mt-3 inline-block text-sm text-blue-600 hover:underline">View Dashboard</Link>
                    </div>
                  ) : isExternal ? (
                    <a
                      href={classData.externalRegistrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Register on Partner Site
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {registering ? 'Registering...' : isAuthenticated ? 'Register for Class' : 'Login to Register'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
    
          {/* Footer */}
          <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 text-center py-6 mt-16">
            <div className="text-sm">&copy; {new Date().getFullYear()} StandStrong Self-Defense. All rights reserved.</div>
          </footer>
        </div>
      );
    };
    
    export default ClassDetailPage;
      