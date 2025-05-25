// client/src/pages/student/AttendanceHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiCalendar, 
  FiMapPin, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiFilter,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useAuth } from "../../context/AuthContext.jsx";
import { getClassById } from '/src/services/classService.js';
import { getClassAttendance } from '/src/services/attendanceService.js';

const AttendanceHistoryPage = () => {
  const { currentUser } = useAuth();
  
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser || !currentUser.registeredClasses || currentUser.registeredClasses.length === 0) {
          setEnrolledClasses([]);
          setAttendanceHistory([]);
          setLoading(false);
          return;
        }

        // Fetch all enrolled classes
        const classPromises = currentUser.registeredClasses.map(classId => 
          getClassById(classId)
        );
        const classesData = await Promise.all(classPromises);
        setEnrolledClasses(classesData);

        // Fetch attendance records for all classes
        const attendancePromises = currentUser.registeredClasses.map(classId => 
          getClassAttendance(classId)
        );
        const attendanceData = await Promise.all(attendancePromises);

        // Flatten and transform attendance data
        const history = [];
        
        attendanceData.forEach((classAttendance, index) => {
          const classInfo = classesData[index];
          
          classAttendance.forEach(session => {
            const sessionDate = new Date(session.sessionDate);
            const isPresent = session.attendees.some(
              attendee => attendee.student && attendee.student._id === currentUser._id
            );
            
            history.push({
              sessionId: session._id,
              classId: classInfo._id,
              className: classInfo.title,
              city: classInfo.city,
              date: sessionDate,
              status: isPresent ? 'present' : 'absent',
            });
          });
        });
        
        // Sort by date (default: most recent first)
        history.sort((a, b) => (sortOrder === 'desc' ? b.date - a.date : a.date - b.date));
        
        setAttendanceHistory(history);
      } catch (err) {
        setError('Failed to load your attendance history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, sortOrder]);

  // Filter attendance history by class
  const filteredHistory = selectedClass === 'all'
    ? attendanceHistory
    : attendanceHistory.filter(item => item.classId === selectedClass);

  // Toggle expanded state for a session
  const toggleExpand = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
        <Link
          to="/dashboard"
          className="mt-2 sm:mt-0 text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to Dashboard
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

      {/* Filter and sort controls */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <FiFilter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {enrolledClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.title}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={toggleSortOrder}
          >
            Sort by Date
            {sortOrder === 'desc' ? (
              <FiChevronDown className="ml-2 -mr-1 h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronUp className="ml-2 -mr-1 h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredHistory.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredHistory.map((session) => (
              <li key={session.sessionId}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(session.sessionId)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {session.status === 'present' ? (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <FiCheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <FiXCircle className="h-6 w-6 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {format(session.date, 'EEEE, MMMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.className}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {session.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                        {expandedSessions[session.sessionId] ? (
                          <FiChevronUp className="ml-2 h-5 w-5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedSessions[session.sessionId] && (
                      <div className="mt-4 ml-14">
                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{session.city}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>
                              {session.status === 'present' ? 'Checked in' : 'Did not check in'}
                            </span>
                          </div>
                          <div className="sm:col-span-2 mt-2">
                            <Link
                              to={`/classes/${session.classId}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                              View Class Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {enrolledClasses.length === 0
                ? "You aren't enrolled in any classes yet."
                : "You don't have any attendance records yet."}
            </p>
            <div className="mt-6">
              <Link
                to="/classes"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {enrolledClasses.length === 0 ? "Browse Classes" : "Check In to Class"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;