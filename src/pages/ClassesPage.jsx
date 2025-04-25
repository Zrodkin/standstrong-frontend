// fronted/src/pages/student/ClassesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiFilter, FiX, FiCalendar, FiMapPin, FiDollarSign, FiUsers,
    FiAlertCircle, FiCheckCircle, FiUser, FiAward, FiSearch,
    FiArrowLeft
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getClasses } from '../services/classService'; // Removed getAllCities since we won't need it
import { format } from 'date-fns';
import getFullImageUrl from '../utils/getFullImageUrl'; // Assuming path is correct

// --- Remove unused CitySelectionGrid component since we'll redirect ---
// We'll keep other utility components (LoadingSpinner, etc.) as they might be used elsewhere

// --- Loading Spinner for classes ---
const ClassLoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 border-solid rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading Classes...</p>
    </div>
);

// --- Reusable UI Components (TestimonialsSection, EmptyState, ErrorMessage) ---
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
        <div className={`p-2 rounded-full mr-3 ${color || 'bg-gray-100 text-gray-600'}`}>
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <dt className="text-xs font-medium text-gray-500 truncate">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
        </div>
    </div>
);

const TestimonialsSection = () => (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Testimonials
            </h2>
            <div className="relative bg-white p-8 rounded-xl shadow-lg text-center">
                <FiAward className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-500 bg-white p-2 rounded-full border-4 border-blue-50" />
                <blockquote className="mt-6">
                    <p className="text-lg italic text-gray-700 leading-relaxed">
                        "StandStrong's class wasn't just about techniques; it built my confidence tremendously. I feel safer and more aware. Highly recommended for everyone!"
                    </p>
                </blockquote>
                <footer className="mt-6">
                    <p className="text-base font-semibold text-gray-900">Josh G.</p>
                    <p className="text-sm text-gray-500">Former IDF Seargent</p>
                </footer>
            </div>
        </div>
    </section>
);

const EmptyState = ({ onClearFilters, reason }) => (
    <div className="bg-white border border-gray-100 shadow-sm rounded-lg py-16 px-6 text-center mt-8 flex flex-col items-center">
        <FiSearch className="w-16 h-16 text-blue-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {reason === 'initial' ? "Classes Coming Soon!" : "No Matching Classes Found"}
        </h3>
        <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
            {reason === 'initial'
                ? "We're preparing new classes. Please check back later or sign up for updates!"
                : "Try adjusting your search filters or broaden your criteria to discover available classes."}
        </p>
        {reason !== 'initial' && (
            <button
                type="button"
                className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                onClick={onClearFilters}
            >
                Clear Filters
            </button>
        )}
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-200 p-4 mt-6 rounded-lg flex items-center">
        <FiAlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
        <p className="text-sm font-medium text-red-800">{message || 'An error occurred.'}</p>
    </div>
);

// --- Main Classes Page Component ---
const ClassesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const selectedCity = queryParams.get('city');

    // --- Redirection effect for missing city parameter ---
    useEffect(() => {
        // If no city is selected, redirect to homepage cities section
        if (!selectedCity) {
            navigate('/#cities-section');
        }
    }, [selectedCity, navigate]);

    // Early return if no city is selected to avoid rendering during redirect
    if (!selectedCity) {
        return null; // Will redirect in useEffect
    }
