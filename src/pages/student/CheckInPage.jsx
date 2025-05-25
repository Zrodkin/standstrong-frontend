// client/src/pages/student/CheckInPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { getClassById } from '/src/services/classService.js';
import { getClassAttendance, checkInStudent } from '/src/services/attendanceService.js';
import { useAuth } from "../../context/AuthContext.jsx";

const CheckInPage = () => {
  const { id } = useParams(); // Class ID
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class data
        const cls = await getClassById(id);
        setClassData(cls);
        
        // Check if user is registered
        const isRegistered = cls.registeredStudents.some(
          registration => registration.student._id === currentUser._id
        );
        
        if (!isRegistered) {
          setError("You're not registered for this class. Please register first.");
          setLoading(false);
          return;
        }
        
        // Fetch attendance records for this class
        const records = await getClassAttendance(id);
        setAttendanceRecords(records);
        
        // Find active sessions (today's sessions or recent ones that are still valid for check-in)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // For demo purposes, we'll consider sessions from today and the last 3 days as "active"
        // In a real app, you might use a different logic
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const active = records.filter(record => {
          const sessionDate = new Date(record.sessionDate);
          return sessionDate >= threeDaysAgo;
        });
        
        setActiveSessions(active);
      } catch (err) {
        setError('Failed to load check-in data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, currentUser]);

  const handleCheckIn = async (attendanceId) => {
    try {
      setCheckingIn(true);
      setCheckInError(null);
      
      await checkInStudent(attendanceId);
      
      setCheckInSuccess(true);
      
      // Refresh attendance records
      const records = await getClassAttendance(id);
      setAttendanceRecords(records);
      
      // Update active sessions
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const active = records.filter(record => {
        const sessionDate = new Date(record.sessionDate);
        return sessionDate >= threeDaysAgo;
      });
      
      setActiveSessions(active);
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const isUserCheckedIn = (attendanceRecord) => {
    return attendanceRecord.attendees.some(
      attendee => attendee.student === currentUser._id
    );
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
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Dashboard
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
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Check In</h1>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
          <h2 className="text-xl font-semibold">{classData.title}</h2>
          <p className="mt-1 text-sm text-primary-100">Instructor: {classData.instructor.name}</p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <FiMapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">{classData.city}, {classData.location.address}</span>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
              <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {classData.type === 'one-time' ? 'One-time' : 'Ongoing'}
              </span>
            </div>
          </div>

          {checkInSuccess && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Check-in successful! Your attendance has been recorded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {checkInError && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{checkInError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Available Check-Ins</h3>
            <div className="mt-2">
              {activeSessions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activeSessions.map((session) => {
                    const sessionDate = new Date(session.sessionDate);
                    const isCheckedIn = session.attendees.some(
                      attendee => attendee.student && attendee.student._id === currentUser._id
                    );
                    
                    return (
                      <li key={session._id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <FiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                {format(sessionDate, 'EEEE, MMMM d, yyyy')}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 ml-6">
                              Session ID: {session._id}
                            </p>
                          </div>
                          
                          {isCheckedIn ? (
                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                              <FiCheckCircle className="inline mr-1" />
                              Checked In
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(session._id)}
                              disabled={checkingIn}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {checkingIn ? 'Checking in...' : 'Check In'}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no active sessions available for check-in right now.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;