// src/pages/admin/RegistrationsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
    FiUsers, FiList, FiFilter, FiRefreshCw, FiEdit, FiTrash2, FiAlertCircle, FiCheckCircle, FiLoader, FiChevronDown
} from 'react-icons/fi';

// --- You'll need service functions (Step 2) ---
import { getClasses } from '/src/services/classService.js';
import { getClassRegistrations, updateRegistration, deleteRegistration } from '/src/services/registrationService.js';

const LoadingSpinner = () => ( /* Add a simple loading spinner component */
    <div className="flex justify-center items-center py-10">
        <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
    </div>
);

const ErrorDisplay = ({ message }) => ( /* Simple error display */
    <div className="my-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center">
        <FiAlertCircle className="h-5 w-5 mr-2" /> {message}
    </div>
);

const SuccessDisplay = ({ message }) => ( /* Simple success display */
     <div className="my-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center">
         <FiCheckCircle className="h-5 w-5 mr-2" /> {message}
     </div>
 );


const RegistrationsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingRegistrationId, setProcessingRegistrationId] = useState(null); // Track which registration is being updated/deleted

    // --- Fetch Classes for Dropdown ---
    useEffect(() => {
        const fetchClasses = async () => {
            setLoadingClasses(true);
            setError('');
            try {
                const data = await getClasses(); // Fetch all classes
                setClasses(data || []);
                if (data && data.length > 0) {
                    // Optionally select the first class by default
                    // setSelectedClassId(data[0]._id);
                }
            } catch (err) {
                console.error("Error fetching classes:", err);
                setError('Failed to load classes list.');
                setClasses([]);
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, []);

    // --- Fetch Registrations when Class Changes ---
    const fetchRegistrationsForClass = useCallback(async (classId) => {
        if (!classId) {
            setRegistrations([]);
            return;
        }
        setLoadingRegistrations(true);
        setError('');
        setSuccess('');
        try {
            const data = await getClassRegistrations(classId);
            setRegistrations(data || []);
        } catch (err) {
            console.error(`Error fetching registrations for class ${classId}:`, err);
            setError(err.response?.data?.message || 'Failed to load registrations.');
            setRegistrations([]);
        } finally {
            setLoadingRegistrations(false);
        }
    }, []); // Dependencies: getClassRegistrations service function

    useEffect(() => {
        fetchRegistrationsForClass(selectedClassId);
    }, [selectedClassId, fetchRegistrationsForClass]);

    // --- Handle Actions ---
    const handleStatusChange = async (registrationId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to '${newStatus}'?`)) return;

        setProcessingRegistrationId(registrationId);
        setError('');
        setSuccess('');
        try {
            await updateRegistration(registrationId, { status: newStatus });
            setSuccess('Registration status updated successfully!');
            // Refresh data for the current class
            fetchRegistrationsForClass(selectedClassId);
        } catch (err) {
            console.error("Error updating registration status:", err);
            setError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setProcessingRegistrationId(null);
        }
    };

    const handleDelete = async (registrationId) => {
         if (!window.confirm('Are you sure you want to unenroll this student? This action cannot be undone.')) return;

         setProcessingRegistrationId(registrationId);
         setError('');
         setSuccess('');
         try {
            await deleteRegistration(registrationId);
            setSuccess('Student unenrolled successfully!');
            // Refresh data
            fetchRegistrationsForClass(selectedClassId);
         } catch (err) {
            console.error("Error deleting registration:", err);
            setError(err.response?.data?.message || 'Failed to unenroll student.');
         } finally {
            setProcessingRegistrationId(null);
         }
    };

    const selectedClassDetails = useMemo(() => {
        return classes.find(c => c._id === selectedClassId);
    }, [classes, selectedClassId]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiList className="mr-3 h-6 w-6" /> Class Registrations
            </h1>

            {/* Global Error/Success Display */}
            {error && <ErrorDisplay message={error} />}
            {success && <SuccessDisplay message={success} />}

            {/* Class Selector */}
            <div className="mb-6 bg-white p-4 shadow rounded-lg">
                <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Select a Class to View Registrations
                </label>
                <select
                    id="classSelect"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={loadingClasses}
                >
                    <option value="">-- Select a Class --</option>
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                            {cls.title} ({cls.city})
                        </option>
                    ))}
                </select>
                {loadingClasses && <p className="text-sm text-gray-500 mt-1">Loading classes...</p>}
            </div>

            {/* Registrations Table */}
            {selectedClassId ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <h2 className="text-lg font-semibold text-gray-800 px-4 py-3 border-b">
                        Registrations for: {selectedClassDetails?.title || '...'}
                    </h2>
                    {loadingRegistrations ? (
                        <LoadingSpinner />
                    ) : registrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {registrations.map((reg) => (
                                        <tr key={reg._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{reg.user?.firstName} {reg.user?.lastName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{reg.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{format(new Date(reg.registrationDate), 'PPp')}</div> {/* Format date and time */}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    reg.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                                    reg.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800' // Cancelled statuses
                                                }`}>
                                                    {reg.status.replace(/_/g, ' ')} {/* Nicer display */}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {/* Action Buttons */}
                                                <select
                                                    value={reg.status}
                                                    onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                                                    className="text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={processingRegistrationId === reg._id}
                                                    title="Change Status"
                                                >
                                                     <option value="enrolled">Enrolled</option>
                                                     <option value="waitlisted">Waitlisted</option>
                                                     <option value="cancelled_by_admin">Cancel (Admin)</option>
                                                     {/* Keep cancelled_by_user if it exists, but maybe don't allow admin to select it */}
                                                     {reg.status === 'cancelled_by_user' && <option value="cancelled_by_user">Cancelled (User)</option>}
                                                </select>

                                                <button
                                                    onClick={() => handleDelete(reg._id)}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    disabled={processingRegistrationId === reg._id}
                                                    title="Unenroll Student"
                                                >
                                                    <FiTrash2 className="h-4 w-4 inline" />
                                                </button>
                                                 {processingRegistrationId === reg._id && <FiLoader className="h-4 w-4 inline animate-spin text-gray-500" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center px-6 py-12">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Registrations Found</h3>
                            <p className="mt-1 text-sm text-gray-500">There are currently no students registered for this class.</p>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="text-center px-6 py-12 bg-white rounded-lg shadow">
                     <FiFilter className="mx-auto h-12 w-12 text-gray-400" />
                     <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Class</h3>
                     <p className="mt-1 text-sm text-gray-500">Please choose a class from the dropdown above to view its registrations.</p>
                 </div>
            )}
        </div>
    );
};

export default RegistrationsPage;