// src/pages/ClassesPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiFilter, FiX, FiCalendar, FiMapPin, FiDollarSign, FiUsers,
    FiAlertCircle, FiUser, FiAward, FiSearch, FiArrowLeft
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getClasses } from '../services/classService';
import { format } from 'date-fns';

// --- Motion Variants ---
const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

// Note: Drawer animation variants were defined but not used.
// If you want to use them, apply them to the motion.div for the drawer.
// const drawerVariants = { open: { x: 0 }, closed: { x: "100%" } };
// const overlayVariants = { open: { opacity: 1 }, closed: { opacity: 0 } };

const ClassesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const selectedCity = queryParams.get('city');

    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true); // Start true initially
    const [error, setError] = useState(null);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [totalClassesCount, setTotalClassesCount] = useState(0); // Total for the city

    const [filters, setFilters] = useState(() => {
        // Initialize filters from URL query params
        return {
            city: selectedCity || '', // Ensure city from URL is primary
            gender: queryParams.get('gender') || '',
            minAge: queryParams.get('minAge') || '',
            maxAge: queryParams.get('maxAge') || '',
            cost: queryParams.get('cost') || '',
            type: queryParams.get('type') || '',
            time: queryParams.get('time') || '',
        };
    });

    // Derived state to check if any non-city filters are active
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => key !== 'city' && value !== '');
    }, [filters]);

    // Update URL when filters change (optional but good UX)
    const updateUrlWithFilters = useCallback(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });
        // Use replace to avoid polluting browser history for every filter change
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, [filters, navigate, location.pathname]);


    // Effect to fetch classes when filters or city change
    useEffect(() => {
        if (!selectedCity) return; // Don't fetch if no city is selected

        const fetchClasses = async () => {
            setClassesLoading(true);
            setError(null);
            setClasses([]); // Clear previous results immediately

            try {
                // Prepare filters for the API call (only send non-empty values)
                const apiFilters = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                        apiFilters[key] = value;
                    }
                });

                // Fetch filtered classes
                // *** Ideal Enhancement: Modify API to return totalCountForCity here ***
                const filteredClassesData = await getClasses(apiFilters);
                setClasses(filteredClassesData);

                // --- Total Count Logic ---
                // If filters (other than city) are active, we need the total count for the city
                // to display "Showing X of Y total".
                // This currently requires a second API call if the backend doesn't provide the total.
                if (hasActiveFilters) {
                    // Fetch total count for the base city query
                    const totalData = await getClasses({ city: filters.city });
                    setTotalClassesCount(totalData.length);
                } else {
                    // If no other filters, the total count is just the length of the results
                    setTotalClassesCount(filteredClassesData.length);
                }
                 // *** End of Ideal Enhancement section ***

            } catch (err) {
                setError(`Failed to load classes for ${selectedCity}. Please try again later.`);
                console.error('Fetch classes error:', err);
                setClasses([]);
                setTotalClassesCount(0);
            } finally {
                setClassesLoading(false);
            }
        };

        fetchClasses();
        // Optionally update URL whenever filters change
        // Comment this out if you DON'T want the URL to update on filter change
        updateUrlWithFilters();

    }, [filters, selectedCity, hasActiveFilters, updateUrlWithFilters]); // Add hasActiveFilters and updateUrlWithFilters

    // Effect to redirect if no city is selected and scroll to top
    useEffect(() => {
        if (!selectedCity) {
            // Redirect to home/city selection if no city in URL
            navigate('/#cities-section', { replace: true });
        } else {
            // Scroll to top when the city changes or component loads with a city
            window.scrollTo(0, 0);
        }
    }, [selectedCity, navigate]);

    // Handler for individual filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handler for clearing filters (keeps the city)
    const handleClearFilters = () => {
        setFilters(prev => ({
            city: prev.city, // Keep the current city
            gender: '',
            minAge: '',
            maxAge: '',
            cost: '',
            type: '',
            time: ''
        }));
        // No need to close drawer here, user might want to apply other filters
    };

    // Handler for applying filters (just closes the drawer)
    const handleApplyFilters = () => {
        setIsFilterDrawerOpen(false);
        // Fetching is handled by the useEffect dependency on 'filters'
    };

     // Helper to format schedule based on type, start date, and end date
     const formatSchedule = (classItem) => {
        // Check if essential schedule data exists
        if (!classItem || !classItem.schedule || !classItem.schedule.length) {
            return "Schedule TBD";
        }
    
        try {
            // Sort sessions by date (earliest first)
            const sortedSessions = [...classItem.schedule].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            
            // Get the first (earliest) and last (latest) sessions
            const firstSession = sortedSessions[0];
            const lastSession = sortedSessions[sortedSessions.length - 1];
            
            // Format first session date
            const firstDateObj = new Date(firstSession.date);
            if (isNaN(firstDateObj.getTime())) {
                return "Schedule TBD";
            }
            
            const formattedFirstDate = format(firstDateObj, 'MMM d');
            
            // For one-time class, show just the date and time
            if (classItem.type === 'one-time') {
                return `${formattedFirstDate}, ${firstSession.startTime}`;
            }
            
            // For ongoing class with multiple sessions
            if (classItem.type === 'ongoing' && sortedSessions.length > 1) {
                const lastDateObj = new Date(lastSession.date);
                if (!isNaN(lastDateObj.getTime())) {
                    const formattedLastDate = format(lastDateObj, 'MMM d');
                    return `${formattedFirstDate} - ${formattedLastDate}`;
                }
            }
            
            // Default for ongoing with one session
            return `Starts ${formattedFirstDate}`;
            
        } catch (error) {
            console.error("Error formatting schedule:", error, classItem);
            return "Schedule TBD";
        }
    };


    // Prevent rendering if no city is selected yet (avoids flash of incorrect state)
    if (!selectedCity) {
        return null; // Or a minimal loading indicator
    }

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={pageVariants}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
                    >
                        Find Your Strength
                    </motion.h1>
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={pageVariants}
                        className="mt-4 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
                    >
                        Browse our self-defense classes in {selectedCity}. Find the right fit for your needs and schedule.
                    </motion.p>
                </div>
            </div>

            {/* Main Content */}
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full" // Added flex-grow and w-full
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
            >
                {/* Header and Filters Button */}
                <div className="mb-8 md:flex md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/#cities-section')}
                                className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                aria-label="Change city"
                            >
                                <FiArrowLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {selectedCity} Classes
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 pl-9"> {/* Adjusted padding */}
                            {classesLoading ? 'Loading...' : `Showing ${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`}
                            {hasActiveFilters && !classesLoading && totalClassesCount > 0 && classes.length !== totalClassesCount && ` of ${totalClassesCount} total`}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiFilter className="mr-2 -ml-0.5 h-5 w-5" />
                            Filters {hasActiveFilters && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-white"></span>}
                        </button>
                    </div>
                </div>

                 {/* Classes Content - Conditional Rendering */}
                 {classesLoading ? (
                     // Loading State
                     <div className="flex justify-center items-center py-20">
                         <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                         <p className="ml-4 text-gray-600">Loading classes...</p>
                     </div>
                 ) : error ? (
                     // Error State
                     <div className="bg-red-50 border border-red-200 p-4 mt-6 rounded-lg flex items-center">
                         <FiAlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                         <p className="text-sm font-medium text-red-800">{error}</p>
                     </div>
                 ) : classes.length === 0 ? (
                     // Empty State
                     <div className="bg-white border border-gray-100 shadow-sm rounded-lg py-16 px-6 text-center mt-8 flex flex-col items-center">
                         <FiSearch className="w-16 h-16 text-blue-300 mb-4" />
                         <h3 className="text-xl font-semibold text-gray-800 mb-2">
                             No Classes Found {hasActiveFilters ? "Matching Your Filters" : `in ${selectedCity}`}
                         </h3>
                         <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                             {hasActiveFilters
                                 ? "Try adjusting your filters or clearing them to see all available classes."
                                 : "Check back later or try searching in a different city!"}
                         </p>
                         {hasActiveFilters && (
                             <button
                                 onClick={handleClearFilters}
                                 className="mt-6 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                             >
                                 Clear Filters
                             </button>
                         )}
                     </div>
                 ) : (
                     // Classes Grid with Animation
                     <>
                         <motion.div
                             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
                             variants={cardContainerVariants}
                             initial="hidden"
                             animate="visible"
                         >
                             {classes.map((classItem) => (
                                 <motion.div
                                     key={classItem._id}
                                     variants={cardItemVariants}
                                     layout
                                 >
                                     <Link
                                         to={`/classes/${classItem._id}`}
                                         state={{ city: selectedCity }}
                                         className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 ease-out overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full"
                                     >
                                         <div className="p-5 flex flex-col flex-grow">
                                             {/* Title */}
                                             <div className="mb-3">
                                                 <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition duration-150">
                                                     {classItem.title || 'Untitled Class'}
                                                 </h3>
                                             </div>

                                             {/* Description */}
                                             <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4 min-h-[60px]">
                                                 {classItem.description || "No description available."}
                                             </p>

                                             {/* Details Section */}
                                             <div className="mt-auto space-y-2 text-sm text-gray-700 border-t border-gray-100 pt-4">
                                                 {/* Instructor */}
                                                 <div className="flex items-center">
                                                     <FiUser className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                     <span>{classItem.instructor?.name || 'Instructor TBD'}</span>
                                                 </div>

                                                 {/* Location */}
                                                 <div className="flex items-center min-w-0"> {/* Added min-w-0 for truncate */}
                                                    <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                    {/* Use location.address, fallback to city. Added truncate */}
                                                    {/* NOTE: Removed venueName as fallback since address should exist if location does */}
                                                    <span className="truncate" title={classItem.location?.address || classItem.city || ''}>
                                                        {classItem.location?.address || classItem.city || 'Location TBD'}
                                                    </span>
                                                </div>

                                                 {/* Schedule */}
                                                 <div className="flex items-center">
                                                     <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                     <span>{formatSchedule(classItem)}</span>
                                                 </div>

                                                 {/* Cost */}
                                                 <div className="flex items-center">
                                                     <FiDollarSign className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                     <span>{classItem.cost === 0 ? 'Free' : classItem.cost ? `$${classItem.cost}` : 'Price TBD'}</span>
                                                 </div>

                                                 {/* Ages (Conditional) */}
                                                 {(classItem.minAge || classItem.maxAge) && (
                                                     <div className="flex items-center">
                                                         <FiUsers className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                         <span>
                                                             Ages {classItem.minAge || '?'} - {classItem.maxAge || '?'}
                                                         </span>
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     </Link>
                                 </motion.div>
                             ))}
                         </motion.div>

                         {/* Testimonials Section */}
                         <section className="py-16 mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                 <h2 className="text-3xl font-bold text-gray-800 mb-8">
                                     What People Are Saying
                                 </h2>
                                 <div className="relative bg-white p-8 rounded-xl shadow-lg">
                                     <FiAward className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-500 bg-white p-2 rounded-full border-4 border-blue-100" />
                                     <blockquote className="mt-6">
                                         <p className="text-lg italic text-gray-700 leading-relaxed">
                                             "StandStrong's classes gave me real skills and real confidence. Highly recommend for everyone!"
                                         </p>
                                     </blockquote>
                                     <footer className="mt-6">
                                         <p className="text-base font-semibold text-gray-900">Josh G.</p>
                                         <p className="text-sm text-gray-500">Former IDF Sergeant</p>
                                     </footer>
                                 </div>
                             </div>
                         </section>
                     </>
                 )}

                {/* Filter Drawer with AnimatePresence */}
                <AnimatePresence>
                    {isFilterDrawerOpen && (
                        <>
                            {/* Backdrop Overlay */}
                            <motion.div
                                className="fixed inset-0 bg-black bg-opacity-60 z-40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setIsFilterDrawerOpen(false)}
                            />

                            {/* Drawer Panel */}
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="filter-drawer-title"
                                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                            >
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <h2 id="filter-drawer-title" className="text-lg font-semibold text-gray-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => setIsFilterDrawerOpen(false)}
                                        aria-label="Close filters"
                                    >
                                        <FiX className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Drawer Content */}
                                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                                    {/* Gender/Focus Filter */}
                                    <div>
                                        <label htmlFor="filter-gender" className="block text-sm font-medium text-gray-700 mb-1">
                                            Focus
                                        </label>
                                        <select
                                            id="filter-gender"
                                            name="gender"
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                            value={filters.gender}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Any Focus</option>
                                            <option value="female">Women's Class</option>
                                            <option value="male">Men's Class</option>
                                            <option value="any">Co-Ed</option>
                                        </select>
                                    </div>

                                    {/* Class Type Filter */}
                                    <div>
                                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Class Type
                                        </label>
                                        <select
                                            id="filter-type"
                                            name="type"
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                            value={filters.type}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Types</option>
                                            <option value="one-time">One-time Workshop</option>
                                            <option value="ongoing">Ongoing Course</option>
                                        </select>
                                    </div>

                                    {/* Time of Day Filter */}
                                    <div>
                                        <label htmlFor="filter-time" className="block text-sm font-medium text-gray-700 mb-1">
                                            Time of Day
                                        </label>
                                        <select
                                            id="filter-time"
                                            name="time"
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                            value={filters.time}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Any Time</option>
                                            <option value="morning">Morning (Before 12 PM)</option>
                                            <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                                            <option value="evening">Evening (After 5 PM)</option>
                                        </select>
                                    </div>

                                    {/* Age Range Filter - Two Column Layout */}
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <div>
                                            <label htmlFor="filter-minAge" className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Age
                                            </label>
                                            <input
                                                type="number"
                                                id="filter-minAge"
                                                name="minAge"
                                                min="0"
                                                value={filters.minAge}
                                                onChange={handleFilterChange}
                                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                                placeholder="Any"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="filter-maxAge" className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Age
                                            </label>
                                            <input
                                                type="number"
                                                id="filter-maxAge"
                                                name="maxAge"
                                                min="0"
                                                value={filters.maxAge}
                                                onChange={handleFilterChange}
                                                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                                placeholder="Any"
                                            />
                                        </div>
                                    </div>

                                    {/* Max Cost Filter */}
                                    <div>
                                        <label htmlFor="filter-cost" className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            id="filter-cost"
                                            name="cost"
                                            min="0"
                                            step="10"
                                            value={filters.cost}
                                            onChange={handleFilterChange}
                                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                                            placeholder="Any Price"
                                        />
                                    </div>
                                </div>

                                {/* Drawer Footer */}
                                <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col space-y-3">
                                    <div className="flex justify-between items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleClearFilters}
                                            disabled={!hasActiveFilters}
                                            className={`w-1/2 px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors ${
                                                hasActiveFilters
                                                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
                                                : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                                            }`}
                                        >
                                            Clear Filters
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleApplyFilters}
                                            className="w-1/2 px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFilterDrawerOpen(false);
                                            navigate('/#cities-section');
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline text-center w-full pt-1"
                                    >
                                        Change City ({selectedCity})
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>


            </motion.div> {/* Close the motion.div with max-w-7xl class */}
        </div> /* Close the div with bg-slate-50 class */
    );
}; // Close the ClassesPage component function

export default ClassesPage;