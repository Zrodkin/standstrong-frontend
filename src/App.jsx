// client/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider } from './context/ClassContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { Analytics } from "@vercel/analytics/react"

// Layouts
import MainLayout from './Layouts/MainLayout';
import AuthLayout from './Layouts/AuthLayout';
import AdminLayout from './Layouts/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import ClassesPage from './pages/ClassesPage';
import ClassDetailPage from './pages/ClassDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student pages
import ProfilePage from './pages/student/ProfilePage';
import StudentDashboardPage from './pages/student/DashboardPage';
import ClassRegistrationPage from './pages/student/ClassRegistrationPage';
import CheckInPage from './pages/student/CheckInPage';
import AttendanceHistoryPage from './pages/student/AttendanceHistoryPage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminClassesPage from './pages/admin/ClassesPage';
import AdminClassFormPage from './pages/admin/ClassFormPage';
import AdminStudentsPage from './pages/admin/StudentsPage';
import AdminAttendancePage from './pages/admin/AttendancePage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminCityFormPage from './pages/admin/AdminCityFormPage';
import AdminCitiesPage from './pages/admin/AdminCitiesPage';
import AdminCityEditPage from './pages/admin/AdminCityEditPage.jsx';
import AdminRegistrationsPage from './pages/admin/RegistrationsPage';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
          <details className="whitespace-pre-wrap">
            <summary>View error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Routes component (which has access to AuthProvider context)
const AppRoutes = () => {
  const auth = useAuth();
  
  // Log auth state to help diagnose issues
  useEffect(() => {
    console.log("Auth state:", {
      isAuthenticated: auth?.isAuthenticated,
      isAdmin: auth?.isAdmin,
      loading: auth?.loading
    });
  }, [auth]);

  // Make sure auth context is available
  if (!auth) {
    console.error("Auth context is undefined");
    return <div>Error: Authentication context not available</div>;
  }

  const { isAuthenticated, isAdmin, loading } = auth;

  // Protected route component
  const PrivateRoute = ({ element }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  // Admin route component
  const AdminRoute = ({ element }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return isAdmin ? element : <Navigate to="/" />;
  };

  try {
    return (
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } 
        />
        <Route 
          path="/classes" 
          element={
            <MainLayout>
              <ClassesPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/classes/:id" 
          element={
            <MainLayout>
              <ClassDetailPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/login" 
          element={
            <AuthLayout title="Sign in to your account">
              <LoginPage />
            </AuthLayout>
          } 
        />
        <Route 
          path="/register" 
          element={
            <AuthLayout title="Create your account" subtitle="Join Stand Strong to register for self-defense classes">
              <RegisterPage />
            </AuthLayout>
          } 
        />

        {/* Student routes */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute 
              element={
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              } 
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute 
              element={
                <MainLayout>
                  <StudentDashboardPage />
                </MainLayout>
              } 
            />
          } 
        />
        <Route 
          path="/register-class/:id" 
          element={
            <PrivateRoute 
              element={
                <MainLayout>
                  <ClassRegistrationPage />
                </MainLayout>
              } 
            />
          } 
        />
        <Route 
          path="/check-in/:id" 
          element={
            <PrivateRoute 
              element={
                <MainLayout>
                  <CheckInPage />
                </MainLayout>
              } 
            />
          } 
        />
        <Route 
          path="/attendance-history" 
          element={
            <PrivateRoute 
              element={
                <MainLayout>
                  <AttendanceHistoryPage />
                </MainLayout>
              } 
            />
          } 
        />

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute 
              element={<AdminLayout />} 
            />
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="classes/new" element={<AdminClassFormPage />} />
          <Route path="classes/edit/:id" element={<AdminClassFormPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="cities/new" element={<AdminCityFormPage />} />
          <Route path="cities" element={<AdminCitiesPage />} />
          <Route path="cities/edit/:id" element={<AdminCityEditPage />} />
        </Route>

       

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } catch (error) {
    console.error("Error rendering AppRoutes:", error);
    return <div>Something went wrong loading the application routes. Please try again later.</div>;
  }
};

function App() {
  return (
    <>
      
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <ClassProvider>
              <AttendanceProvider>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </AttendanceProvider>
            </ClassProvider>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
      <Analytics />
    </>
  );
}

export default App;