// Add this effect early in your component, before other effects
useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once when component mounts
    

    // --- State ---
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [classesLoading, setClassesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [totalClassesCount, setTotalClassesCount] = useState(0);

    // --- Filter State ---
    const [filters, setFilters] = useState({
        city: selectedCity,
        gender: queryParams.get('gender') || '',
        minAge: queryParams.get('minAge') || '',
        maxAge: queryParams.get('maxAge') || '',
        cost: queryParams.get('cost') || '',
        type: queryParams.get('type') || '',
        time: queryParams.get('time') || '',
    });

    // --- Derived State ---
    const hasActiveFilters = Object.entries(filters)
                               .some(([key, value]) => key !== 'city' && value !== ''); // Check only non-city filters

    // --- Data Fetching ---
    useEffect(() => {
        const fetchClasses = async () => {
            if (!selectedCity) {
                return; // Don't attempt to fetch if no city (though this should never happen due to redirect)
            }

            try {
                setClassesLoading(true);
                setError(null);

                // Prepare API filters - only include non-empty values
                const apiFilters = {};
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                        apiFilters[key] = value;
                    }
                });

                // Fetch classes with filters
                const classesData = await getClasses(apiFilters);
                setClasses(classesData);

                // Get total count separately if we have filters other than city
                const hasOtherFilters = Object.entries(filters)
                    .some(([key, value]) => key !== 'city' && value !== '');

                if (hasOtherFilters) {
                    // With filters active, get total count with just the city filter
                    const totalData = await getClasses({ city: filters.city });
                    setTotalClassesCount(totalData.length);
                } else {
                    setTotalClassesCount(classesData.length);
                }

            } catch (err) {
                setError(`Failed to load classes for ${selectedCity}. Please try again later.`);
                console.error("Fetch classes error:", err);
                setClasses([]); // Clear classes on error
                setTotalClassesCount(0);
            } finally {
                setClassesLoading(false);
                setLoading(false);
            }
        };

        // Fetch classes whenever filters change
        fetchClasses();

    }, [filters, selectedCity]); // Removed initialLoadComplete dependency

    // --- URL Update ---
    useEffect(() => {
        const newQueryParams = new URLSearchParams();
        // Always add the city parameter
        newQueryParams.set('city', selectedCity);
        
        // Add other filters if they are set
        Object.entries(filters).forEach(([key, value]) => {
            if (key !== 'city' && value && value !== '') {
                newQueryParams.set(key, value);
            }
        });
        
        // Use navigate to update URL without full page reload
        navigate(`?${newQueryParams.toString()}`, { replace: true });
    }, [filters, selectedCity, navigate]);

    // --- Event Handlers ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        // Keep the city filter, clear others
        setFilters(prev => ({
            city: prev.city, // Keep current city
            gender: '',
            minAge: '',
            maxAge: '',
            cost: '',
            type: '',
            time: ''
        }));
        setIsFilterDrawerOpen(false);
    };

    // Updated to navigate to homepage
    const clearFiltersAndChangeCity = () => {
        navigate('/#cities-section');
        setIsFilterDrawerOpen(false);
    };

    const applyFiltersAndClose = () => {
        setIsFilterDrawerOpen(false);
        // Data refetch is handled by the useEffect watching 'filters'
    };

    // --- Date Formatting ---
    const formatClassDates = (schedule) => {
        if (!schedule || schedule.length === 0) return 'Schedule TBD';
        try {
            const dates = schedule.map(session => new Date(session.date)).sort((a, b) => a - b);
            if (dates.length === 0 || isNaN(dates[0]?.getTime())) return 'Invalid date info';
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            if (dates.length === 1 || firstDate.toDateString() === lastDate.toDateString()) {
                return format(firstDate, 'EEE, MMM d, yyyy');
            }
            return `${format(firstDate, 'MMM d')} - ${format(lastDate, 'MMM d, yyyy')}`;
        } catch (error) {
            console.error("Error formatting dates:", error);
            return "Date info unavailable";
        }
    };

    // --- Framer Motion Variants ---
const drawerVariants = { open: { x: 0 }, closed: { x: '100%' } };
const overlayVariants = { open: { opacity: 1, pointerEvents: 'auto' }, closed: { opacity: 0, pointerEvents: 'none' } };
const cardContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const cardItemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };
// Simplified page transition
const pageTransitionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};

// --- Style Constants ---
const formInputClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out";
const formLabelClass = "block text-sm font-medium text-gray-700 mb-1";

// --- Display Status Logic ---
const displayReason = !classesLoading && classes.length === 0
    ? (hasActiveFilters ? 'filtered' : 'initial') // Determine reason based on active non-city filters
    : null;

