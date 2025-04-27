// frontend/src/Layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    FiMenu,
    FiX,
    FiHome,
    FiUsers,
    FiCalendar,
    FiBarChart2,
    FiLogOut,
    FiSettings,
    FiMapPin,
    FiList
} from 'react-icons/fi';
// Assuming useAuth is correctly defined in your AuthContext
import { useAuth } from '../context/AuthContext.jsx';




const AdminLayout = () => {
    // Default sidebar state can depend on screen size if needed
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
    const { logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

     // Close mobile sidebar on navigation
     useEffect(() => {
        setIsSidebarOpen(false);
     }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/login'); // Redirect to login after admin logout
        } catch(error) {
            console.error("Admin logout failed:", error);
             // Handle error display if necessary
        }
    };

    // Define navigation items structure
    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: FiHome, end: true }, // Use end prop for exact match
        { name: 'Classes', href: '/admin/classes', icon: FiCalendar, end: false },
        { name: 'Students', href: '/admin/students', icon: FiUsers, end: false },
        { name: 'Registrations', href: '/admin/registrations', icon: FiList, end: false },
        { name: 'Attendance', href: '/admin/attendance', icon: FiBarChart2, end: false },
        { name: 'Settings', href: '/admin/settings', icon: FiSettings, end: false },
        { name: 'Cities', href: '/admin/cities', icon: FiMapPin, end: false },

    ];

    // Function to determine active link class
    // Using location.pathname.startsWith might be better for nested routes
    const isActiveLink = (href, end) => {
       return end ? location.pathname === href : location.pathname.startsWith(href);
    };

    // Sidebar content component for DRYness
    // Sidebar content component
    const SidebarContent = ({ mobile = false }) => (
        <>
            <div className={`flex items-center h-16 flex-shrink-0 px-4 ${mobile ? '' : 'bg-primary-800'}`}>
                <Link to="/admin" className="text-white font-bold text-xl">
                    Admin Panel
                </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className={`flex-1 px-2 ${mobile ? 'mt-5' : 'py-4'} space-y-1`}>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`${
                                isActiveLink(item.href, item.end)
                                    ? 'bg-primary-800 text-white' // Active styles
                                    : 'text-primary-100 hover:bg-primary-600 hover:text-white' // Inactive styles
                            } group flex items-center px-2 py-2 text-${mobile ? 'base' : 'sm'} font-medium rounded-md transition duration-150 ease-in-out`}
                        >
                            <item.icon
                                className={`${
                                    isActiveLink(item.href, item.end)
                                        ? 'text-primary-300' // Active icon
                                        : 'text-primary-300 group-hover:text-primary-100' // Inactive icon
                                } mr-3 flex-shrink-0 h-6 w-6`}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-shrink-0 w-full group block focus:outline-none"
                    aria-label="Logout"
                >
                    <div className="flex items-center">
                        <div>
                            <FiLogOut className="inline-block h-6 w-6 text-primary-300 group-hover:text-primary-100" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-primary-100 group-hover:text-white">
                                Logout
                            </p>
                        </div>
                    </div>
                </button>
            </div>
       </>
    );


    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* --- Mobile Sidebar --- */}
            {isSidebarOpen && (
                <div className="fixed inset-0 flex z-40 lg:hidden" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300"
                        aria-hidden="true"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary-700 transition-transform ease-in-out duration-300 transform">
                         <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsSidebarOpen(false)}
                                aria-label="Close sidebar"
                            >
                                <FiX className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <SidebarContent mobile={true} />
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
                </div>
            )}

            {/* --- Static Sidebar for Desktop --- */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-primary-700">
                        <SidebarContent mobile={false} />
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                         aria-controls="mobile-sidebar"
                    >
                        <FiMenu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;