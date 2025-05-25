"use client"

// frontend/src/Layouts/MainLayout.jsx
import { useState, useEffect } from "react"
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom"
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiBookOpen, FiGrid } from "react-icons/fi"
import { useAuth } from "../context/AuthContext" // Adjust path if needed
import siteLogo from "../assets/ss-newlogo.svg"

const MainLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Use the (currently mock) useAuth hook
  const { currentUser, logoutUser, isAdmin: isAdminFromContext } = useAuth() // Renamed to avoid conflict if needed
  const navigate = useNavigate()
  const location = useLocation()

  // Derive isAdmin based on the actual currentUser from context
  // This makes the mock above directly control the outcome for demonstration
  // In your real app, this derivation should happen inside AuthContext.jsx
  const isAdmin = currentUser?.role === "admin"

  // Close mobile menu automatically on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Define navigation links
  // The conditional logic for Admin link is already correct!
  const navLinks = [
    { name: "Home", href: "/", icon: FiHome, end: true },
    { name: "Classes", href: "/classes", icon: FiBookOpen, end: false },
    // This spread (...) correctly adds the Admin object ONLY if isAdmin is true
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: FiGrid, end: false }] : []),
  ]

  // Define NavLink classes - Added subtle hover background and bolder active state
  const navLinkBaseClass =
    "border-transparent text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium rounded-md transition duration-150 ease-in-out" // Added px-3, py-2, rounded-md, hover:bg
  const navLinkActiveClass = "border-primary-500 text-primary-700 font-semibold bg-primary-50" // Added font-semibold, bg-primary-50
  const mobileNavLinkBaseClass =
    "border-transparent text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
  const mobileNavLinkActiveClass = "bg-primary-50 border-primary-500 text-primary-700 font-semibold" // Added font-semibold

  // Functions to determine NavLink className based on active state
  const getNavLinkClass = ({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ""}`
  const getMobileNavLinkClass = ({ isActive }) =>
    `${mobileNavLinkBaseClass} ${isActive ? mobileNavLinkActiveClass : ""}`

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
                <img src={siteLogo || "/placeholder.svg"} alt="Stand Strong Logo" className="h-8" />
              </Link>
              {/* Desktop Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {" "}
                {/* Reduced space */}
                {navLinks.map((item) => (
                  <NavLink key={item.name} to={item.href} end={item.end} className={getNavLinkClass}>
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
                <div className="flex items-center space-x-3">
                  {" "}
                  {/* Adjusted spacing */}
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
                <div className="flex items-center space-x-3">
                  {" "}
                  {/* Adjusted spacing */}
                  <NavLink to="/login" className={getNavLinkClass}>
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

        {/* Mobile menu Panel - Improved with animations and styling */}
        <div
          className={`sm:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          id="mobile-menu"
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gray-800 bg-opacity-50 transition-opacity duration-300 ${
              isMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="relative bg-white h-full w-4/5 max-w-xs shadow-xl flex flex-col">
            {/* Logo and Close Button */}
            <div className="px-4 pt-5 pb-4 flex items-center justify-between border-b border-gray-200">
              <Link to="/" className="flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
                <img src={siteLogo || "/placeholder.svg"} alt="Stand Strong Logo" className="h-8" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Close menu</span>
                <FiX className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-grow overflow-y-auto">
              <div className="px-2 py-4 space-y-1">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.end}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      }`
                    }
                  >
                    <item.icon className="mr-4 h-6 w-6" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* User Actions */}
              <div className="px-2 py-4 border-t border-gray-200">
                {currentUser ? (
                  <div className="space-y-1">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        }`
                      }
                    >
                      <FiUser className="mr-4 h-6 w-6" aria-hidden="true" />
                      Dashboard
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <FiLogOut className="mr-4 h-6 w-6" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 px-3 py-2">
                    <NavLink
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full text-center px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? "bg-primary-50 text-primary-700 border border-primary-200"
                            : "text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`
                      }
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-2.5 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      Sign Up
                    </NavLink>
                  </div>
                )}
              </div>
            </div>

            {/* Footer in Mobile Menu */}
            <div className="px-4 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Stand Strong</p>
            </div>
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
              <Link
                to="/about"
                className="text-sm text-gray-500 hover:text-primary-600 transition duration-150"
                aria-label="About Stand Strong"
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-primary-600 transition duration-150"
                aria-label="Privacy Policy"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-primary-600 transition duration-150"
                aria-label="Terms of Service"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
