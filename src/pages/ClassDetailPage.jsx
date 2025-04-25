// client/src/pages/ClassDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign, FiCheckCircle,
  FiAlertCircle, FiClipboard, FiSun, FiMoon, FiCoffee, FiUserCheck, FiLogIn, FiHome
} from 'react-icons/fi';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 border-solid rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading Class Details...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry, showBackButton = true }) => (
  <div className="bg-red-100 border border-red-300 p-6 rounded-lg flex flex-col items-center">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
      <FiAlertCircle className="h-12 w-12 text-red-600" />
    </motion.div>
    <p className="text-lg font-bold text-red-800 mt-4">{message || 'An error occurred.'}</p>
    <div className="flex space-x-4 mt-6">
      {showBackButton && (
        <Link to="/classes" className="text-blue-600 hover:underline flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Classes
        </Link>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start space-x-3">
    <Icon className="text-blue-500 mt-1 h-5 w-5" />
    <div>
      <dt className="text-sm font-semibold text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-800 text-sm">{children || value}</dd>
    </div>
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

  const fetchClassData = async () => {
    try {
      nprogress.start();
      setLoading(true);
      setError(null);
      setRegisterSuccess(false);
      setRegisterError(null);
      const data = await fetchClassById(id);
      setClassData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 404) {
        setError('Class not found.');
      } else {
        setError('Failed to load class details.');
      }
    } finally {
      setLoading(false);
      nprogress.done();
    }
  };

  useEffect(() => {
    fetchClassData();
    // eslint-disable-next-line
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/classes/${id}`);
      return;
    }
    try {
      setRegistering(true);
      setRegisterError(null);
      setRegisterSuccess(false);
      await registerClass(id);
      setRegisterSuccess(true);
      setTimeout(fetchClassData, 100);
    } catch (err) {
      console.error("Registration error:", err);
      setRegisterError(err.response?.data?.message || 'Failed to register.');
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

  const isClassFull = () => {
    if (!classData?.registeredStudents || typeof classData?.capacity !== 'number') return false;
    return classData.registeredStudents.length >= classData.capacity;
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return [];
    return schedule.map(session => ({
      date: format(new Date(session.date), 'EEEE, MMM d, yyyy'),
      time: `${session.startTime} - ${session.endTime}`
    }));
  };

  const getDayTimeIcon = (startTime) => {
    if (!startTime) return FiClock;
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 12) return FiSun;
    if (hour < 17) return FiCoffee;
    return FiMoon;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchClassData} />;
  if (!classData) return <ErrorMessage message="Could not load class data." />;

  const scheduleItems = formatSchedule(classData.schedule);
  const alreadyRegistered = isUserRegistered();
  const classIsFull = isClassFull();
  const spotsAvailable = classData.capacity - (classData.registeredStudents?.length ?? 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2">
          <Link to="/" className="text-gray-400 hover:text-gray-600 flex items-center">
            <FiHome className="mr-1" /> Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/classes" className="text-gray-400 hover:text-gray-600">Classes</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-semibold truncate">{classData.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 sm:py-24">
        {classData.imageUrl && (
          <img src={classData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
        )}
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.6 }}
            className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 ${
              classData.type === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
            {classData.type?.replace('-', ' ') || 'Class'}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {classData.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-lg text-blue-100">
            Led by: {classData.instructor?.name || 'Instructor TBD'}
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md hover:shadow-2xl border border-gray-100 transition-shadow duration-300 mb-8 lg:mb-0">
            
            {/* About Section */}
            <section aria-labelledby="class-description-title">
              <h2 id="class-description-title" className="text-2xl font-bold text-gray-800 mb-6">About This Class</h2>
              <div className="prose prose-lg prose-blue max-w-none text-gray-700">
                <p>{classData.description || "No description provided."}</p>
              </div>
            </section>

            {/* Schedule Section */}
            <section aria-labelledby="class-schedule-title" className="mt-10 pt-10 border-t border-gray-200">
              <h2 id="class-schedule-title" className="text-2xl font-bold text-gray-800 mb-6">Schedule</h2>
              {scheduleItems.length > 0 ? (
                <ul className="space-y-6">
                  {scheduleItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FiCalendar className="flex-shrink-0 mr-3 h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <p className="text-base font-semibold text-gray-900">{item.date}</p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          {React.createElement(getDayTimeIcon(item.time?.split(' - ')[0]), { className: "mr-2 h-4 w-4" })}
                          {item.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Schedule details will be announced soon.</p>
              )}
            </section>

            {/* Instructor Info */}
            {classData.instructor && (
              <section aria-labelledby="instructor-info-title" className="mt-10 pt-10 border-t border-gray-200">
                <h2 id="instructor-info-title" className="text-2xl font-bold text-gray-800 mb-6">Meet Your Instructor</h2>
                <div className="flex items-start space-x-6">
                  {classData.instructor.imageUrl && (
                    <img
                      src={classData.instructor.imageUrl}
                      alt={classData.instructor.name}
                      onError={(e) => e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=?'}
                      className="h-20 w-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-300"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{classData.instructor.name}</h3>
                    <p className="mt-2 text-gray-600">{classData.instructor.bio || "No biography provided."}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Requirements */}
            {(classData.prerequisites || classData.whatToBring) && (
              <section aria-labelledby="class-requirements-title" className="mt-10 pt-10 border-t border-gray-200">
                <h2 id="class-requirements-title" className="text-2xl font-bold text-gray-800 mb-6">Requirements & Preparation</h2>
                <dl className="space-y-6">
                  {classData.prerequisites && (
                    <InfoItem icon={FiClipboard} label="Prerequisites">
                      {classData.prerequisites}
                    </InfoItem>
                  )}
                  {classData.whatToBring && (
                    <InfoItem icon={FiCoffee} label="What to Bring">
                      {classData.whatToBring}
                    </InfoItem>
                  )}
                </dl>
              </section>
            )}
          </div>

          {/* Right Column: Registration Box */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md hover:shadow-2xl border border-gray-100 transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Class Overview</h2>
              <dl className="space-y-6 divide-y divide-gray-200">
                <InfoItem icon={FiMapPin} label="Location">
                  {classData.location?.address ? (
                    <>
                      <p>{classData.location.address}</p>
                      {classData.city && <p>{classData.city}</p>}
                      {classData.location?.mapLink && (
                        <a href={classData.location.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Map</a>
                      )}
                    </>
                  ) : 'Location TBD'}
                </InfoItem>
                <InfoItem icon={FiUsers} label="Enrollment">
                  {classData.capacity ? `${classData.registeredStudents?.length ?? 0} / ${classData.capacity}` : 'Capacity TBD'}
                  {!classIsFull && spotsAvailable <= 5 && spotsAvailable > 0 && (
                    <span className="ml-2 text-xs text-yellow-600 font-bold">(Only {spotsAvailable} spot{spotsAvailable !== 1 ? 's' : ''} left!)</span>
                  )}
                </InfoItem>
                <InfoItem icon={FiDollarSign} label="Cost">
                  {classData.cost === 0 ? 'Free' : `$${classData.cost}`}
                </InfoItem>
                <InfoItem icon={FiUserCheck} label="Audience">
                  {classData.targetGender === 'any' ? 'Open to all' : `${classData.targetGender} focused`}
                  {classData.targetAgeRange && ` (Ages ${classData.targetAgeRange.min}-${classData.targetAgeRange.max})`}
                </InfoItem>
              </dl>

              {/* Registration Button Area */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                {registerSuccess && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center bg-green-100 p-3 rounded-lg text-green-800 mb-4"
                  >
                    <FiCheckCircle className="h-6 w-6 mr-2" />
                    Successfully Registered!
                  </motion.div>
                )}
                {registerError && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center bg-red-100 p-3 rounded-lg text-red-800 mb-4"
                  >
                    <FiAlertCircle className="h-6 w-6 mr-2" />
                    {registerError}
                  </motion.div>
                )}

                {alreadyRegistered ? (
                  <div className="bg-blue-50 p-4 text-center rounded-lg text-blue-700">
                    <FiUserCheck className="h-6 w-6 mx-auto mb-2" />
                    You are registered!
                    <Link to="/dashboard" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                      View in Dashboard
                    </Link>
                  </div>
                ) : classIsFull ? (
                  <button className="w-full bg-gray-400 text-white py-3 rounded-md cursor-not-allowed" disabled>
                    <FiAlertCircle className="inline-block mr-2" />
                    Class Full
                  </button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleRegister}
                    disabled={registering}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-md text-white font-semibold transition ${
                      registering ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {registering ? 'Registering...' : isAuthenticated ? 'Register for Class' : 'Login to Register'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 text-center py-6 mt-16">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} StandStrong Self-Defense | Boston, MA. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default ClassDetailPage;
