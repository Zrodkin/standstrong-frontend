// client/src/pages/ClassDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiUsers, FiUser, FiInfo,
    FiDollarSign, FiCheckCircle, FiAlertCircle, FiClipboard, FiSun, FiMoon, FiCoffee, FiAward, FiUserCheck, FiLogIn
} from 'react-icons/fi';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../context/ClassContext';

// --- Reusable UI Components ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 border-solid rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading Class Details...</p>
    </div>
);

const ErrorMessage = ({ message, onRetry, showBackButton = true }) => (
    <div className="bg-red-50 border border-red-200 p-6 mt-6 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto">
        <FiAlertCircle className="h-12 w-12 text-red-500 mb-4 flex-shrink-0" />
        <p className="text-lg font-medium text-red-800 mb-4">{message || 'An error occurred.'}</p>
        <div className="flex space-x-4">
            {showBackButton && (
                 <Link
                    to="/classes"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                     <FiArrowLeft className="mr-2 h-4 w-4"/> Back to Classes
                </Link>
            )}
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Try Again
                </button>
            )}
        </div>
    </div>
);

const InfoItem = ({ icon: Icon, label, value, children }) => (
    <div className="flex items-start py-3">
        <Icon className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 mt-1" />
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{children || value}</dd>
        </div>
    </div>
);

