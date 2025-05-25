// client/src/services/attendanceService.js
import api from './api';

// Create attendance record (admin only)
export const createAttendanceRecord = async (classId, sessionDate) => {
  const response = await api.post('/attendance', { classId, sessionDate });
  return response.data;
};

// Check in a student
export const checkInStudent = async (attendanceId) => {
  const response = await api.post(`/attendance/${attendanceId}/checkin`);
  return response.data;
};

// Update attendance status (admin only)
export const updateAttendanceStatus = async (attendanceId, studentId, status) => {
  const response = await api.put(`/attendance/${attendanceId}/status`, { studentId, status });
  return response.data;
};

// Get class attendance (admin only)
export const getClassAttendance = async (classId) => {
  const response = await api.get(`/attendance/class/${classId}`);
  return response.data;
};

// Get attendance by ID (admin only)
export const getAttendanceById = async (id) => {
  const response = await api.get(`/attendance/${id}`);
  return response.data;
};

// Get attendance stats (admin only)
export const getAttendanceStats = async (classId) => {
  const response = await api.get(`/attendance/stats/${classId}`);
  return response.data;
};