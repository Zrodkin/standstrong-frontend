// frontend/src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiArrowUp, 
  FiArrowDown,
  FiBarChart2,
  FiPlusCircle
} from 'react-icons/fi';
import { getClasses } from '/src/services/classService.js';
import { getUsers } from '/src/services/userService.js'; // Use userService here!
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classesData, setClassesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalCapacity: 0,
    enrollmentRate: 0,
    citiesWithClasses: [],
    classTypes: { oneTime: 0, ongoing: 0 },
    genderDistribution: { male: 0, female: 0, nonBinary: 0, undisclosed: 0 }
  });

  const [enrollmentData, setEnrollmentData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const [classes, usersResponse] = await Promise.all([
          getClasses(),
          getUsers()
        ]);
    
        // Extract the users array from the response object
        const users = Array.isArray(usersResponse.users) ? usersResponse.users : [];
    
        setClassesData(classes);
        setUsersData(usersResponse); // You might want to set the entire response or just users
    
        calculateStats(classes, users); // Pass the users array, not the response object
        generateEnrollmentData(classes);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (classes, users) => {
    const students = users.filter(user => user.role === 'student');

    const totalEnrolled = classes.reduce((sum, cls) => sum + (cls.registrationCount || 0), 0);

    const totalRevenue = classes.reduce((sum, cls) => {
      return sum + (cls.cost || 0) * (cls.registrationCount || 0);
    }, 0);

    const totalCapacity = classes.reduce((sum, cls) => sum + (cls.capacity || 0), 0);

    const oneTimeClasses = classes.filter(cls => cls.type === 'one-time').length;
    const ongoingClasses = classes.filter(cls => cls.type === 'ongoing').length;

    const cities = [...new Set(classes.map(cls => cls.city).filter(Boolean))];

    const genderCounts = {
      male: students.filter(student => student.gender === 'male').length,
      female: students.filter(student => student.gender === 'female').length,
      nonBinary: students.filter(student => student.gender === 'non-binary').length,
      undisclosed: students.filter(student => student.gender === 'prefer not to say').length
    };

    setStats({
      totalClasses: classes.length,
      totalStudents: students.length,
      totalRevenue,
      totalCapacity,
      enrollmentRate: totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0,
      citiesWithClasses: cities,
      classTypes: { oneTime: oneTimeClasses, ongoing: ongoingClasses },
      genderDistribution: genderCounts
    });
  };
  const generateEnrollmentData = (classes) => {
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const newEnrollments = Math.floor(Math.random() * 10);

      data.push({
        date: date.toLocaleDateString(),
        enrollments: newEnrollments
      });
    }

    setEnrollmentData(data);
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
      <div className="py-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of Stand Strong classes and students
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Classes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FiCalendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Classes
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalClasses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/classes" className="font-medium text-primary-600 hover:text-primary-500">
                View all classes
              </Link>
            </div>
          </div>
        </div>
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <FiUsers className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalStudents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/students" className="font-medium text-primary-600 hover:text-primary-500">
                View all students
              </Link>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${stats.totalRevenue}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/classes" className="font-medium text-primary-600 hover:text-primary-500">
                View details
              </Link>
            </div>
          </div>
        </div>

        {/* Enrollment Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <FiBarChart2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Enrollment Rate
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.enrollmentRate.toFixed(1)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/attendance" className="font-medium text-primary-600 hover:text-primary-500">
                View attendance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Trend Chart */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">New Student Enrollments</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={enrollmentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  name="New Enrollments"
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* City & Class Type Distribution */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Cities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Cities with Classes</h2>
            <div className="mt-5">
              <ul className="divide-y divide-gray-200">
                {stats.citiesWithClasses.map((city) => (
                  <li key={city} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FiMapPin className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{city}</span>
                    </div>
                    <div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {classesData.filter(cls => cls.city === city).length} classes
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {stats.citiesWithClasses.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No cities with classes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Class Types */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Class Type Distribution</h2>
            <div className="mt-5">
              <ul className="divide-y divide-gray-200">
                <li className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-sm text-gray-900">Ongoing Classes</span>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {stats.classTypes.ongoing}
                    </span>
                  </div>
                </li>
                <li className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-yellow-400 mr-2"></div>
                    <span className="text-sm text-gray-900">One-Time Classes</span>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {stats.classTypes.oneTime}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Classes */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Classes</h2>
            <Link 
              to="/admin/classes/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiPlusCircle className="mr-2" />
              Add New Class
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {classesData.slice(0, 5).map((cls) => (
                <tr key={cls._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cls.title || 'Untitled Class'}</div>
                    <div className="text-sm text-gray-500">{cls.instructor?.name || 'Unknown Instructor'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cls.city || 'No Location'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      cls.type === 'one-time' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {cls.type === 'one-time' ? 'One-time' : 'Ongoing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(cls.registrationCount || 0)}/{cls.capacity || 0}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${cls.capacity ? ((cls.registrationCount || 0) / cls.capacity) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cls.cost || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/classes/edit/${cls._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                      Edit
                    </Link>
                    <Link to={`/classes/${cls._id}`} className="text-primary-600 hover:text-primary-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classesData.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No classes added yet</p>
            </div>
          )}
        </div>
        {classesData.length > 5 && (
          <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 sm:px-6">
            <div className="text-sm">
              <Link to="/admin/classes" className="font-medium text-primary-600 hover:text-primary-500">
                View all classes
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
