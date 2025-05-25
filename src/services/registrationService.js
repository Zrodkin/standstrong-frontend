// src/services/registrationService.js
import api from './api'; // Assuming you have a configured axios instance


// Fetch all registrations for a specific class (Admin)
export const getClassRegistrations = async (classId) => {
    try {
        const response = await api.get(`/registrations/class/${classId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching registrations for class ${classId}:`, error.response || error);
        throw error; // Re-throw to be caught in the component
    }
};

// Update a registration status or notes (Admin)
export const updateRegistration = async (registrationId, updateData) => {
    // updateData should be an object like { status: '...', notes: '...' }
    try {
        const response = await api.put(`/registrations/${registrationId}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating registration ${registrationId}:`, error.response || error);
        throw error;
    }
};

// Delete a registration (Admin unenrolls)
export const deleteRegistration = async (registrationId) => {
    try {
        const response = await api.delete(`/registrations/${registrationId}`);
        return response.data; // Usually just { message: '...' }
    } catch (error) {
        console.error(`Error deleting registration ${registrationId}:`, error.response || error);
        throw error;
    }
};

// --- Optional / For Student Side Refactoring ---

// Create a new registration (Student Action)
export const createRegistration = async (classId) => {
    try {
        // The backend expects { classId: '...' } in the body
        const response = await api.post('/registrations', { classId });
        return response.data;
    } catch (error) {
         console.error(`Error creating registration for class ${classId}:`, error.response || error);
         throw error;
    }
};

// Fetch registrations for the logged-in user
export const getMyRegistrations = async () => {
    try {
        const response = await api.get('/registrations/my');
        return response.data;
    } catch (error) {
         console.error(`Error fetching my registrations:`, error.response || error);
         throw error;
    }
};

// Cancel a registration (Student Action)
export const cancelMyRegistration = async (registrationId) => {
    try {
        const response = await api.put(`/registrations/${registrationId}/cancel`);
        return response.data;
    } catch (error) {
         console.error(`Error cancelling registration ${registrationId}:`, error.response || error);
         throw error;
    }
};