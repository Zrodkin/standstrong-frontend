// D:/StandStrong/frontend/src/pages/admin/AdminSettingsPage.jsx
import React, { useState } from 'react';
// Import necessary services for settings later, e.g.:
// import { getSettings, updateSettings } from '../../services/settingService';
import { FiSave, FiLoader, FiSettings } from 'react-icons/fi';

const AdminSettingsPage = () => {
    // --- State for actual settings (Example structure - replace later) ---
    // const [settings, setSettings] = useState({
    //     siteName: '',
    //     contactEmail: '',
    //     defaultCapacity: 10,
    //     enableFeatureX: false,
    // });
    const [loading, setLoading] = useState(false); // For fetching initial settings
    const [isSaving, setIsSaving] = useState(false); // For saving changes
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- Fetch existing settings (Implement later) ---
    // useEffect(() => {
    //     const fetchSettings = async () => {
    //         setLoading(true);
    //         setError('');
    //         try {
    //             // const currentSettings = await getSettings();
    //             // setSettings(currentSettings || { /* default values */ });
    //             console.log("TODO: Fetch settings from backend");
    //             await new Promise(res => setTimeout(res, 500)); // Simulate loading
    //         } catch (err) {
    //             setError('Failed to load settings.');
    //             console.error(err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchSettings();
    // }, []);

    // --- Handle Input Changes (Implement later based on actual fields) ---
    // const handleChange = (e) => {
    //     const { name, value, type, checked } = e.target;
    //     setSettings(prev => ({
    //         ...prev,
    //         [name]: type === 'checkbox' ? checked : value,
    //     }));
    //     setSuccess('');
    //     setError('');
    // };

    // --- Handle Form Submission (Implement later) ---
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSaving(true);
    //     setError('');
    //     setSuccess('');
    //     try {
    //         // const updatedSettings = await updateSettings(settings);
    //         // setSettings(updatedSettings); // Update state with response if needed
    //          console.log("TODO: Save settings to backend", settings);
    //         await new Promise(res => setTimeout(res, 1000)); // Simulate saving
    //         setSuccess('Settings saved successfully!');
    //     } catch (err) {
    //         setError('Failed to save settings.');
    //         console.error(err);
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };

    // --- Render Logic ---

    if (loading) {
        return <div className="text-center p-10">Loading settings...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiSettings className="mr-3 h-6 w-6" /> Application Settings
            </h1>

             {/* Display Global Success/Error Messages */}
             {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200" role="alert">{success}</div>}
             {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">{error}</div>}

            {/* --- Placeholder Form --- */}
            {/* Replace this entire form element once you define settings */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8"> {/* Prevent default submit for now */}

                {/* Example Section: Site Configuration */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Site Configuration</h2>
                    <div className="space-y-4">
                         {/* Placeholder for Site Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Site Name (Example)</label>
                            <input type="text" disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100" placeholder="Setting not implemented" />
                        </div>
                        {/* Placeholder for Contact Email Input */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Email (Example)</label>
                            <input type="email" disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100" placeholder="Setting not implemented" />
                        </div>
                         {/* Add more setting inputs here */}
                    </div>
                </div>

                 {/* Example Section: Notification Settings */}
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                     <div className="space-y-4">
                        {/* Placeholder for Checkbox */}
                        <div className="flex items-start">
                             <div className="flex h-5 items-center">
                                 <input id="email-notifications" name="email-notifications" type="checkbox" disabled className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                             </div>
                             <div className="ml-3 text-sm">
                                 <label htmlFor="email-notifications" className="font-medium text-gray-700">Enable Email Notifications (Example)</label>
                                 <p className="text-gray-500">Control whether certain emails are sent.</p>
                             </div>
                         </div>
                         {/* Add more notification settings here */}
                    </div>
                </div>

                {/* --- Save Button (Disabled for now) --- */}
                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="submit" // Change to "submit" when handleSubmit is implemented
                            // onClick={handleSubmit} // Use onClick if not using form submission
                            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            disabled={true || isSaving} // Disabled until implemented
                        >
                            {isSaving ? (
                                <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            ) : (
                                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                            )}
                            Save Settings (Disabled)
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;