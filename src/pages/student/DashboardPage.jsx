// frontend/src/pages/student/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiClipboard,
  FiBookOpen,
  FiMoon,
  FiSun,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getMyRegistrations } from '../../services/registrationService';
import { Button } from "@/components/ui/button";


// Dummy Theme Toggle State
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  return { theme, toggleTheme };
};

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

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [myRegistrationsList, setMyRegistrationsList] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setMyRegistrationsList([]);
        setUpcomingSessions([]);

        const registrations = await getMyRegistrations();
        setMyRegistrationsList(registrations || []);

        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const upcoming = [];
        
        // Log these dates for debugging
        console.log('Current week:', format(weekStart, 'MMM d'), 'to', format(weekEnd, 'MMM d'));
        (registrations || []).forEach(reg => {
            if (reg?.class?.schedule && Array.isArray(reg.class.schedule)) {
              reg.class.schedule.forEach(session => {
                try {
                  const sessionDate = new Date(session.date);
                  if (
                    session.date && 
                    !isNaN(sessionDate) && 
                    sessionDate >= weekStart && 
                    sessionDate <= weekEnd && 
                    (reg.status === 'enrolled' || reg.status === 'waitlisted')
                  ) {
                    upcoming.push({
                      registrationId: reg._id,
                      classId: reg.class._id,
                      className: reg.class.title || 'Unnamed Class',
                      city: reg.class.city || 'N/A',
                      date: sessionDate,
                      startTime: session.startTime || 'N/A',
                      endTime: session.endTime || 'N/A',
                    });
                  }
                } catch (dateError) {
                  console.error(`Error processing session date in registration ${reg._id}:`, dateError);
                }
              });
            }
          });
        upcoming.sort((a, b) => a.date - b.date);
        setUpcomingSessions(upcoming);

      } catch (err) {
        setError('Failed to load your dashboard data. Please try again later.');
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-indigo-50"></div>
        <div className="w-12 h-12 border-t-4 border-b-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5 text-yellow-400" />}
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Link
    to="/classes"
    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
  >
    Browse Classes
  </Link>
</motion.div>
          </div>
        </div>

       {/* Welcome Panel */}
<motion.div
  initial="hidden"
  animate="visible"
  variants={cardVariants}
  className="bg-indigo-100 text-indigo-900 p-5 rounded-xl shadow-inner mb-8"
>
  <h2 className="text-2xl font-bold">
    Welcome back, {currentUser?.firstName || 'Student'}! 👋
  </h2>
  <p className="mt-1">Ready to power up your next class? Let’s get to it!</p>

</motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="mb-6 bg-red-50/80 backdrop-blur-md border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Upcoming Sessions */}
          <motion.div initial="hidden" animate="visible" variants={cardVariants} className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <FiCalendar className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
            </div>
            <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              {upcomingSessions.length > 0 ? (
                <ul className="divide-y divide-gray-200/50">
                  {upcomingSessions.slice(0, 5).map(session => (
                    <li key={`${session.classId}-${session.date.toISOString()}`}>
                      <Link to={`/classes/${session.classId}`} className="block hover:bg-gray-50/30 transition-colors duration-150">
                        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                          <div className="flex items-center truncate">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                              <FiCalendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-medium text-indigo-700 truncate">{session.className}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                                <p>{session.city}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 text-right flex-shrink-0">
  <p className="text-sm font-medium text-gray-900">
    {format(session.date, 'EEE, MMM d')}
  </p>
  <p className="text-sm text-gray-500">
    {formatTime(session.startTime)} - {formatTime(session.endTime)}
  </p>
</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 text-center">
                  <h3 className="text-sm font-medium text-gray-900">No upcoming sessions</h3>
                  <p className="mt-1 text-sm text-gray-500">Your registered class schedules will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial="hidden" animate="visible" variants={cardVariants}>
            <div className="flex items-center space-x-3 mb-4">
              <FiClipboard className="h-6 w-6 text-teal-500" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center text-gray-500">
                <FiCheckCircle className="h-6 w-6 mr-3 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Attendance History</h3>
                  <p className="text-xs text-gray-500">Recent check-ins will show here.</p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500 italic">(Attendance display coming soon)</div>
            </div>
          </motion.div>

        </div>

        {/* My Enrolled Classes */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} className="mt-10">
          <div className="flex items-center space-x-3 mb-4">
            <FiBookOpen className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">My Enrolled Classes</h2>
          </div>

          {myRegistrationsList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myRegistrationsList.map(reg => reg.class && (
                <motion.div key={reg._id} initial="hidden" animate="visible" variants={cardVariants} className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="px-4 py-5 sm:p-6 flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">
                      <Link to={`/classes/${reg.class._id}`}>
                        {reg.class.title || 'Unnamed Class'}
                        <span className={`ml-2 inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                          reg.status === 'enrolled' ? 'bg-green-200 text-green-800' :
                          reg.status === 'waitlisted' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {reg.status.replace('_', ' ')}
                        </span>
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Instructor: {reg.class.instructor?.name || 'TBD'}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span>{reg.class.city || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span>Registered: {format(new Date(reg.registrationDate), 'P')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 sm:px-6 bg-gray-50/50 border-t border-gray-200/50">
                    <div className="grid grid-cols-2 gap-3">
                      <Link to={`/check-in/${reg.class._id}`} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <FiCheckCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Check In
                      </Link>
                      <Link to={`/classes/${reg.class._id}`} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300/50 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white/50 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={cardVariants} className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl px-4 py-12 text-center hover:shadow-2xl transition-all duration-300">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes enrolled</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't enrolled in any classes yet.</p>
              <div className="mt-6">
                <Link to="/classes" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  Find Classes to Join
                </Link>
              </div>
            </motion.div>
          )}

        </motion.div>

      </div>
    </div>
  );
};

export default DashboardPage;
