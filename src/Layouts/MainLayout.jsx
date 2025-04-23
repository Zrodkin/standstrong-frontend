// frontend/src/Layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiBookOpen, FiGrid, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // Adjust path if
import siteLogo from '../assets/ss-newlogo.svg';

const MainLayout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Use the (currently mock) useAuth hook
    const { currentUser, logoutUser, isAdmin: isAdminFromContext } = useAuth(); // Renamed to avoid conflict if needed
    const navigate = useNavigate();
    const location = useLocation();

    // Derive isAdmin based on the actual currentUser from context
    // This makes the mock above directly control the outcome for demonstration
    // In your real app, this derivation should happen inside AuthContext.jsx
    const isAdmin = currentUser?.role === 'admin';

    // Close mobile menu automatically on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);


    const handleLogout = async () => {
        try {
          await logoutUser();
          navigate('/login');
        } catch(error) {
          console.error("Logout failed:", error);
        }
    };

    // Define navigation links
    // The conditional logic for Admin link is already correct!
    const navLinks = [
        { name: 'Home', href: '/', icon: FiHome, end: true },
        { name: 'Classes', href: '/classes', icon: FiBookOpen, end: false },
        // This spread (...) correctly adds the Admin object ONLY if isAdmin is true
        ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: FiGrid, end: false }] : []),
    ];

    // Define NavLink classes - Added subtle hover background and bolder active state
    const navLinkBaseClass = "border-transparent text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium rounded-md transition duration-150 ease-in-out"; // Added px-3, py-2, rounded-md, hover:bg
    const navLinkActiveClass = "border-primary-500 text-primary-700 font-semibold bg-primary-50"; // Added font-semibold, bg-primary-50
    const mobileNavLinkBaseClass = "border-transparent text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium";
    const mobileNavLinkActiveClass = "bg-primary-50 border-primary-500 text-primary-700 font-semibold"; // Added font-semibold

    // Functions to determine NavLink className based on active state
    const getNavLinkClass = ({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ''}`;
    const getMobileNavLinkClass = ({ isActive }) => `${mobileNavLinkBaseClass} ${isActive ? mobileNavLinkActiveClass : ''}`;


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {/* Navigation Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
              <div className="flex justify-between h-16">
                {/* Left side: Logo and Desktop Nav */}
                <div className="flex items-center">
                  {/* Logo replacement */}
                  <Link to="/" className="flex-shrink-0">
                    <img src={siteLogo} alt="Stand Strong Logo" className="h-8" /> 
                  </Link>
                  {/* <div className="flex-shrink-0 flex items-center gap-2" aria-label="Stand Strong Home">
                    <FiActivity className="h-8 w-auto text-primary-600" />
                    <span className="text-primary-700 font-bold text-xl">Stand Strong</span>
                            </Link>
                            {/* Desktop Navigation Links */}
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-4"> {/* Reduced space */}
                                {navLinks.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        end={item.end}
                                        className={getNavLinkClass}
                                    >
                                        {/* Optionally add icons back if desired */}
                                        {/* <item.icon className="mr-2 h-5 w-5" /> */}
                                        {item.name}
                                    </NavLink>
                                ))}
                                {/* Admin link is conditionally added here by the spread operator above */}
                            </div>
                        </div>

                        {/* Right side: User Actions (Desktop) */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            {currentUser ? (
                                <div className="flex items-center space-x-3"> {/* Adjusted spacing */}
                                    {/* Dashboard Link - check if role should determine destination */}
                                    <NavLink
                                        // If you have different dashboards:
                                        // to={isAdmin ? "/admin" : "/dashboard"}
                                        to="/dashboard" // Assuming a single dashboard path for now
                                        className={getNavLinkClass}
                                        aria-label="User Dashboard"
                                    >
                                        <FiUser className="mr-1.5 h-5 w-5" />
                                        Dashboard
                                    </NavLink>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className={`${navLinkBaseClass} text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300`} // Added specific logout hover colors
                                        aria-label="Logout"
                                    >
                                        <FiLogOut className="mr-1.5 h-5 w-5" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3"> {/* Adjusted spacing */}
                                    <NavLink
                                        to="/login"
                                        className={getNavLinkClass}
                                    >
                                        Login
                                    </NavLink>
                                    {/* Styled Sign Up as a primary button */}
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <FiX className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <FiMenu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile menu Panel - Added simple transition */}
                <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1 px-2 border-t border-gray-200"> {/* Added padding and border */}
                       {navLinks.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.end}
                                className={getMobileNavLinkClass}
                            >
                                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                    {/* Mobile User Actions */}
                    <div className="pt-4 pb-3 border-t border-gray-200 px-2">
                        {currentUser ? (
                            <div className="space-y-1">
                                <NavLink
                                    to="/dashboard" // Or dynamic based on role
                                    className={getMobileNavLinkClass}
                                >
                                   <FiUser className="mr-3 h-6 w-6" aria-hidden="true"/>
                                   Dashboard
                                </NavLink>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`${mobileNavLinkBaseClass} w-full text-left flex items-center text-red-600 hover:bg-red-50 hover:text-red-700`} // Logout styling
                                >
                                    <FiLogOut className="mr-3 h-6 w-6" aria-hidden="true"/>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <NavLink
                                    to="/login"
                                    className={getMobileNavLinkClass}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className={getMobileNavLinkClass}
                                >
                                    Sign Up
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow">
                {/* Increased padding */}
                <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                    {children} {/* Page-specific content */}
                </div>
            </main>

            {/* Footer */}
            {/* Added subtle background and more padding */}
            <footer className="bg-white border-t border-gray-200 mt-auto py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                        <div className="mb-4 md:mb-0">
                            <p className="text-gray-500 text-sm">
                                &copy; {new Date().getFullYear()} Stand Strong. All rights reserved.
                            </p>
                        </div>
                        <div className="flex justify-center md:justify-end space-x-6">
                            {/* Added aria-labels */}
                            <Link to="/about" className="text-sm text-gray-500 hover:text-primary-600 transition duration-150" aria-label="About Stand Strong">About</Link>
                            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 transition duration-150" aria-label="Privacy Policy">Privacy</Link>
                            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 transition duration-150" aria-label="Terms of Service">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;