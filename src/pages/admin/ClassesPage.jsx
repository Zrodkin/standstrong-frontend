// client/src/pages/admin/ClassesPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import {
    FiPlus,
    FiEdit2,
    FiEye,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiChevronUp,
    FiChevronDown,
    FiAlertCircle // For delete confirmation alternative
} from 'react-icons/fi';
// Assuming service functions are correctly defined
import { getClasses, deleteClass } from '../../services/classService'; // Adjust path if needed


const ClassesPage = () => {
    const [classes, setClasses] = useState([]); // Original data from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Consider debouncing search term update for performance on large lists
    // const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const [filters, setFilters] = useState({
        city: '',
        type: '',
    });
    const [sort, setSort] = useState({ field: 'title', direction: 'asc' });
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores ID of class to delete

    // Fetch initial data
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getClasses();
                
                // Process the data to ensure registrationCount is available
                const processedData = data.map(cls => ({
                    ...cls,
                    registrationCount: cls.registeredStudents?.length || 0,
                    // Add lowercase fields for search/sort
                    title_lower: cls.title?.toLowerCase() || '',
                    city_lower: cls.city?.toLowerCase() || '',
                    instructorName_lower: cls.instructor?.name?.toLowerCase() || ''
                }));
                
                setClasses(processedData || []);
            } catch (err) {
                setError('Failed to load classes. Please try again later.');
                console.error("Fetch classes error:", err);
                setClasses([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };
    
        fetchClasses();
    }, []);

    // Memoize filtered and sorted classes to avoid recalculation on every render
    const filteredAndSortedClasses = useMemo(() => {
        let result = [...classes];

        // Apply search (using debounced term if implemented)
        const term = searchTerm.toLowerCase();
        if (term) {
            result = result.filter(cls =>
                (cls.title_lower?.includes(term) ?? false) ||
                (cls.city_lower?.includes(term) ?? false) ||
                (cls.instructorName_lower?.includes(term) ?? false)
                // Add other searchable fields if needed
            );
        }

        // Apply filters
        if (filters.city) {
            result = result.filter(cls => cls.city === filters.city);
        }
        if (filters.type) {
            result = result.filter(cls => cls.type === filters.type);
        }

        // Apply sorting
        result.sort((a, b) => {
            let fieldA, fieldB;

            // Extract values, handling potential nulls and types
            switch (sort.field) {
                case 'title':
                    fieldA = a.title_lower ?? '';
                    fieldB = b.title_lower ?? '';
                    break;
                case 'instructor':
                    fieldA = a.instructorName_lower ?? '';
                    fieldB = b.instructorName_lower ?? '';
                    break;
                case 'city':
                    fieldA = a.city_lower ?? '';
                    fieldB = b.city_lower ?? '';
                    break;
                case 'type':
                    fieldA = a.type?.toLowerCase() ?? '';
                    fieldB = b.type?.toLowerCase() ?? '';
                    break;
                case 'capacity':
                    fieldA = a.capacity ?? 0;
                    fieldB = b.capacity ?? 0;
                    break;
                case 'enrollment': // Sort by number of registered students
                fieldA = a.enrollmentCount ?? 0;
                fieldB = b.enrollmentCount ?? 0;
                    break;
                default:
                    return 0; // Should not happen if field is always set
            }

             // Comparison logic
             let comparison = 0;
             if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                 comparison = fieldA.localeCompare(fieldB); // Case-insensitive, locale-aware string comparison
             } else {
                 // Basic comparison for numbers or mixed types
                 if (fieldA < fieldB) comparison = -1;
                 if (fieldA > fieldB) comparison = 1;
             }

            return sort.direction === 'asc' ? comparison : -comparison;
        });

        return result;
        // Update dependencies if using debounced search term
    }, [classes, searchTerm, filters, sort]);

    // Memoize unique cities for filter dropdown
    const uniqueCities = useMemo(() => {
        return Array.from(new Set(classes.map(cls => cls.city).filter(Boolean))).sort();
    }, [classes]);

    // Handle sort change
    const handleSort = (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Reset all filters and search
    const resetFiltersAndSearch = () => {
        setSearchTerm('');
        setFilters({ city: '', type: '' });
        setSort({ field: 'title', direction: 'asc' }); // Optionally reset sort
    };

    // Handle class deletion confirmation
    const handleDeleteClick = (id) => {
        setDeleteConfirm(id);
        // Optional: Scroll to the row or show a modal
    };

    // Handle actual deletion
    const confirmDelete = async () => {
        if (deleteConfirm === null) return;

        setError(null); // Clear previous errors
        try {
            await deleteClass(deleteConfirm);
            // Update classes list state by removing the deleted class
            setClasses(prevClasses => prevClasses.filter(cls => cls._id !== deleteConfirm));
            setDeleteConfirm(null); // Close confirmation state
        } catch (err) {
            setError(`Failed to delete class (ID: ${deleteConfirm}). Please try again.`);
            console.error("Delete error:", err);
            setDeleteConfirm(null); // Close confirmation state even on error
        }
    };

    // Cancel deletion
    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <div className="w-12 h-12 border-t-4 border-b-4 border-primary-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    // Helper for rendering sort icons
    const renderSortIcon = (field) => {
      if (sort.field !== field) return null;
      return sort.direction === 'asc' ?
        <FiChevronUp className="ml-1 h-4 w-4 inline-block" /> :
        <FiChevronDown className="ml-1 h-4 w-4 inline-block" />;
    };

    return (
        <div className="container mx-auto px-4 py-8"> {/* Added container */}
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-0">
                    Manage Classes
                </h1>
                <div>
                    <Link
                        to="/admin/classes/new" // Ensure this route exists in your admin router
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                        Add New Class
                    </Link>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                 <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p><span className="font-bold">Error:</span> {error}</p>
                 </div>
            )}

            {/* Search and Filter Bar */}
            {/* Consider extracting this into its own component */}
            <div className="bg-white shadow sm:rounded-lg mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-1 lg:col-span-2">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="search" // Use type="search" for better semantics and potential browser UI
                                    id="search"
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Search title, city, instructor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* City Filter */}
                        <div>
                            <label htmlFor="city" className="sr-only">City</label>
                            <select
                                id="city"
                                name="city"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm"
                                value={filters.city}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label htmlFor="type" className="sr-only">Type</label>
                            <select
                                id="type"
                                name="type"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm"
                                value={filters.type}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Types</option>
                                <option value="one-time">One-time</option>
                                <option value="ongoing">Ongoing</option>
                                {/* Add other types if needed */}
                            </select>
                        </div>

                         {/* Reset Button - Optional */}
                         {/*
                         <div className="text-right">
                           <button
                               type="button"
                               onClick={resetFiltersAndSearch}
                               className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                           >
                               <FiFilter className="mr-2 -ml-1 h-4 w-4" />
                               Reset
                           </button>
                         </div>
                         */}
                    </div>
                     { (searchTerm || filters.city || filters.type) && (
                         <div className="mt-4 text-right">
                             <button
                                 type="button"
                                 onClick={resetFiltersAndSearch}
                                 className="text-sm font-medium text-primary-600 hover:text-primary-500"
                             >
                                 Clear Filters & Search
                             </button>
                         </div>
                     )}
                </div>
            </div>

             {/* Optional: Delete Confirmation Modal (Alternative to inline buttons) */}
             {/*
             {deleteConfirm !== null && (
               <Modal title="Confirm Deletion" onClose={cancelDelete} onConfirm={confirmDelete}>
                 <p>Are you sure you want to delete the class "{classes.find(c => c._id === deleteConfirm)?.title}"?</p>
               </Modal>
             )}
             */}


            {/* Classes Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Use a function or map for headers if they become numerous */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('title')}>
                                        Class Title {renderSortIcon('title')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                     <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('instructor')}>
                                        Instructor {renderSortIcon('instructor')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                     <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('city')}>
                                        City {renderSortIcon('city')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('type')}>
                                        Type {renderSortIcon('type')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" className="flex items-center w-full text-left focus:outline-none" onClick={() => handleSort('enrollment')}>
                                        Enrollment {renderSortIcon('enrollment')}
                                    </button>
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedClasses.length > 0 ? (
                                filteredAndSortedClasses.map((cls) => {
                                    const enrollmentCount = cls.enrollmentCount ?? 0;
                                    const capacity = cls.capacity ?? 0;
                                    // Prevent division by zero, ensure capacity is positive
                                    const enrollmentPercentage = capacity > 0 ? (enrollmentCount / capacity) * 100 : 0;
                                    // Green = popular/nearly full (e.g., >80%), Primary = normal
                                    const progressBarColor = enrollmentPercentage > 80 ? 'bg-green-600' : 'bg-primary-600';

                                    return (
                                        <tr key={cls._id} className={deleteConfirm === cls._id ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{cls.title ?? 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{cls.instructor?.name ?? <span className="italic text-gray-400">None</span>}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{cls.city ?? 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`capitalize px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cls.type === 'one-time' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {cls.type?.replace('-', ' ') ?? 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {enrollmentCount}/{capacity > 0 ? capacity : '?'}
                                                </div>
                                                {capacity > 0 && (
                                                  <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className={`h-1.5 rounded-full ${progressBarColor}`}
                                                        style={{ width: `${enrollmentPercentage}%` }}
                                                        title={`${enrollmentPercentage.toFixed(0)}% Full`}
                                                    ></div>
                                                  </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Actions: View, Edit, Delete */}
                                                <div className="flex items-center justify-end space-x-3">
                                                    {/* View Link (points to student view) */}
                                                    <Link
                                                        to={`/classes/${cls._id}`} // Link to public class details page
                                                        className="text-gray-400 hover:text-primary-600 transition duration-150 ease-in-out"
                                                        title="View Public Page"
                                                    >
                                                        <FiEye className="h-5 w-5" />
                                                    </Link>
                                                    {/* Edit Link */}
                                                    <Link
                                                        to={`/admin/classes/edit/${cls._id}`} // Link to admin edit page
                                                        className="text-gray-400 hover:text-blue-600 transition duration-150 ease-in-out"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="h-5 w-5" />
                                                    </Link>
                                                    {/* Delete Button/Confirmation */}
                                                    {deleteConfirm === cls._id ? (
                                                        <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
                                                            <span className="text-xs text-red-600">Confirm?</span>
                                                            <button
                                                                onClick={confirmDelete}
                                                                className="text-red-600 hover:text-red-800 font-semibold text-xs"
                                                                title="Confirm Delete"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                onClick={cancelDelete}
                                                                className="text-gray-500 hover:text-gray-700 font-semibold text-xs"
                                                                title="Cancel"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteClick(cls._id)}
                                                            className="text-gray-400 hover:text-red-600 transition duration-150 ease-in-out"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {classes.length === 0
                                            ? "No classes have been added yet."
                                            : "No classes match your current search/filter criteria."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Optional: Add Pagination Controls Here if implementing server-side pagination */}
            </div>
        </div>
    );
};

export default ClassesPage;