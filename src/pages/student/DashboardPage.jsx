// frontend/src/pages/student/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
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
import { getClassById } from '../../services/classService'; // Import the real service function

// Dummy Theme Toggle State
const useTheme = () => {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    return { theme, toggleTheme };
};


const DashboardPage = () => {
    // Use the real auth context without fallback to mock data
    const { currentUser } = useAuth();
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { theme, toggleTheme } = useTheme();


    useEffect(() => {
        const fetchDashboardData = async () => {
          if (!currentUser?._id) {
            setLoading(false);
            setError("Not logged in.");
            return;
          }
          try {
            setLoading(true);
            setError(null);
            setEnrolledClasses([]);
            setUpcomingSessions([]);
            
            console.log("Current user in dashboard:", currentUser);
            console.log("Current user from localStorage:", JSON.parse(localStorage.getItem('user')));
            
            // Get registered class IDs - check several possible places
            let registeredClassIds = [];
            
            // First, check localStorage directly in case context isn't updated
            const localStorageUser = JSON.parse(localStorage.getItem('user')) || {};
            if (Array.isArray(localStorageUser.registeredClasses) && localStorageUser.registeredClasses.length > 0) {
              registeredClassIds = localStorageUser.registeredClasses;
            } 
            // Fallback to currentUser if localStorage doesn't have registeredClasses
            else if (Array.isArray(currentUser.registeredClasses)) {
              registeredClassIds = currentUser.registeredClasses;
            }
            // If we still don't have any, check if it's in a different format
            else if (currentUser.registeredClasses && typeof currentUser.registeredClasses === 'object') {
              registeredClassIds = Object.keys(currentUser.registeredClasses);
            }
            
            console.log("User's registered classes:", registeredClassIds);
            console.log("Type of registeredClasses:", typeof currentUser.registeredClasses);
            console.log("Is array?", Array.isArray(currentUser.registeredClasses));
            
            if (registeredClassIds.length === 0) {
              setLoading(false);
              return;
            }
            
            // Fetch data for each class
            const classPromises = registeredClassIds.map(classId => getClassById(classId));
            const classesDataResults = await Promise.all(classPromises);
            const validClassesData = classesDataResults.filter(cls => cls != null);
            
            console.log("Fetched class data:", validClassesData);
            setEnrolledClasses(validClassesData);
            
            // Process upcoming sessions
            const now = new Date();
            const upcoming = [];
            validClassesData.forEach(cls => {
              if (cls?.schedule && cls.schedule.length > 0) {
                cls.schedule.forEach(session => {
                  try {
                    const sessionDate = new Date(session.date);
                    if (session.date && !isNaN(sessionDate) && sessionDate > now) {
                      upcoming.push({
                        classId: cls._id,
                        className: cls.title || 'Unnamed Class',
                        city: cls.city || 'N/A',
                        date: sessionDate,
                        startTime: session.startTime || 'N/A',
                        endTime: session.endTime || 'N/A',
                      });
                    }
                  } catch (dateError) {
                    console.error(`Error processing date for session in class ${cls._id}:`, session.date, dateError);
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


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                 {/* Point 1: Apply gradient background even to loading state */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-indigo-50"></div>
                <div className="w-12 h-12 border-t-4 border-b-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    const formatTimeRange = (start, end) => { /* ... keep helper function ... */
         if (!start || !end || start === 'N/A' || end === 'N/A') return 'Time N/A';
         return `${start} - ${end}`;
    }

    // Animation variants for Framer Motion
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        // Point 1: Apply gradient background to the main container
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6">
                    {/* Removed border-b, mb adjusted below */}
                    <div>
                        {/* Using h1 for main page title semantically */}
                        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                        {/* Removed welcome message here, moved to Welcome Panel */}
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {/* Point 7: Theme Toggle Button Placeholder */}
                        <button
                             onClick={toggleTheme}
                             className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                             aria-label="Toggle theme"
                         >
                            {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5 text-yellow-400"/>}
                        </button>
                        <Link
                            to="/classes"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Browse Classes
                        </Link>
                    </div>
                </div>

                 {/* Point 4: Welcome Panel */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants} // Use card animation
                    className="bg-indigo-100 text-indigo-900 p-5 rounded-xl shadow-inner mb-8" // Adjusted padding/margin
                >
                    <h2 className="text-2xl font-bold">Welcome back, {currentUser?.firstName || 'Student'}! 👋</h2>
                    <p className="mt-1">Ready to power up your next class? Let’s get to it!</p>
                </motion.div>

                 {/* Error Display */}
                {error && (
                    // Point 2 & 6: Apply card styling and motion to error message
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="mb-6 bg-red-50/80 backdrop-blur-md border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-lg" // Adjusted styling
                        role="alert"
                    >
                         <div className="flex">
                             <div className="flex-shrink-0">
                                 <FiAlertCircle className="h-5 w-5 text-red-500" />
                             </div>
                             <div className="ml-3">
                                 <p className="font-bold">Error</p>
                                 <p className="text-sm">{error}</p>
                             </div>
                         </div>
                    </motion.div>
                )}

                 {/* Grid for Dashboard Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Column 1: Upcoming Sessions */}
                    {/* Point 6: Apply motion */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="lg:col-span-2"
                    >
                        {/* Point 3: Icon Header */}
                        <div className="flex items-center space-x-3 mb-4">
                             <FiCalendar className="h-6 w-6 text-indigo-500" />
                             <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                        </div>
                        {/* Point 2: Apply card styling */}
                        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                            {upcomingSessions.length > 0 ? (
                                <ul className="divide-y divide-gray-200/50">
                                    {upcomingSessions.slice(0, 5).map((session) => (
                                        <li key={`${session.classId}-${session.date.toISOString()}`}>
                                            <Link to={`/classes/${session.classId}`} className="block hover:bg-gray-50/30 transition-colors duration-150">
                                                 <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                                     {/* ... (keep inner content, maybe update icons/styling) ... */}
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
                                                            {formatTimeRange(session.startTime, session.endTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                // Point 5: Engaging Empty State
                                <div className="px-4 py-12 text-center">
                                    {/* Replace src with your actual path or remove if using icon only */}
                                    <img src="/assets/no-sessions.svg" className="w-24 h-24 mx-auto text-gray-400 mb-4" alt="No sessions illustration" onError={(e) => e.target.style.display='none'} />
                                    {/* Fallback Icon if image fails or not provided */}
                                    {!document.querySelector('img[src="/assets/no-sessions.svg"]') && <FiCalendar className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />}
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
                                    <p className="mt-1 text-sm text-gray-500">Your registered class schedules will appear here.</p>
                                </div>
                            )}
                        </div>
                        {upcomingSessions.length > 5 && (
                            <div className="mt-4 text-center">
                                {/* ... View Full Schedule link ... */}
                            </div>
                        )}
                    </motion.div>

                    {/* Column 2: Recent Activity / Attendance Placeholder */}
                    {/* Point 6: Apply motion */}
                    <motion.div
                         initial="hidden"
                         animate="visible"
                         variants={cardVariants}
                         className="lg:col-span-1"
                    >
                        {/* Point 3: Icon Header */}
                        <div className="flex items-center space-x-3 mb-4">
                            <FiClipboard className="h-6 w-6 text-teal-500" /> {/* Different color */}
                            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        {/* Point 2: Apply card styling */}
                        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
                            {/* Placeholder for Attendance */}
                            <div className="flex items-center text-gray-500">
                                <FiCheckCircle className="h-6 w-6 mr-3 text-gray-400"/>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Attendance History</h3>
                                    <p className="text-xs text-gray-500">Recent check-ins will show here.</p>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-500 italic">
                                (Attendance display coming soon)
                            </div>
                             <div className="mt-4 pt-4 border-t border-gray-200/50">
                                <Link
                                    to="/attendance-history"
                                    className="block w-full text-center px-4 py-2 border border-gray-300/50 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white/50 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    View Full Attendance History
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>


                {/* Enrolled Classes Section (Full Width Below Grid) */}
                {/* Point 6: Apply motion */}
                 <motion.div
                     initial="hidden"
                     animate="visible"
                     variants={cardVariants}
                     className="mt-10"
                 >
                     {/* Point 3: Icon Header */}
                    <div className="flex items-center space-x-3 mb-4">
                         <FiBookOpen className="h-6 w-6 text-purple-500" /> {/* Different color */}
                         <h2 className="text-xl font-semibold text-gray-900">My Enrolled Classes</h2>
                    </div>
                    {enrolledClasses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {enrolledClasses.map((classItem) => (
                                // Point 2 & 6: Apply card styling and motion to each class card
                                <motion.div
                                     key={classItem._id}
                                     initial="hidden"
                                     animate="visible"
                                     variants={cardVariants}
                                     className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300"
                                >
                                     <div className="px-4 py-5 sm:p-6 flex-grow">
                                         <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">
                                             <Link to={`/classes/${classItem._id}`}>
                                                 {classItem.title || 'Unnamed Class'}
                                                 {/* Point 8: Themed Class Badge */}
                                                 <span className="ml-2 inline-block bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                     {classItem.type === 'one-time' ? 'One-time' : 'Ongoing'}
                                                 </span>
                                             </Link>
                                         </h3>
                                         <p className="mt-1 text-sm text-gray-600">
                                             Instructor: {classItem.instructor?.name || 'TBD'}
                                         </p>
                                         {/* ... other class details like location etc. ... */}
                                        <div className="mt-4 space-y-2 text-sm text-gray-500">
                                             <div className="flex items-center">
                                                 <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true"/>
                                                 <span>{classItem.city || 'N/A'}</span>
                                             </div>
                                             <div className="flex items-center">
                                                <FiUser className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true"/>
                                                <span>
                                                    {classItem.registeredStudents?.length ?? '?'}/{classItem.capacity ?? '?'} enrolled
                                                </span>
                                             </div>
                                        </div>
                                     </div>
                                     {/* Action Buttons Footer */}
                                    <div className="px-4 py-3 sm:px-6 bg-gray-50/50 border-t border-gray-200/50">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                to={`/classes/${classItem._id}#schedule`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                <FiCheckCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                Check In
                                            </Link>
                                            <Link
                                                to={`/classes/${classItem._id}`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300/50 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white/50 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        // Point 2, 5, 6: Apply card styling, motion, and engaging empty state
                         <motion.div
                             initial="hidden"
                             animate="visible"
                             variants={cardVariants}
                             className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl px-4 py-12 text-center hover:shadow-2xl transition-all duration-300"
                         >
                              {/* Replace src with your actual path or remove if using icon only */}
                             <img src="/assets/no-classes.svg" className="w-24 h-24 mx-auto text-gray-400 mb-4" alt="No classes illustration" onError={(e) => e.target.style.display='none'} />
                             {/* Fallback Icon if image fails or not provided */}
                            {!document.querySelector('img[src="/assets/no-classes.svg"]') && <FiClipboard className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />}
                             <h3 className="mt-2 text-sm font-medium text-gray-900">No classes enrolled</h3>
                             <p className="mt-1 text-sm text-gray-500">You haven't enrolled in any classes yet.</p>
                             <div className="mt-6">
                                 <Link
                                     to="/classes"
                                     className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                 >
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