// --- Render Logic ---
return (
    <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                    Find Your Strength
                </h1>
                <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                    Browse our self-defense classes designed to empower you with practical skills and confidence. Find the right fit for your needs and schedule.
                </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gray-50" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Class Listing Content */}
            <motion.div
                key="class-listing"
                variants={pageTransitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Header & Filter Trigger */}
                <div className="mb-8 md:flex md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/#cities-section')} 
                                className="mr-1 p-1 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="Change city"
                            >
                                <FiArrowLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {selectedCity} Classes
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 pl-8">
                            {classesLoading ? 'Loading...' : `Showing ${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`}
                            {hasActiveFilters && totalClassesCount > 0 && classes.length !== totalClassesCount && ` (of ${totalClassesCount} total)`}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                            onClick={() => setIsFilterDrawerOpen(true)}
                        >
                            <FiFilter className="mr-2 -ml-0.5 h-5 w-5 text-gray-500" />
                            Filters
                            {/* Optional: Add badge for active filters */}
                            {hasActiveFilters && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Classes Grid or Status Messages */}
                <div className="mt-6">
                    {classesLoading ? (
                        <ClassLoadingSpinner /> // Use specific spinner
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : displayReason ? (
                        <EmptyState onClearFilters={clearFilters} reason={displayReason} />
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
                            variants={cardContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {classes.map((classItem) => {
                                // ... (keep existing class card mapping logic) ...
                                const capacity = parseInt(classItem.capacity, 10);
                                const registered = classItem.registeredStudents?.length ?? 0;
                                const spotsAvailable = !isNaN(capacity) ? capacity - registered : null;
                                const isFull = spotsAvailable !== null && spotsAvailable <= 0;

                                return (
                                    <motion.div
                                        key={classItem._id}
                                        className="relative bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 ease-out overflow-hidden flex flex-col group"
                                        variants={cardItemVariants}
                                        layout
                                    >
                                        {/* Spots Left Badge */}
                                        {!isFull && spotsAvailable !== null && spotsAvailable < 5 && (
                                            <span className="absolute top-3 right-3 z-10 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                {spotsAvailable} Spot{spotsAvailable !== 1 ? 's' : ''} Left
                                            </span>
                                        )}
                                        {isFull && (
                                            <span className="absolute top-3 right-3 z-10 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                Class Full
                                            </span>
                                        )}

                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="mb-3">
                                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-1 ${
                                                    classItem.type === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {classItem.type?.replace('-', ' ') || 'Workshop'}
                                                </span>
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition duration-150">
                                                    <Link to={`/classes/${classItem._id}`} className="focus:outline-none focus:ring-1 focus:ring-blue-500 rounded focus:ring-offset-1">
                                                        <span className="absolute inset-0" aria-hidden="true"></span>
                                                        {classItem.title}
                                                    </Link>
                                                </h3>
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4 min-h-[60px]">
                                                {classItem.description || "Details about this class are available on the class page."}
                                            </p>

                                            {/* Info Icons & Text */}
                                            <div className="mt-auto space-y-2 text-sm text-gray-700 border-t border-gray-100 pt-4">
                                                <div className="flex items-center" title="Instructor">
                                                    <FiUser className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{classItem.instructor?.name || 'TBD'}</span>
                                                </div>
                                                <div className="flex items-center" title="Location">
                                                    <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                    <span>{classItem.city || 'Location TBD'}</span>
                                                </div>
                                                <div className="flex items-center" title="Schedule">
                                                    <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                    <span>{formatClassDates(classItem.schedule)}</span>
                                                </div>
                                                <div className="flex items-center justify-between" title="Cost & Capacity">
                                                    <div className="flex items-center">
                                                        <FiDollarSign className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                        <span>{classItem.cost === 0 ? 'Free' : classItem.cost ? `$${classItem.cost}` : 'Cost TBD'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        <span>{registered}/{capacity || '?'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>

            {/* Testimonials Section - always show it */}
<TestimonialsSection />

{/* Filter Drawer */}
<AnimatePresence>
    {isFilterDrawerOpen && (
        <>
            {/* Overlay */}
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 z-40"
                variants={overlayVariants} initial="closed" animate="open" exit="closed"
                onClick={() => setIsFilterDrawerOpen(false)}
                transition={{ duration: 0.3 }}
            />
            {/* Drawer Panel */}
            <motion.div
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
                variants={drawerVariants} initial="closed" animate="open" exit="closed"
                transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <button
                        type="button"
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setIsFilterDrawerOpen(false)}
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>
                {/* Form Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* --- Filter Inputs --- */}
                    <div>
                        <label htmlFor="filter-gender" className={formLabelClass}>Focus</label>
                        <select id="filter-gender" name="gender" className={formInputClass} value={filters.gender} onChange={handleFilterChange}>
                            <option value="">Any Focus</option>
                            <option value="female">Female Focused</option>
                            <option value="male">Male Focused</option>
                            <option value="any">Co-Ed / Mixed</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-type" className={formLabelClass}>Class Type</label>
                        <select id="filter-type" name="type" className={formInputClass} value={filters.type} onChange={handleFilterChange}>
                            <option value="">All Types</option>
                            <option value="one-time">One-time Workshop</option>
                            <option value="ongoing">Ongoing Course</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filter-time" className={formLabelClass}>Time of Day</label>
                        <select id="filter-time" name="time" className={formInputClass} value={filters.time} onChange={handleFilterChange}>
                            <option value="">Any Time</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <label htmlFor="filter-minAge" className={formLabelClass}>Min Age</label>
                            <input type="number" id="filter-minAge" name="minAge" min="0" className={formInputClass} value={filters.minAge} onChange={handleFilterChange} placeholder="Any" />
                        </div>
                        <div>
                            <label htmlFor="filter-maxAge" className={formLabelClass}>Max Age</label>
                            <input type="number" id="filter-maxAge" name="maxAge" min="0" className={formInputClass} value={filters.maxAge} onChange={handleFilterChange} placeholder="Any" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="filter-cost" className={formLabelClass}>Max Cost ($)</label>
                        <input type="number" id="filter-cost" name="cost" min="0" step="10" className={formInputClass} value={filters.cost} onChange={handleFilterChange} placeholder="Any Price" />
                    </div>
                </div>
                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col space-y-2">
                    <div className="flex justify-between space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                            onClick={clearFilters} // Clears only non-city filters
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            className="px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                            onClick={applyFiltersAndClose}
                        >
                            Apply Filters
                        </button>
                    </div>
                    <button
                        type="button"
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline text-center"
                        onClick={() => navigate('/#cities-section')} // Navigate to homepage city section
                    >
                        Change City
                    </button>
                </div>
            </motion.div>
        </>
    )}
</AnimatePresence>

            {/* Footer Section */}
            <footer className="bg-gray-800 text-gray-400 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    &copy; {new Date().getFullYear()} StandStrong Self-Defense. All rights reserved. | Boston, MA
                </div>
            </footer>
        </div>
    );
};

export default ClassesPage;