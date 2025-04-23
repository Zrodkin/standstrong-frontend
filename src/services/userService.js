// frontend/src/services/userService.js
import api from './api'; // Assuming api.js is configured correctly with interceptors

/**
 * Fetches all users (Admin only).
 * The required auth token is automatically added by the api interceptor.
 * @returns {Promise<Array<User>>} A promise that resolves to an array of user objects.
 */
export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        // The backend controller returns the array of users directly
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error.response?.data?.message || error.message);
        // Re-throw the error so the component can handle it
        throw error;
    }
};

/**
 * Deletes a user by ID (Admin only).
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<Object>} A promise that resolves to the response data (e.g., success message).
 */
export const deleteUserById = async (userId) => {
     if (!userId) throw new Error("User ID is required for deletion.");
     try {
         // TODO: Confirm backend route exists for deleting users (e.g., DELETE /api/users/:id)
         // Example assuming DELETE /api/users/:id exists:
         // const response = await api.delete(`/users/${userId}`);
         // return response.data;

         // Placeholder since delete route wasn't explicitly shown before
         console.warn(`Deletion requested for ${userId}, but backend route needs confirmation.`);
         await new Promise(res => setTimeout(res, 300)); // Simulate delay
         return { message: 'User deletion endpoint not implemented in this example.' }; // Placeholder response
     } catch (error) {
         console.error(`Failed to delete user ${userId}:`, error.response?.data?.message || error.message);
         throw error;
     }
 };

// Add other user-related service functions here if needed (e.g., getUserById(admin), updateUserRole(admin))