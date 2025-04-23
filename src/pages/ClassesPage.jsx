// client/src/pages/student/ClassesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiFilter, FiX, FiCalendar, FiMapPin, FiDollarSign, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming these service functions are correctly defined elsewhere
// import { getClasses, getAllCities } from '../../services/classService'; // Adjusted path based on file location
import { format } from 'date-fns';

// --- Mock Service Functions (Replace with your actual imports) ---
// These are placeholders. Make sure you import your actual service functions.
const getClasses = async (filters) => {
    console.log("Fetching classes with filters:", filters);
    // Replace with your actual API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    // Mock data - replace with actual fetched data
    return [
        { _id: '1', title: 'Intro to Krav Maga', instructor: { name: 'John Doe' }, type: 'ongoing', description: 'Learn the basics of Krav Maga self-defense.', city: 'New York', schedule: [{ date: '2025-05-10T10:00:00Z' }, { date: '2025-06-21T10:00:00Z' }], cost: 50, registeredStudents: [1, 2, 3], capacity: 10 },
        { _id: '2', title: 'Women\'s Self Defense Workshop', instructor: { name: 'Jane Smith' }, type: 'one-time', description: 'A one-time workshop focusing on practical techniques.', city: 'Boston', schedule: [{ date: '2025-05-15T18:00:00Z' }], cost: 25, registeredStudents: [1, 2, 3, 4, 5], capacity: 15 },
        { _id: '3', title: 'Advanced Defense Tactics', instructor: { name: 'Mike Lee' }, type: 'ongoing', description: 'Ongoing class for experienced practitioners.', city: 'New York', schedule: [{ date: '2025-05-12T19:00:00Z' }, { date: '2025-07-20T19:00:00Z' }], cost: 75, registeredStudents: [1, 2], capacity: 8 },
    ].filter(cls => { // Basic mock filtering
        if (filters.city && cls.city !== filters.city) return false;
        // Add more mock filtering logic based on your 'filters' object if needed for testing
        if (filters.type && cls.type !== filters.type) return false;
        if (filters.cost && cls.cost > Number(filters.cost)) return false;
        // Add gender, age, time filtering simulation if necessary
        return true;
    });
};

const getAllCities = async () => {
    // Replace with your actual API call
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    // Mock data - replace with actual fetched data
    return ['New York', 'Boston', 'Chicago'];
};
// --- End Mock Service Functions ---


const ClassesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    // State
    const [classes, setClasses] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter state - Initialized from URL query params or defaults
    const [filters, setFilters] = useState({
        city: queryParams.get('city') || '',
        gender: queryParams.get('gender') || '', // Assuming gender is a filter option
        minAge: queryParams.get('minAge') || '',
        maxAge: queryParams.get('maxAge') || '',
        cost: queryParams.get('cost') || '',     // Max cost
        type: queryParams.get('type') || '',     // 'one-time' or 'ongoing'
        time: queryParams.get('time') || '',     // 'morning', 'afternoon', 'evening'
    });

    // Fetch classes and cities based on filters
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Prepare filters for the API call (remove empty values)
                const apiFilters = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                        apiFilters[key] = value;
                    }
                });

                // Fetch data concurrently
                const [classesData, citiesData] = await Promise.all([
                    getClasses(apiFilters),
                    getAllCities(),
                ]);

                setClasses(classesData);
                // Only set cities if they haven't been set before or if they can change
                // If cities are static, you might fetch them only once in a separate useEffect
                setCities(citiesData);

            } catch (err) {
                setError('Failed to load classes. Please try again later.');
                console.error("Fetch error:", err); // Log the actual error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]); // Re-run effect when filters change

    // Update URL query parameters when filters change
    useEffect(() => {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                queryParams.set(key, value);
            }
        });

        // Update URL without adding to history stack
        navigate({ search: queryParams.toString() }, { replace: true });

    }, [filters, navigate]);

    // Handle changes in filter inputs
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Clear all filters and reset state
    const clearFilters = () => {
        setFilters({
            city: '',
            gender: '',
            minAge: '',
            maxAge: '',
            cost: '',
            type: '',
            time: '',
        });
        // No need to manually update URL here, the useEffect for filters will handle it
    };

    // Format class date range (simplified for clarity)
    const formatClassDates = (schedule) => {
        if (!schedule || schedule.length === 0) return 'No dates available';

        try {
            const dates = schedule.map(session => new Date(session.date)).sort((a, b) => a - b);
            if (dates.length === 0 || isNaN(dates[0])) return 'Invalid dates'; // Basic validation

            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];

            if (dates.length === 1 || firstDate.toDateString() === lastDate.toDateString()) {
                return format(firstDate, 'MMM d, yyyy');
            }

            return `${format(firstDate, 'MMM d')} - ${format(lastDate, 'MMM d, yyyy')}`;
        } catch (error) {
            console.error("Error formatting dates:", error);
            return "Date info unavailable";
        }
    };

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4
            }
        }
    };

    // Common Tailwind classes for form elements (adjust as needed)
    const formInputClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm";
    const formLabelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="pb-12 min-h-screen bg-gray-50">
            {/* Header section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Self-Defense Classes</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {loading ? 'Loading...' : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'} available`}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                {isFilterOpen ? <FiX className="mr-2 -ml-1 h-5 w-5" /> : <FiFilter className="mr-2 -ml-1 h-5 w-5" />}
                                {isFilterOpen ? 'Close Filters' : 'Filter Classes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Filter section with animation */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white shadow-md rounded-lg mt-6 p-6">
                                <div className="mb-4 flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                                        onClick={clearFilters}
                                    >
                                        Clear all filters
                                    </button>
                                </div>

                                {/* Filter Inputs Grid - Added missing inputs */}
                                <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {/* City Filter */}
                                    <div>
                                        <label htmlFor="city" className={formLabelClass}>City</label>
                                        <select
                                            id="city"
                                            name="city"
                                            className={formInputClass}
                                            value={filters.city}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Cities</option>
                                            {cities.map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gender Filter */}
                                    <div>
                                        <label htmlFor="gender" className={formLabelClass}>Gender Focus</label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            className={formInputClass}
                                            value={filters.gender}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Any Focus</option>
                                            <option value="male">Male Focused</option>
                                            <option value="female">Female Focused</option>
                                            <option value="coed">Co-Ed</option> {/* Example addition */}
                                            {/* Add other relevant options */}
                                        </select>
                                    </div>

                                    {/* Class Type Filter */}
                                    <div>
                                        <label htmlFor="type" className={formLabelClass}>Class Type</label>
                                        <select
                                            id="type"
                                            name="type"
                                            className={formInputClass}
                                            value={filters.type}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Types</option>
                                            <option value="one-time">One-time</option>
                                            <option value="ongoing">Ongoing</option>
                                            {/* Add other types like 'workshop', 'seminar' if applicable */}
                                        </select>
                                    </div>

                                    {/* Time of Day Filter */}
                                    <div>
                                        <label htmlFor="time" className={formLabelClass}>Time of Day</label>
                                        <select
                                            id="time"
                                            name="time"
                                            className={formInputClass}
                                            value={filters.time}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Any Time</option>
                                            <option value="morning">Morning (6AM-12PM)</option>
                                            <option value="afternoon">Afternoon (12PM-5PM)</option>
                                            <option value="evening">Evening (5PM-10PM)</option>
                                        </select>
                                    </div>

                                    {/* Min Age Filter */}
                                    <div>
                                        <label htmlFor="minAge" className={formLabelClass}>Min Age</label>
                                        <input
                                            type="number"
                                            id="minAge"
                                            name="minAge"
                                            min="0"
                                            max="100" // Consider adjusting max
                                            className={formInputClass}
                                            value={filters.minAge}
                                            onChange={handleFilterChange}
                                            placeholder="e.g., 18"
                                        />
                                    </div>

                                    {/* Max Age Filter */}
                                    <div>
                                        <label htmlFor="maxAge" className={formLabelClass}>Max Age</label>
                                        <input
                                            type="number"
                                            id="maxAge"
                                            name="maxAge"
                                            min="0"
                                            max="100" // Consider adjusting max
                                            className={formInputClass}
                                            value={filters.maxAge}
                                            onChange={handleFilterChange}
                                            placeholder="e.g., 65"
                                        />
                                    </div>

                                    {/* Max Cost Filter */}
                                    <div>
                                        <label htmlFor="cost" className={formLabelClass}>Max Cost ($)</label>
                                        <input
                                            type="number"
                                            id="cost"
                                            name="cost"
                                            min="0"
                                            step="5" // Optional: Set step for cost increments
                                            className={formInputClass}
                                            value={filters.cost}
                                            onChange={handleFilterChange}
                                            placeholder="e.g., 50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Classes grid or status messages */}
                <div className="mt-8"> {/* Increased margin top */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            {/* Simple spinner */}
                            <div className="w-12 h-12 border-t-4 border-b-4 border-primary-600 border-solid rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {/* Error Icon */}
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="bg-white shadow-md rounded-lg py-12 text-center mt-6">
                            <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
                            <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or clearing them to see all available classes.</p>
                            <button
                                type="button"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                onClick={clearFilters}
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        // Display Classes Grid
                        <motion.div
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {classes.map((classItem) => (
                                <motion.div
                                    key={classItem._id}
                                    className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col" // Added flex flex-col
                                    variants={itemVariants}
                                >
                                    {/* Optional Image Placeholder */}
                                    {/* <div className="h-48 bg-gray-200"> Image Here </div> */}

                                    <div className="p-6 flex flex-col flex-grow"> {/* Added flex flex-col flex-grow */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition duration-150 ease-in-out">
                                                    <Link to={`/classes/${classItem._id}`}>
                                                        {classItem.title}
                                                    </Link>
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Instructor: {classItem.instructor?.name || 'TBD'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${classItem.type === 'one-time'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {classItem.type?.replace('-', ' ') || 'N/A'}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-grow"> {/* Added flex-grow */}
                                            {classItem.description}
                                        </p>

                                        <div className="mt-4 space-y-2 border-t pt-4"> {/* Added border-t pt-4 */}
                                            <div className="flex items-center text-sm text-gray-600" title="Location">
                                                <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <span>{classItem.city || 'Location TBD'}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600" title="Schedule">
                                                <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <span>{formatClassDates(classItem.schedule)}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600" title="Cost">
                                                <FiDollarSign className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <span>{classItem.cost === 0 ? 'Free' : `$${classItem.cost}`}</span> {/* Added $ sign */}
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600" title="Enrollment">
                                                <FiUsers className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <span>
                                                    {classItem.registeredStudents?.length ?? 0}/{classItem.capacity ?? '?'} spots filled
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t"> {/* Footer for button */}
                                        <Link
                                            to={`/classes/${classItem._id}`}
                                            className="w-full block text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassesPage;