// D:/StandStrong/frontend/src/pages/admin/StudentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiSearch, FiChevronUp, FiChevronDown, FiUsers, FiTool } from 'react-icons/fi'; // Added FiUsers, FiTool
import { getUsers } from '../../services/userService'; // Import the new service function
import { format } from 'date-fns'; // If displaying registration dates etc.

const AdminStudentsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState({ field: 'lastName', direction: 'asc' });
    // Add filters if needed, e.g., by role
    // const [filters, setFilters] = useState({ role: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getUsers();
                setUsers(data || []); // Ensure it's always an array
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users.');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Memoize filtered and sorted users
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];
        const term = searchTerm.toLowerCase();

        // Apply search
        if (term) {
            result = result.filter(user =>
                (user.firstName?.toLowerCase().includes(term)) ||
                (user.lastName?.toLowerCase().includes(term)) ||
                (user.email?.toLowerCase().includes(term))
            );
        }

        // Apply filters (example: by role if implemented)
        // if (filters.role) {
        //     result = result.filter(user => user.role === filters.role);
        // }

        // Apply sorting
        result.sort((a, b) => {
            let fieldA, fieldB;
            switch (sort.field) {
                case 'firstName':
                    fieldA = a.firstName?.toLowerCase() ?? '';
                    fieldB = b.firstName?.toLowerCase() ?? '';
                    break;
                case 'email':
                    fieldA = a.email?.toLowerCase() ?? '';
                    fieldB = b.email?.toLowerCase() ?? '';
                    break;
                case 'role':
                    fieldA = a.role?.toLowerCase() ?? '';
                    fieldB = b.role?.toLowerCase() ?? '';
                    break;
                case 'registeredClasses':
                    fieldA = a.registeredClasses?.length ?? 0;
                    fieldB = b.registeredClasses?.length ?? 0;
                    break;
                case 'lastName': // Default sort
                default:
                    fieldA = a.lastName?.toLowerCase() ?? '';
                    fieldB = b.lastName?.toLowerCase() ?? '';
                    break;
            }

             // Comparison logic
             let comparison = 0;
             if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                 comparison = fieldA.localeCompare(fieldB);
             } else {
                 if (fieldA < fieldB) comparison = -1;
                 if (fieldA > fieldB) comparison = 1;
             }
            return sort.direction === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [users, searchTerm, sort /*, filters */]);


    // Handle sort change
    const handleSort = (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

     // Helper for sort icons
     const renderSortIcon = (field) => {
        if (sort.field !== field) return null;
        return sort.direction === 'asc' ?
          <FiChevronUp className="ml-1 h-4 w-4 inline-block" /> :
          <FiChevronDown className="ml-1 h-4 w-4 inline-block" />;
      };

      // --- Render Logic ---

      if (loading) {
        return <div className="text-center p-10">Loading students...</div>;
      }

      if (error) {
        return <div className="text-center p-10 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;
      }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Students</h1>

            {/* Search Bar */}
            <div className="mb-4">
                 <div className="relative rounded-md shadow-sm max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="search"
                        id="search-students"
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
            </div>

            {/* Students Table */}
             <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                     <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('lastName')}>
                                        Last Name {renderSortIcon('lastName')}
                                    </button>
                                </th>
                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                     <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('firstName')}>
                                        First Name {renderSortIcon('firstName')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('email')}>
                                        Email {renderSortIcon('email')}
                                    </button>
                                </th>
                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('role')}>
                                        Role {renderSortIcon('role')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                     <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('registeredClasses')}>
                                        Classes {renderSortIcon('registeredClasses')}
                                    </button>
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {filteredAndSortedUsers.length > 0 ? (
                                filteredAndSortedUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.lastName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.firstName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.registeredClasses?.length ?? 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             {/* Add action links/buttons here */}
                                             <Link
                                                 to={`/admin/students/${user._id}`} // Example: Link to a detail view if you create one
                                                 className="text-primary-600 hover:text-primary-800"
                                                 title="View Details"
                                             >
                                                 Details
                                             </Link>
                                              {/* Add Edit Role / Delete buttons if needed, with confirmation */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {searchTerm ? "No students match your search." : "No students found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

export default AdminStudentsPage;