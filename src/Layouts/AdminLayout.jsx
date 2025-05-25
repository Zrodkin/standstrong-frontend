"use client"

import { useState, useEffect } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  MapPin,
  Menu,
  Settings,
  Users,
  X,
  ClipboardList,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "../context/AuthContext.jsx"

// Simple tooltip implementation
const Tooltip = ({ children, content, side = "right" }) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black rounded shadow-sm ${side === "right" ? "left-full ml-2" : "right-full mr-2"}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Check if screen is small on initial load and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
        setIsCollapsed(true)
      } else {
        setIsSidebarOpen(true)
        setIsCollapsed(false)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate("/login")
    } catch (error) {
      console.error("Admin logout failed:", error)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home, end: true },
    { name: "Classes", href: "/admin/classes", icon: Calendar, end: false },
    { name: "Students", href: "/admin/students", icon: Users, end: false },
    { name: "Registrations", href: "/admin/registrations", icon: ClipboardList, end: false },
    { name: "Attendance", href: "/admin/attendance", icon: BarChart3, end: false },
    { name: "Cities", href: "/admin/cities", icon: MapPin, end: false },
    { name: "Settings", href: "/admin/settings", icon: Settings, end: false },
  ]

  const isActiveLink = (href, end) => {
    return end ? location.pathname === href : location.pathname.startsWith(href)
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "80px" },
  }

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center h-16 px-4",
          isCollapsed && !mobile ? "justify-center" : "justify-between",
          "border-b border-slate-200 dark:border-slate-800",
        )}
      >
        {(!isCollapsed || mobile) && (
          <Link to="/admin" className="text-xl font-bold tracking-tight">
            Admin Panel
          </Link>
        )}
        {!mobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1.5">
          {navigation.map((item) => (
            <li key={item.name}>
              {isCollapsed && !mobile ? (
                <Tooltip content={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActiveLink(item.href, item.end)
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                      "justify-center",
                    )}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center">
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActiveLink(item.href, item.end)
                            ? "text-primary-foreground"
                            : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300",
                        )}
                      />
                    </motion.div>
                  </Link>
                </Tooltip>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActiveLink(item.href, item.end)
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    "justify-start",
                  )}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActiveLink(item.href, item.end)
                          ? "text-primary-foreground"
                          : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300",
                      )}
                    />
                    <span className="ml-3">{item.name}</span>
                  </motion.div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={cn(
          "mt-auto p-4 border-t border-slate-200 dark:border-slate-800",
          isCollapsed && !mobile ? "flex justify-center" : "",
        )}
      >
        {isCollapsed && !mobile ? (
          <Tooltip content="Logout">
            <Button variant="ghost" className="justify-center px-0 w-10 h-10" onClick={handleLogout}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center">
                <LogOut className="h-5 w-5 text-slate-500" />
              </motion.div>
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={handleLogout}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center">
              <LogOut className="h-5 w-5 text-slate-500" />
              <span className="ml-3">Logout</span>
            </motion.div>
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        <motion.aside
          className={cn(
            "hidden lg:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20",
            isSidebarOpen ? "lg:block" : "lg:hidden",
          )}
          initial={isCollapsed ? "collapsed" : "expanded"}
          animate={isCollapsed ? "collapsed" : "expanded"}
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <SidebarContent />
        </motion.aside>
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-slate-900 z-40 lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent mobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 dark:bg-slate-900 dark:border-slate-800">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="ml-auto flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <img
                src="/placeholder-user.jpg"
                alt="Admin"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