// --- Main Class Info Page Component ---
const ClassDetailPage = () => {
    const { id } = useParams(); // Get class ID from URL
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useAuth();
    const { fetchClassById, registerClass } = useClasses();
    
    // --- State ---
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [registerError, setRegisterError] = useState(null);

    // --- Data Fetching ---
    const fetchClassData = async () => {
        try {
            setLoading(true);
            setError(null);
            setRegisterSuccess(false); // Reset success message on refetch
            setRegisterError(null); // Reset error message on refetch
            const data = await fetchClassById(id);
            setClassData(data);
        } catch (err) {
             console.error("Fetch error:", err);
             if (err.response?.status === 404) {
                 setError('Class not found. It might have been moved or deleted.');
             } else {
                 setError('Failed to load class details. Please check your connection or try again later.');
             }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Fetch data when component mounts or ID changes

    // --- Event Handlers ---
    const handleRegister = async () => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            // Store the current path to redirect back after login
            navigate(`/login?redirect=/classes/${id}`);
            return;
        }

        try {
            setRegistering(true);
            setRegisterError(null);
            setRegisterSuccess(false);

            await registerClass(id); // Call the registration API

            setRegisterSuccess(true); // Show success message

            // Refresh class data to update enrolled count and potentially registration status
            // (Wait a short moment for visual feedback before refetching)
            setTimeout(fetchClassData, 100);

        } catch (err) {
            console.error("Registration error:", err);
            // Set a user-friendly error message
            setRegisterError(err.response?.data?.message || 'Failed to register for the class. Please try again.');
        } finally {
            setRegistering(false); // Re-enable button
        }
    };

    // --- Derived State & Formatting ---
    const isUserRegistered = () => {
        if (!isAuthenticated || !currentUser || !classData?.registeredStudents) return false;
        // Check if the current user's ID is in the registeredStudents array
        return classData.registeredStudents.some(
            registration => registration.student && registration.student._id === currentUser._id
        );
    };

    const isClassFull = () => {
        if (!classData?.registeredStudents || typeof classData?.capacity !== 'number') return false;
        return classData.registeredStudents.length >= classData.capacity;
    };

    const formatSchedule = (schedule) => {
        if (!schedule || schedule.length === 0) return [];
        try {
             return schedule.map(session => ({
                date: format(new Date(session.date), 'EEEE, MMM d, yyyy'), // More explicit date format
                time: `${session.startTime} - ${session.endTime}`
            }));
        } catch (error) {
            console.error("Error formatting schedule:", error);
            return [{ date: "Invalid date info", time: "" }]; // Handle potential date parsing errors
        }
    };

     const getDayTimeIcon = (startTime) => {
        if (!startTime) return FiClock; // Default
        try {
            const hour = parseInt(startTime.split(':')[0], 10);
            if (hour < 12) return FiSun; // Morning
            if (hour < 17) return FiCoffee; // Afternoon (using coffee icon for variety)
            return FiMoon; // Evening
        } catch {
            return FiClock; // Fallback
        }
    };

    // --- Render Logic ---

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        // Use the enhanced ErrorMessage component
        return <ErrorMessage message={error} onRetry={fetchClassData} showBackButton={error !== 'Class not found. It might have been moved or deleted.'}/>;
    }

    // Should not happen if loading and error are handled, but good practice
    if (!classData) {
         return <ErrorMessage message="Could not load class data." showBackButton={true}/>;
    }

    // Format schedule after data is confirmed available
    const scheduleItems = formatSchedule(classData.schedule);
    const alreadyRegistered = isUserRegistered();
    const classIsFull = isClassFull();
    const spotsAvailable = classData.capacity - (classData.registeredStudents?.length ?? 0);

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* Back Navigation */}
             <div className="bg-white border-b border-gray-200">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                     <Link
                        to="/classes"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 group"
                    >
                         <FiArrowLeft className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                         Back to All Classes
                    </Link>
                </div>
             </div>


            {/* Hero Section (Simplified for Class Detail) */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden py-16 sm:py-24">
                 {/* Optional Background Image */}
                 {classData.imageUrl && (
                    <img
                        src={classData.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                        onError={(e) => e.target.style.display='none'} // Hide if image fails
                    />
                 )}
                 <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                     <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full mb-3 ${
                         classData.type === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                     }`}>
                         {classData.type?.replace('-', ' ') || 'Class'}
                     </span>
                     <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                         {classData.title}
                     </h1>
                     <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                         Led by: {classData.instructor?.name || 'Instructor TBD'}
                     </p>
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12">

                     {/* Left Column: Details */}
                     <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100 mb-8 lg:mb-0">
                         {/* Description */}
                         <section aria-labelledby="class-description-title">
                             <h2 id="class-description-title" className="text-xl font-semibold text-gray-900 mb-4">About This Class</h2>
                             <div className="prose prose-blue max-w-none text-gray-700">
                                 <p>{classData.description || "No description provided."}</p>
                             </div>
                         </section>

                         {/* Schedule */}
                         <section aria-labelledby="class-schedule-title" className="mt-8 pt-8 border-t border-gray-200">
                             <h2 id="class-schedule-title" className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
                             {scheduleItems.length > 0 ? (
                                 <ul className="space-y-4">
                                     {scheduleItems.map((item, index) => (
                                         <li key={index} className="flex items-start">
                                             <FiCalendar className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 mt-1" />
                                             <div>
                                                 <p className="font-medium text-gray-900">{item.date}</p>
                                                 <p className="text-sm text-gray-600 flex items-center">
                                                     {React.createElement(getDayTimeIcon(item.time?.split(' - ')[0]), { className: "mr-1.5 h-4 w-4" })}
                                                     {item.time}
                                                 </p>
                                             </div>
                                         </li>
                                     ))}
                                 </ul>
                             ) : (
                                 <p className="text-gray-500">Schedule details are not yet available.</p>
                             )}
                         </section>

                         {/* Instructor Info */}
                         <section aria-labelledby="instructor-info-title" className="mt-8 pt-8 border-t border-gray-200">
                             <h2 id="instructor-info-title" className="text-xl font-semibold text-gray-900 mb-4">Meet Your Instructor</h2>
                             {classData.instructor ? (
                                 <div className="flex items-start space-x-4">
                                     {classData.instructor.imageUrl && (
                                        <img
                                            className="h-16 w-16 rounded-full object-cover flex-shrink-0 border border-gray-200"
                                            src={classData.instructor.imageUrl}
                                            alt={classData.instructor.name}
                                            onError={(e) => e.target.src='https://placehold.co/100x100/E2E8F0/4A5568?text=?'} // Fallback placeholder
                                        />
                                     )}
                                     <div>
                                         <h3 className="text-lg font-medium text-gray-900">{classData.instructor.name}</h3>
                                         <p className="mt-1 text-sm text-gray-600">{classData.instructor.bio || "No bio available."}</p>
                                     </div>
                                 </div>
                             ) : (
                                 <p className="text-gray-500">Instructor details will be updated soon.</p>
                             )}
                         </section>

                         {/* Prerequisites & What to Bring */}
                         {(classData.prerequisites || classData.whatToBring) && (
                            <section aria-labelledby="class-requirements-title" className="mt-8 pt-8 border-t border-gray-200">
                                <h2 id="class-requirements-title" className="text-xl font-semibold text-gray-900 mb-4">Requirements & Preparation</h2>
                                <dl className="space-y-4">
                                    {classData.prerequisites && (
                                        <InfoItem icon={FiClipboard} label="Prerequisites">
                                            {classData.prerequisites}
                                        </InfoItem>
                                    )}
                                    {classData.whatToBring && (
                                         <InfoItem icon={FiCoffee} label="What to Bring"> {/* Using FiCoffee for variety */}
                                            {classData.whatToBring}
                                        </InfoItem>
                                    )}
                                </dl>
                            </section>
                         )}
                     </div>

                     {/* Right Column: Meta & Registration */}
                     <div className="lg:col-span-1">
                         {/* Sticky container for registration box on larger screens */}
                         <div className="lg:sticky lg:top-6">
                             <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
                                 <h2 className="text-xl font-semibold text-gray-900 mb-5">Class Overview</h2>

                                 {/* Key Info List */}
                                 <dl className="divide-y divide-gray-200">
                                     <InfoItem icon={FiMapPin} label="Location">
                                         {classData.location?.address && <p>{classData.location.address}</p>}
                                         <p>{classData.city || 'Location TBD'}</p>
                                         {classData.location?.mapLink && (
                                             <a href={classData.location.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                                 View Map
                                             </a>
                                         )}
                                     </InfoItem>
                                     <InfoItem icon={FiUsers} label="Enrollment">
                                         {classData.capacity ? `${classData.registeredStudents?.length ?? 0} / ${classData.capacity} Registered` : 'Capacity TBD'}
                                         {!classIsFull && spotsAvailable <= 5 && spotsAvailable > 0 && (
                                             <span className="ml-2 text-xs font-bold text-yellow-700">(Only {spotsAvailable} spot{spotsAvailable !== 1 ? 's' : ''} left!)</span>
                                         )}
                                     </InfoItem>
                                     <InfoItem icon={FiDollarSign} label="Cost">
                                         {classData.cost === 0 ? 'Free' : classData.cost ? `$${classData.cost}` : 'Cost TBD'}
                                     </InfoItem>
                                     <InfoItem icon={FiUserCheck} label="Target Audience">
                                         <p className="capitalize">{classData.targetGender === 'any' ? 'Open to all' : `${classData.targetGender} focused`}</p>
                                         {classData.targetAgeRange && (
                                             <p>Ages {classData.targetAgeRange.min} - {classData.targetAgeRange.max}</p>
                                         )}
                                     </InfoItem>
                                 </dl>

                                 {/* Registration Section */}
                                 <div className="mt-8 pt-8 border-t border-gray-200">
                                     {/* Success Message */}
                                     {registerSuccess && !registerError && (
                                         <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
                                             <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                             <p className="text-sm font-medium text-green-800">Successfully registered!</p>
                                         </div>
                                     )}

                                     {/* Error Message */}
                                     {registerError && (
                                         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
                                             <FiAlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                                             <p className="text-sm font-medium text-red-800">{registerError}</p>
                                         </div>
                                     )}

                                     {/* Registration Button/Status */}
                                     {alreadyRegistered ? (
                                         <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                                             <FiUserCheck className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                             <p className="font-medium text-blue-800">You are registered!</p>
                                             <Link
                                                to="/dashboard" // Link to user's dashboard
                                                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                 View in Dashboard
                                            </Link>
                                         </div>
                                     ) : classIsFull ? (
                                         <button
                                             type="button"
                                             disabled
                                             className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-400 cursor-not-allowed"
                                         >
                                             <FiAlertCircle className="mr-2 h-5 w-5" /> Class Full
                                         </button>
                                     ) : (
                                         <motion.button
                                             type="button"
                                             onClick={handleRegister}
                                             disabled={registering}
                                             className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition duration-150 ease-in-out ${
                                                 registering
                                                     ? 'bg-blue-400 cursor-not-allowed'
                                                     : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                             }`}
                                             whileHover={{ scale: registering ? 1 : 1.03 }}
                                             whileTap={{ scale: registering ? 1 : 0.98 }}
                                         >
                                             {registering ? (
                                                 <>
                                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                     </svg>
                                                     Registering...
                                                 </>
                                             ) : isAuthenticated ? (
                                                 'Register for Class'
                                             ) : (
                                                  <> <FiLogIn className="mr-2 h-5 w-5"/> Login to Register </>
                                             )}
                                         </motion.button>
                                     )}
                                      {!isAuthenticated && !alreadyRegistered && !classIsFull && (
                                         <p className="mt-3 text-xs text-center text-gray-500">
                                             You need to <Link to={`/login?redirect=/classes/${id}`} className="font-medium text-blue-600 hover:underline">log in</Link> or <Link to={`/register?redirect=/classes/${id}`} className="font-medium text-blue-600 hover:underline">sign up</Link> to register.
                                         </p>
                                      )}
                                 </div>
                             </div>
                         </div>
                     </div>

                 </div>
            </div>

             {/* Footer Section */}
            <footer className="bg-gray-800 text-gray-400 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    &copy; {new Date().getFullYear()} StandStrong Self-Defense. All rights reserved. | Boston, MA
                </div>
            </footer>

        </div>
    );
};

export default ClassDetailPage;