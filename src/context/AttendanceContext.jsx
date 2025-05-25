// frontend/src/context/AttendanceContext.jsx
import React, { createContext, useState } from 'react';
import {
  createAttendanceRecord,
  checkInStudent,
  updateAttendanceStatus,
  getClassAttendance,
  getAttendanceById,
  getAttendanceStats,
} from '../services/attendanceService';

const AttendanceContext = createContext(null);

// Export the provider component
export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new attendance record (admin only)
  const createAttendance = async (classId, sessionDate) => {
    try {
      setLoading(true);
      setError(null);
      const newRecord = await createAttendanceRecord(classId, sessionDate);
      setAttendanceRecords([...attendanceRecords, newRecord]);
      return newRecord;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create attendance record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Student check-in
  const studentCheckIn = async (attendanceId) => {
    try {
      setLoading(true);
      setError(null);
      await checkInStudent(attendanceId);
      // Refresh attendance records
      const classId = attendanceRecords[0]?.class;
      if (classId) {
        const updatedRecords = await getClassAttendance(classId);
        setAttendanceRecords(updatedRecords);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update attendance status (admin only)
  const updateStatus = async (attendanceId, studentId, status) => {
    try {
      setLoading(true);
      setError(null);
      await updateAttendanceStatus(attendanceId, studentId, status);
      // Refresh attendance records
      const classId = attendanceRecords[0]?.class;
      if (classId) {
        const updatedRecords = await getClassAttendance(classId);
        setAttendanceRecords(updatedRecords);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update attendance status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get attendance records for a class (admin only)
  const fetchClassAttendance = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const records = await getClassAttendance(classId);
      setAttendanceRecords(records);
      return records;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get attendance record by ID (admin only)
  const fetchAttendanceById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const record = await getAttendanceById(id);
      return record;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get attendance stats for a class (admin only)
  const fetchAttendanceStats = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getAttendanceStats(classId);
      setAttendanceStats(stats);
      return stats;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    attendanceRecords,
    attendanceStats,
    loading,
    error,
    createAttendance,
    studentCheckIn,
    updateStatus,
    fetchClassAttendance,
    fetchAttendanceById,
    fetchAttendanceStats,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// Export the hook as a named function declaration instead of an arrow function
export function useAttendance() {
  const context = React.useContext(AttendanceContext);
  if (context === null) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}