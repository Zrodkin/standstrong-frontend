// client/src/pages/admin/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiBarChart2, 
  FiPlus,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { getClasses } from '../../services/classService';
import { 
  getClassAttendance, 
  getAttendanceStats, 
  createAttendanceRecord, 
  updateAttendanceStatus 
} from '../../services/attendanceService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [processingAttendance, setProcessingAttendance] = useState(false);

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await getClasses();
        setClasses(data);
        
        // If there are classes, select the first one by default
        if (data.length > 0) {
          setSelectedClass(data[0]._id);
        }
      } catch (err) {
        setError('Failed to load classes. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch attendance records when selected class changes
  useEffect(() => {
    if (selectedClass) {
      fetchAttendanceData(selectedClass);
    } else {
      setAttendanceRecords([]);
      setAttendanceStats(null);
    }
  }, [selectedClass]);

  // Function to fetch attendance data for a class
  const fetchAttendanceData = async (classId) => {
    try {
      setLoading(true);
      const [records, stats] = await Promise.all([
        getClassAttendance(classId),
        getAttendanceStats(classId)
      ]);
      
      setAttendanceRecords(records);
      setAttendanceStats(stats);
    } catch (err) {
      setError('Failed to load attendance data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new attendance record
  const handleCreateAttendanceRecord = async (e) => {
    e.preventDefault();
    
    if (!selectedClass || !newSessionDate) {
      setError('Please select a class and date.');
      return;
    }
    
    try {
      setProcessingAttendance(true);
      await createAttendanceRecord(selectedClass, newSessionDate);
      
      // Refresh attendance data
      await fetchAttendanceData(selectedClass);
      
      // Reset form
      setNewSessionDate('');
      setShowNewSessionForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create attendance record. Please try again.');
    } finally {
      setProcessingAttendance(false);
    }
  };

  // Update student attendance status
  const handleUpdateStatus = async (attendanceId, studentId, status) => {
    try {
      setProcessingAttendance(true);
      await updateAttendanceStatus(attendanceId, studentId, status);
      
      // Refresh attendance data
      await fetchAttendanceData(selectedClass);
    } catch (err) {
      setError('Failed to update attendance status. Please try again.');
    } finally {
      setProcessingAttendance(false);
    }
  };

  // Get selected class details
  const selectedClassDetails = classes.find(cls => cls._id === selectedClass);

  // Filter attendance records by search term
  const filteredRecords = searchTerm
    ? attendanceRecords.filter(record => {
        const sessionDate = new Date(record.sessionDate);
        const formattedDate = format(sessionDate, 'MMMM d, yyyy');
        return formattedDate.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : attendanceRecords;

  // Format attendance stats for chart
  const prepareChartData = () => {
    if (!attendanceStats || !attendanceStats.sessions) return [];
    
    return attendanceStats.sessions.map(session => {
      const sessionDate = new Date(session.sessionDate);
      return {
        date: format(sessionDate, 'MMM d'),
        present: session.presentCount,
        absent: session.absentCount,
        rate: session.attendanceRate
      };
    });
  };

  const chartData = prepareChartData();

  if (loading && !selectedClassDetails) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance Management
        </h1>
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

      {/* Class Selection and Controls */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                id="classSelect"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.length === 0 ? (
                  <option value="">No classes available</option>
                ) : (
                  classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.title} - {cls.city}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="w-full md:w-auto flex items-end">
              <button
                type="button"
                onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={!selectedClass}
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                Add Session
              </button>
            </div>
          </div>

          {/* New Session Form */}
          {showNewSessionForm && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Create New Attendance Session</h3>
              <form onSubmit={handleCreateAttendanceRecord}>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
                  <div className="w-full sm:w-auto flex-1">
                    <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      id="sessionDate"
                      required
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      disabled={processingAttendance}
                    >
                      {processingAttendance ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewSessionForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {selectedClassDetails && (
        <>
          {/* Class Info and Stats */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
              <h3 className="text-lg leading-6 font-medium">
                {selectedClassDetails.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-primary-100">
                {selectedClassDetails.city} | Instructor: {selectedClassDetails.instructor.name}
              </p>
            </div>

            {attendanceStats && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiCalendar className="h-10 w-10 text-primary-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Total Sessions</div>
                        <div className="text-xl font-semibold">{attendanceStats.totalSessions}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiBarChart2 className="h-10 w-10 text-primary-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Average Attendance Rate</div>
                        <div className="text-xl font-semibold">
                          {attendanceStats.sessions.length > 0 
                            ? `${(attendanceStats.sessions.reduce((acc, session) => acc + session.attendanceRate, 0) / attendanceStats.sessions.length).toFixed(1)}%`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiCheckCircle className="h-10 w-10 text-primary-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Students</div>
                        <div className="text-xl font-semibold">{attendanceStats.totalStudents}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Chart */}
                {chartData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Attendance Trends</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="present" name="Present" stackId="a" fill="#4ADE80" />
                          <Bar dataKey="absent" name="Absent" stackId="a" fill="#F87171" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Student Attendance Stats */}
            {attendanceStats && attendanceStats.studentStats && attendanceStats.studentStats.length > 0 && (
              <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Student Attendance</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceStats.studentStats.map((student) => (
                        <tr key={student.studentId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.sessionsPresent}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.sessionsAbsent}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  student.attendanceRate >= 80 ? 'bg-green-500' :
                                  student.attendanceRate >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${student.attendanceRate}%` }}
                              ></div>
                              <div className="ml-2 text-sm text-gray-900">
                                {student.attendanceRate}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Records List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Attendance Sessions
              </h3>
              <div className="mt-3 sm:mt-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by date"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="px-4 py-12 text-center">
                  <div className="inline-block w-8 h-8 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading attendance records...</p>
                </div>
              ) : (
                filteredRecords.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredRecords.map((record) => {
                      const sessionDate = new Date(record.sessionDate);
                      return (
                        <li key={record._id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {format(sessionDate, 'EEEE, MMMM d, yyyy')}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {record.attendees.length} students checked in
                              </p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                record.attendees.length === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {record.attendees.length === 0 ? 'No check-ins' : 'Active'}
                              </span>
                            </div>
                          </div>
                          
                          {selectedClassDetails && selectedClassDetails.registeredStudents && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Student Attendance</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedClassDetails.registeredStudents.map((registration) => {
                                      const student = registration.student;
                                      const isPresent = record.attendees.some(
                                        attendee => attendee.student && attendee.student._id === student._id
                                      );
                                      
                                      return (
                                        <tr key={student._id}>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                              {student.firstName} {student.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            {isPresent ? (
                                              <span className="flex items-center text-green-600">
                                                <FiCheckCircle className="h-4 w-4 mr-1" />
                                                Present
                                              </span>
                                            ) : (
                                              <span className="flex items-center text-red-600">
                                                <FiXCircle className="h-4 w-4 mr-1" />
                                                Absent
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                              {isPresent ? (
                                                <button
                                                  onClick={() => handleUpdateStatus(record._id, student._id, 'absent')}
                                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                  disabled={processingAttendance}
                                                >
                                                  Mark Absent
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() => handleUpdateStatus(record._id, student._id, 'present')}
                                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                  disabled={processingAttendance}
                                                >
                                                  Mark Present
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? "No records match your search." 
                        : "This class doesn't have any attendance records yet."}
                    </p>
                    {!searchTerm && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setShowNewSessionForm(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                          Add Session
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {!selectedClassDetails && !loading && (
        <div className="bg-white shadow rounded-lg px-4 py-12 text-center">
          <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes available</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to create classes before you can manage attendance.
          </p>
          <div className="mt-6">
            <Link
              to="/admin/classes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Create a Class
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;