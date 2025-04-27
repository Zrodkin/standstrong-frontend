// frontend/pages/ClassDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers,
  FiDollarSign, FiUserCheck, FiExternalLink, FiHome, FiInfo,
  FiAlertCircle, FiCheckCircle, FiX, FiLoader
} from 'react-icons/fi';
import { useAuth } from '/src/context/AuthContext.jsx';
import { format } from 'date-fns';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// --- Import Services Directly ---
import { getClassById } from '/src/services/classService.js';
import { createRegistration, getMyRegistrations } from '/src/services/registrationService.js';

// --- Reusable Components ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-lg font-semibold text-slate-700">Loading Class Details</p>
    <p className="text-sm text-slate-500">Please wait a moment...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex flex-col items-center text-center max-w-md mx-auto my-10 shadow-sm">
    <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <p className="text-lg font-semibold text-red-800 mb-2">{message || 'An error occurred.'}</p>
    <p className="text-sm text-slate-600 mb-6">We couldn't load the class details. Please check your connection or try again.</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center"
      >
        <FiArrowLeft className="mr-2 h-4 w-4" /> Try Again
      </button>
    )}
    <Link to="/classes" className="mt-4 text-sm text-blue-600 hover:underline">
      Back to Classes
    </Link>
  </div>
);
const ConfirmationModal = ({ isOpen, onClose, onConfirm, classTitle, isLoading }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Confirm Registration</h2>
              <button onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50" aria-label="Close modal">
                <FiX size={24} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              You are about to register for the class: <strong className="text-slate-800">{classTitle}</strong>. Please confirm to proceed.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto disabled:opacity-50">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (<><FiLoader className="animate-spin mr-2" /> Registering...</>) : ('Confirm Registration')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [classData, setClassData] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyRegs, setLoadingMyRegs] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  // --- Fetch Class ---
  const fetchClassData = useCallback(async () => {
    setError(null);
    setRegisterSuccess(false);
    setRegisterError(null);
    setLoading(true);
    nprogress.start();
    try {
      const data = await getClassById(id);
      setClassData(data);
    } catch (err) {
      console.error("Fetch Class Error:", err);
      setError(err.response?.data?.message || 'Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
      nprogress.done();
    }
  }, [id]);

  const fetchUserRegistrations = useCallback(async () => {
    if (!isAuthenticated) {
      setMyRegistrations([]);
      setLoadingMyRegs(false);
      return;
    }
    setLoadingMyRegs(true);
    try {
      const regs = await getMyRegistrations();
      setMyRegistrations(regs || []);
    } catch (err) {
      console.error("Failed to fetch user registrations", err);
      setMyRegistrations([]);
    } finally {
      setLoadingMyRegs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchClassData();
    fetchUserRegistrations();
  }, [id, fetchClassData, fetchUserRegistrations]);
  // --- Image Helpers ---
  const getFullImageUrl = (partialUrl) => {
    if (!partialUrl) return '';
    if (partialUrl.startsWith('http')) return partialUrl;
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const formattedPartialUrl = partialUrl.startsWith('/') ? partialUrl : `/${partialUrl}`;
    if (!apiBaseUrl || apiBaseUrl === '/') return formattedPartialUrl;
    if (apiBaseUrl.endsWith('/')) return `${apiBaseUrl.slice(0, -1)}${formattedPartialUrl}`;
    return `${apiBaseUrl}${formattedPartialUrl}`;
  };

  const handleImageError = (e) => {
    console.warn('Failed to load image:', e.target.src);
    if (!e.target.dataset.fallbackAttempted && classData?.partnerLogo) {
      const fallbackUrl = classData.partnerLogo.startsWith('/') ? classData.partnerLogo : `/${classData.partnerLogo}`;
      e.target.src = fallbackUrl;
      e.target.dataset.fallbackAttempted = 'true';
    } else {
      console.warn('Fallback failed or no logo path, hiding image element.');
      e.target.style.display = 'none';
    }
  };

  // --- Registration ---
  const handleOpenConfirmation = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/classes/${id}`);
      return;
    }
    setRegisterError(null);
    setRegisterSuccess(false);
    setIsConfirming(true);
  };

  const handleConfirmRegister = async () => {
    if (!isAuthenticated) return;
    setRegistering(true);
    setRegisterError(null);
    nprogress.start();
    try {
      await createRegistration(id);
      setRegisterSuccess(true);
      setIsConfirming(false);
      fetchUserRegistrations();
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.response?.status === 409) {
        setRegisterError(err.response?.data?.message || 'Registration conflict. Class may be full.');
      } else {
        setRegisterError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
      setIsConfirming(false);
    } finally {
      setRegistering(false);
      nprogress.done();
    }
  };
  // --- Helpers ---
  const isUserRegistered = useCallback(() => {
    if (!isAuthenticated || loadingMyRegs || !classData) return false;
    return myRegistrations.some(
      reg => reg.class?._id === classData._id &&
             (reg.status === 'enrolled' || reg.status === 'waitlisted')
    );
  }, [isAuthenticated, loadingMyRegs, myRegistrations, classData]);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    try {
      const [hour, minute] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hour, minute);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error("Error formatting time:", timeStr, e);
      return 'Invalid time';
    }
  };

  const googleMapsUrl = classData?.location?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(classData.location.address)}`
    : null;

  // --- Render ---
  if (loading || loadingMyRegs) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchClassData} />;
  }

  if (!classData) {
    return <ErrorMessage message="Class not found or could not be loaded." onRetry={() => navigate('/classes')} />;
  }

  const alreadyRegistered = isUserRegistered();
  const isExternal = classData.registrationType === 'external';
  const schedule = classData.schedule || [];
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 text-sm">
          <Link to="/" className="text-slate-500 hover:text-blue-600 flex items-center">
            <FiHome className="mr-1.5 h-4 w-4" /> Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/classes" className="text-slate-500 hover:text-blue-600">Classes</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate" title={classData.title}>
            {classData.title}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 sm:py-20 overflow-hidden">
        {classData.imageUrl && (
          <img
            src={getFullImageUrl(classData.imageUrl)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            onError={handleImageError}
          />
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            {classData.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto"
          >
            Led by: <span className="font-semibold">{classData.instructor?.name || 'Instructor TBD'}</span>
          </motion.p>
          {classData.partnerLogo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 inline-block bg-white p-2 rounded-lg shadow-md max-h-24"
            >
              <img
                src={getFullImageUrl(classData.partnerLogo)}
                alt={`${classData.partnerName || 'Partner'} Logo`}
                className="h-16 sm:h-20 object-contain"
                onError={handleImageError}
              />
            </motion.div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-12 gap-y-10">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                About This Class
              </h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-700">
                <p>{classData.description || "No description provided."}</p>
              </div>
            </section>

            {/* Schedule Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-5 border-b border-slate-200 pb-2">
                Schedule
              </h2>
              {schedule.length > 0 ? (
                <ul className="space-y-5">
                  {schedule.map((session, idx) => (
                    <li key={idx} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <FiCalendar className="text-blue-500 mt-1 flex-shrink-0 h-5 w-5" />
                      <div>
                        <p className="text-slate-900 font-semibold">
                          {format(new Date(session.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-slate-600 text-sm">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <FiInfo className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-700">Schedule details are not yet available. Please check back later.</p>
                </div>
              )}
            </section>
          </div>
          {/* Right Column */}
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-5">
              <h3 className="text-xl font-bold text-slate-800 mb-5 border-b border-slate-200 pb-2">
                Class Details
              </h3>

              {/* Location */}
              <div className="flex items-start space-x-4">
                <FiMapPin className="text-blue-500 mt-1 flex-shrink-0 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Location</p>
                  {classData.location?.name ? (
                    <>
                      <p className="text-slate-800 font-medium">{classData.location.name}</p>
                      {classData.location?.address && (
                        <p className="text-sm text-slate-600">{classData.location.address}</p>
                      )}
                    </>
                  ) : classData.location?.address ? (
                    <p className="text-slate-800 font-medium">{classData.location.address}</p>
                  ) : (
                    <p className="text-slate-500 italic">Location To Be Announced</p>
                  )}
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      View on Google Maps <FiExternalLink className="inline ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <hr className="border-slate-100" />

              {/* Audience */}
              <div className="flex items-start space-x-4">
                <FiUsers className="text-blue-500 mt-1 flex-shrink-0 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Audience</p>
                  <p className="text-slate-800 font-medium">
                    {classData.targetGender === 'male' && "Men's Class"}
                    {classData.targetGender === 'female' && "Women's Class"}
                    {classData.targetGender === 'any' && "Open to All (Co-ed)"}
                  </p>
                </div>
              </div>
              <hr className="border-slate-100" />
              {/* Cost */}
              <div className="flex items-start space-x-4">
                <FiDollarSign className="text-blue-500 mt-1 flex-shrink-0 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Cost</p>
                  <p className="text-slate-800 font-bold">
                    {classData.cost === 0 ? 'Free' : `$${classData.cost}`}
                  </p>
                </div>
              </div>
              <hr className="border-slate-100" />

              {/* Capacity */}
              {classData.capacity != null && (
                <div className="flex items-start space-x-4">
                  <FiUsers className="text-blue-500 mt-1 flex-shrink-0 h-5 w-5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Capacity</p>
                    <p className="text-slate-800 font-medium">{classData.capacity} students</p>
                  </div>
                </div>
              )}

              {/* Registration Section */}
              <div className="pt-5">
                {registerSuccess && (
                  <div className="flex items-center bg-green-50 p-3 rounded-md text-green-800 mb-4 border border-green-200 text-sm">
                    <FiCheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    Successfully Registered! You're all set.
                  </div>
                )}
                {registerError && (
                  <div className="flex items-center bg-red-50 p-3 rounded-md text-red-800 mb-4 border border-red-200 text-sm">
                    <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    {registerError}
                  </div>
                )}

                {alreadyRegistered ? (
                  <div className="text-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <FiUserCheck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold text-blue-800">You are registered for this class!</p>
                    <Link to="/dashboard" className="mt-2 inline-block text-sm text-blue-600 hover:underline font-medium">
                      View in Dashboard
                    </Link>
                  </div>
                ) : isExternal ? (
                  <a
                    href={classData.externalRegistrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Register on Partner Site <FiExternalLink className="ml-2 h-4 w-4"/>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenConfirmation}
                    disabled={isConfirming || registering}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAuthenticated ? 'Register for Class' : 'Login to Register'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleConfirmRegister}
        classTitle={classData?.title || ''}
        isLoading={registering}
      />

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 text-center py-8 mt-16 sm:mt-24 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm">
          © {new Date().getFullYear()} StandStrong . All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ClassDetailPage;
