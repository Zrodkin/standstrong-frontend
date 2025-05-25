// frontend/src/services/userService.js
import api from './api';

/**
 * Fetches users with filtering, sorting and pagination support
 * @param {Object} params - Query parameters
 * @param {string} [params.search] - Search term to filter users by name, email, phone
 * @param {string} [params.branch] - Filter by branch location
 * @param {string} [params.status] - Filter by status (active, inactive)
 * @param {string} [params.enrollmentStatus] - Filter by enrollment status
 * @param {Array<string>} [params.tags] - Filter by tags
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=10] - Number of results per page
 * @param {string} [params.sort='lastName'] - Field to sort by
 * @param {string} [params.direction='asc'] - Sort direction (asc or desc)
 * @returns {Promise<Object>} - Promise resolving to user data with pagination info
 */
export const getUsers = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(item => queryParams.append(key, item));
                } else {
                    queryParams.append(key, value);
                }
            }
        });

        const response = await api.get(`/users/admin?${queryParams.toString()}`);

        if (Array.isArray(response.data)) {
            return {
                users: response.data,
                total: response.data.length,
                page: params.page || 1,
                limit: params.limit || 10,
                totalPages: Math.ceil(response.data.length / (params.limit || 10))
            };
        }

        return response.data;
    } catch (error) {
        console.error("Failed to fetch users:", error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Gets a single user by ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Gets all registrations for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserRegistrations = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}/registrations`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch registrations for user ${userId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Gets all branches/locations
 * @returns {Promise<Array>}
 */
export const getBranches = async () => {
    try {
        const response = await api.get('/classes/cities');
        return response.data.map((city, index) => ({
            id: String(index + 1),
            name: city,
            studentCount: 0,
            activeClasses: 0
        }));
    } catch (error) {
        console.error("Failed to fetch branches:", error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Gets all user tags
 * @returns {Promise<Array<string>>}
 */
export const getTags = async () => {
    try {
        return ["new member", "premium", "scholarship", "volunteer", "instructor referral"];
    } catch (error) {
        console.error("Failed to fetch tags:", error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Exports students data based on filters and triggers a download
 * @param {Object} filters - Filters to apply to the export
 * @returns {Promise<Object>} - Promise resolving to export result
 */
export const exportStudents = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(item => queryParams.append(key, item));
                } else {
                    queryParams.append(key, value);
                }
            }
        });

        // Change from /students/export to /users/export to match your backend routes
        const response = await api.get(`/users/export?${queryParams.toString()}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'students_export.csv'); // Adjust filename and extension if needed
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error("Failed to export students:", error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Deletes a user by ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const deleteUserById = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete user ${userId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};

// Add any other user-related service functions that might be needed
