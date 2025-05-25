// D:/StandStrong/frontend/src/pages/student/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiSave, FiLoader } from 'react-icons/fi'; // Example icons

// Reusable Input Component (Optional, but good practice)
const InputField = ({ id, label, type = 'text', value, onChange, icon: Icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <div className="relative rounded-md shadow-sm">
            {Icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <input
                type={type}
                id={id}
                name={id} // Use id as name for easier generic handler
                className={`block w-full rounded-md border-gray-300 ${Icon ? 'pl-10' : 'px-3'} py-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100`}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    </div>
);

const ProfilePage = () => {
    const { currentUser, updateUserProfile, error: contextError } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '', // Display only or editable? Let's make it editable based on controller
        age: '',
        gender: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Local error for form submission
    const [success, setSuccess] = useState('');

    // Populate form when currentUser data is available or changes
    useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                age: currentUser.age || '',
                gender: currentUser.gender || '',
                phone: currentUser.phone || '',
                // DO NOT load password here
            });
        }
    }, [currentUser]);

    // Generic handler for form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear success/error messages on change
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Prepare only the data we want to send for update
        // Exclude password from this form's submission
        const profileDataToUpdate = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            age: formData.age,
            gender: formData.gender,
            phone: formData.phone,
        };

        try {
            await updateUserProfile(profileDataToUpdate);
            // Context automatically updates currentUser on success
            setSuccess('Profile updated successfully!');
        } catch (err) {
            // Error might already be set in context, but we can set a local one too
            setError(err.response?.data?.message || contextError || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        // Handle case where user data hasn't loaded yet or user is logged out
        // (though usually protected routes handle logged-out state)
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            {/* Display Success/Error Messages */}
            {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200" role="alert">{success}</div>}
            {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        id="firstName"
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        icon={FiUser}
                        required
                    />
                    <InputField
                        id="lastName"
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        icon={FiUser}
                        required
                    />
                </div>

                <InputField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={FiMail}
                    required
                    // Consider adding a note if changing email requires verification
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputField
                        id="age"
                        label="Age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                    />
                     <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                         <select
                             id="gender"
                             name="gender"
                             className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                             value={formData.gender}
                             onChange={handleChange}
                         >
                             <option value="">Select Gender</option>
                             <option value="male">Male</option>
                             <option value="female">Female</option>
                             <option value="other">Other</option>
                             <option value="prefer_not_to_say">Prefer not to say</option>
                         </select>
                     </div>
                </div>

                 <InputField
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={FiPhone}
                    placeholder="Optional"
                />


                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Saving...
                            </>
                        ) : (
                             <>
                                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                                Save Changes
                             </>
                        )}
                    </button>
                </div>
            </form>

             {/* Placeholder for Password Change */}
             {/* It's recommended to handle password changes separately */}
             <div className="mt-8 p-6 bg-white shadow rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Security</h2>
                  <p className="text-sm text-gray-600 mb-4">
                      For security reasons, password changes must be done separately.
                  </p>
                  {/* Link or button to navigate to a dedicated Change Password page/modal */}
                  <button
                      type="button"
                      onClick={() => alert('Navigate to Change Password page (TODO)')} // Replace with navigation
                      className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                      Change Password
                  </button>
             </div>
        </div>
    );
};

export default ProfilePage;