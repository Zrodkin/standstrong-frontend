"use client"

// src/pages/ClassesPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  FiFilter,
  FiX,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
  FiUser,
  FiAward,
  FiSearch,
  FiArrowLeft,
  FiClock,
  FiChevronRight,
  FiGrid,
  FiList,
  FiStar,
  FiInfo,
  FiSliders,
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import { getClasses } from "../services/classService"
import { format } from "date-fns"

// --- Motion Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const ClassesPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedCity = queryParams.get("city")

  // State Variables
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [totalClassesCount, setTotalClassesCount] = useState(0)
  const [sortOption, setSortOption] = useState("date-asc")
  const [searchTerm, setSearchTerm] = useState("")


  const [filters, setFilters] = useState(() => {
    return {
      city: selectedCity || "",
      gender: queryParams.get("gender") || "",
      minAge: queryParams.get("minAge") || "",
      maxAge: queryParams.get("maxAge") || "",
      cost: queryParams.get("cost") || "",
      type: queryParams.get("type") || "",
      time: queryParams.get("time") || "",
      search: queryParams.get("search") || "",
    }
  })

  // Derived state to check if any non-city filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => key !== "city" && value !== "")
  }, [filters])

  // Count the number of active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => key !== "city" && value !== "").length
  }, [filters])

  // Update URL when filters change
  const updateUrlWithFilters = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }, [filters, navigate, location.pathname])

  // Effect to fetch classes when filters or city change
  useEffect(() => {
    if (!selectedCity) return

    const fetchClasses = async () => {
      setClassesLoading(true)
      setError(null)
      setClasses([])

      try {
        const apiFilters = {}
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "") {
            apiFilters[key] = value
          }
        })

        const filteredClassesData = await getClasses(apiFilters)
        console.log("API Response:", JSON.stringify(filteredClassesData, null, 2));
        setClasses(filteredClassesData)

        if (hasActiveFilters) {
          const totalData = await getClasses({ city: filters.city })
          setTotalClassesCount(totalData.length)
        } else {
          setTotalClassesCount(filteredClassesData.length)
        }
      } catch (err) {
        setError(`Failed to load classes for ${selectedCity}. Please try again later.`)
        console.error("Fetch classes error:", err)
        setClasses([])
        setTotalClassesCount(0)
      } finally {
        setClassesLoading(false)
      }
    }

    fetchClasses()
    updateUrlWithFilters()
  }, [filters, selectedCity, hasActiveFilters, updateUrlWithFilters])

  // Effect to redirect if no city is selected and scroll to top
  useEffect(() => {
    if (!selectedCity) {
      navigate("/#cities-section", { replace: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [selectedCity, navigate])

  // Handler for individual filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Handler for clearing filters (keeps the city)
  const handleClearFilters = () => {
    setFilters((prev) => ({
      city: prev.city,
      gender: "",
      minAge: "",
      maxAge: "",
      cost: "",
      type: "",
      time: "",
      search: "",
    }))
    setSearchTerm("")
  }

  // Handler for applying filters (just closes the drawer)
  const handleApplyFilters = () => {
    setIsFilterDrawerOpen(false)
  }

  // Handler for search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  // Sort classes based on the selected sort option
  const sortedClasses = useMemo(() => {
    if (!classes.length) return []
    
    const sorted = [...classes]
    
    switch (sortOption) {
      case "date-asc":
        return sorted.sort((a, b) => {
          const dateA = a.schedule && a.schedule.length ? new Date(a.schedule[0].date) : new Date(0)
          const dateB = b.schedule && b.schedule.length ? new Date(b.schedule[0].date) : new Date(0)
          return dateA - dateB
        })
      case "date-desc":
        return sorted.sort((a, b) => {
          const dateA = a.schedule && a.schedule.length ? new Date(a.schedule[0].date) : new Date(0)
          const dateB = b.schedule && b.schedule.length ? new Date(b.schedule[0].date) : new Date(0)
          return dateB - dateA
        })
      case "price-asc":
        return sorted.sort((a, b) => a.cost - b.cost)
      case "price-desc":
        return sorted.sort((a, b) => b.cost - a.cost)
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return sorted
    }
  }, [classes, sortOption])

  // Helper to format schedule based on type, start date, and end date
  const formatSchedule = (classItem) => {
    if (!classItem || !classItem.schedule || !classItem.schedule.length) {
      return "Schedule TBD"
    }

    try {
      const sortedSessions = [...classItem.schedule].sort((a, b) => new Date(a.date) - new Date(b.date))

      const firstSession = sortedSessions[0]
      const lastSession = sortedSessions[sortedSessions.length - 1]

      const firstDateObj = new Date(firstSession.date)
      if (isNaN(firstDateObj.getTime())) {
        return "Schedule TBD"
      }

      const formattedFirstDate = format(firstDateObj, "MMM d")

      if (classItem.type === "one-time") {
        return `${formattedFirstDate}, ${firstSession.startTime}`
      }

      if (classItem.type === "ongoing" && sortedSessions.length > 1) {
        const lastDateObj = new Date(lastSession.date)
        if (!isNaN(lastDateObj.getTime())) {
          const formattedLastDate = format(lastDateObj, "MMM d")
          return `${formattedFirstDate} - ${formattedLastDate}`
        }
      }

      return `Starts ${formattedFirstDate}`
    } catch (error) {
      console.error("Error formatting schedule:", error, classItem)
      return "Schedule TBD"
    }
  }

// Helper to get full image URL
const getFullImageUrl = (partialUrl, type = 'image') => {
  if (!partialUrl) return "/placeholder.svg";

  // If it's already a full URL, return it
  if (partialUrl.startsWith("http")) return partialUrl;

  // Check if the path already contains the folder name
  if (partialUrl.includes('partner-logos')) {
    type = 'logo';
  } else if (partialUrl.includes('class-images')) {
    type = 'image';
  }

  // Extract filename - get the last part of the path
  const filename = partialUrl.split("/").pop();
  
  // Determine folder based on type
  const folder = type === 'logo' ? 'partner-logos' : 'class-images';

  // In development, always use the backend URL
  if (window.location.hostname === "localhost") {
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    return `${apiBaseUrl}/uploads/${folder}/${filename}`;
  }

  // In production, use the relative path
  return `/uploads/${folder}/${filename}`;
};

  // Helper to format times
  const formatTime = (timeStr) => {
    if (!timeStr) return ""
    
    try {
      const [hours, minutes] = timeStr.split(":").map(Number)
      const date = new Date()
      date.setHours(hours, minutes)
      return format(date, "h:mm a")
    } catch (error) {
      return timeStr
    }
  }

  // Helper to get class type badge
  const getClassTypeBadge = (type) => {
    if (type === "one-time") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
          Workshop
        </span>
      )
    } else if (type === "ongoing") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          Course
        </span>
      )
    }
    return null
  }

  // Helper to get gender badge
  const getGenderBadge = (gender) => {
    if (gender === "female") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-pink-100 text-pink-800">
          Women Only
        </span>
      )
    } else if (gender === "male") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
          Men Only
        </span>
      )
    }
    return null
  }
 
  // Prevent rendering if no city is selected yet
  if (!selectedCity) {
    return null
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section with Enhanced Gradient and Typography */}
      <div className="relative text-white overflow-hidden py-16 md:py-24" style={{
  background: "linear-gradient(90deg, rgba(21, 111, 176, 1) 0%, rgba(97, 174, 199, 1) 30%, rgba(97, 174, 199, 1) 70%, rgba(21, 111, 176, 1) 100%)"
}}>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate("/#cities-section")}
                  className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-colors"
                  aria-label="Back to cities"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Classes in {selectedCity}
                </h1>
              </div>
              <p className="text-blue-100 max-w-2xl ml-10">
                Browse our self-defense classes and workshops. Find the right fit for your needs and schedule.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-10 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
              </form>
              
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-blue-700 text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Improved Spacing and Layout */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
      >
        {/* Toolbar - Sort and View Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
  <div className="flex items-center gap-2">
    {classesLoading ? (
      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
    ) : (
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{sortedClasses.length}</span> classes
      </p>
    )}
    
    {hasActiveFilters && (
      <span className="inline-flex items-center text-xs font-medium text-gray-500 px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
        <FiFilter className="h-3 w-3 mr-1" />
        {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} applied
      </span>
    )}
  </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-asc">Date (Earliest first)</option>
                <option value="date-desc">Date (Latest first)</option>
                <option value="price-asc">Price (Low to high)</option>
                <option value="price-desc">Price (High to low)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 bg-blue-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <FiFilter className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">Filters applied</span>
            </div>
            <button onClick={handleClearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Clear all
            </button>
          </div>
        )}

       {/* Classes Content - Conditional Rendering with Enhanced States */}
{classesLoading ? (
  // Enhanced Loading State
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-5 space-y-3">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="pt-4 flex justify-between">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
) : error ? (
  // Enhanced Error State
  <div className="bg-red-50 border border-red-200 p-6 mt-6 rounded-xl shadow-sm flex items-start">
    <FiAlertCircle className="h-6 w-6 text-red-500 mr-4 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="text-lg font-medium text-red-800 mb-1">Unable to load classes</h3>
      <p className="text-sm text-red-700">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
      >
        Try again
      </button>
    </div>
  </div>
) : sortedClasses.length === 0 ? (
  // Enhanced Empty State
  <div className="bg-white border border-gray-100 shadow-sm rounded-xl py-16 px-6 text-center mt-8 flex flex-col items-center">
    <div className="bg-blue-50 p-4 rounded-full mb-4">
      <FiInfo className="w-10 h-10 text-blue-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      No Classes Found {hasActiveFilters ? "Matching Your Filters" : `in ${selectedCity}`}
    </h3>
    <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
      {hasActiveFilters
        ? "Try adjusting your filters or clearing them to see all available classes."
        : "Check back later or try searching in a different city!"}
    </p>
    {hasActiveFilters && (
      <button
        onClick={handleClearFilters}
        className="mt-6 px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all"
      >
        Clear Filters
      </button>
    )}
  </div>
) : (
  // Enhanced Classes Grid with Animation
  <motion.div 
    variants={cardContainerVariants}
    initial="hidden"
    animate="visible"
    className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  >
    {sortedClasses.map((classItem) => (
      <motion.div key={classItem._id} variants={cardItemVariants} layout>
        {/* Grid View */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 ease-out overflow-hidden flex flex-col h-full group">
          <Link
            to={`/classes/${classItem._id}`}
            state={{ city: selectedCity }}
            className="relative aspect-video bg-gray-100 overflow-hidden"
          >
              {classItem.imageUrl ? (
    <img
      src={getFullImageUrl(classItem.imageUrl, 'image')}
      alt={classItem.title || "Class Image"}
      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
      onError={(e) => {
        console.warn("Failed to load image:", e.target.src);
        e.target.src = "/placeholder.svg";
      }}
    />
  ) : (
    <div 
    className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" 
    style={{ backgroundImage: `url(/placeholder.svg)` }}
  ></div>
)}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {getClassTypeBadge(classItem.type)}
              {getGenderBadge(classItem.targetGender)}
            </div>
          </Link>

          <div className="p-5 pt-4 flex flex-col flex-grow">

            <div className="mt-auto space-y-3 text-sm text-gray-700 border-t border-gray-100 pt-2">
              {/* Instructor */}
              <div className="flex items-center">
                <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                  <FiUser className="flex-shrink-0 h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium">{classItem.instructor?.name || "Instructor TBD"}</span>
              </div>

              {/* Location */}
              <div className="flex items-center min-w-0">
                <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                  <FiMapPin className="flex-shrink-0 h-4 w-4 text-blue-500" />
                </div>
                <span className="truncate" title={classItem.city || "Location TBD"}>
                  {classItem.city || "Location TBD"}
                </span>
              </div>

              {/* Schedule */}
              <div className="flex items-center">
                <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                  <FiCalendar className="flex-shrink-0 h-4 w-4 text-blue-500" />
                </div>
                <span>{formatSchedule(classItem)}</span>
              </div>

              {/* Cost */}
              <div className="flex items-center">
                <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                  <FiDollarSign className="flex-shrink-0 h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium">
                  {classItem.cost === 0 ? "Free" : classItem.cost !== undefined ? `$${classItem.cost}` : "Price TBD"}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex items-center">
                <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                  <FiUsers className="flex-shrink-0 h-4 w-4 text-blue-500" />
                </div>
                <span>
                  {classItem.registeredStudents?.length ?? 0}/{classItem.capacity ?? '?'} spots filled
                </span>
              </div>
            </div>

            {/* View Details Button */}
            <Link
              to={`/classes/${classItem._id}`}
              state={{ city: selectedCity }}
              className="mt-5 text-blue-600 font-medium text-sm flex items-center group-hover:text-blue-700"
            >
              View details
              <FiChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
)}


        {/* Featured Testimonial Section */}
        <section className="py-16 mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-blue/[0.05] bg-[length:20px_20px]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="text-amber-500 mb-4">
              <FiStar className="h-10 w-10 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Students Say</h2>
            <div className="relative bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <blockquote className="text-lg italic text-slate-700 mb-6">
                "The instructors at StandStrong create a supportive environment where everyone can learn at their own pace. 
                I've gained confidence and practical skills that I use every day."
              </blockquote>
              <footer className="mt-6">
                <p className="font-semibold text-gray-900">Jessica D.</p>
                <p className="text-sm text-gray-500">Student since 2022</p>
              </footer>
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-12 mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 sm:p-10 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Stand Strong?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-6">
              Join a class today and learn practical self-defense skills in a supportive environment.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm transition-all"
              >
                Sign Up Now
              </Link>
              <Link 
                to="/#cities-section" 
                className="inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm transition-all"
              >
                Browse More Cities
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Drawer */}
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsFilterDrawerOpen(false)}
              />

              {/* Drawer Panel */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-drawer-title"
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <h2 id="filter-drawer-title" className="text-lg font-semibold text-gray-900">
                    Refine Results
                  </h2>
                  <button
                    type="button"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    aria-label="Close filters"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Content - Scrollable Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  {/* Gender/Focus Filter */}
                  <div className="space-y-2">
                    <label htmlFor="filter-gender" className="block text-sm font-medium text-gray-700">
                      Focus
                    </label>
                    <div className="relative">
                      <select
                        id="filter-gender"
                        name="gender"
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                        value={filters.gender}
                        onChange={handleFilterChange}
                      >
                        <option value="">Any Focus</option>
                        <option value="female">Women's Class</option>
                        <option value="male">Men's Class</option>
                        <option value="any">Co-Ed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FiUsers className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Class Type Filter */}
                  <div className="space-y-2">
                    <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700">
                      Class Type
                    </label>
                    <div className="relative">
                      <select
                        id="filter-type"
                        name="type"
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                        value={filters.type}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Types</option>
                        <option value="one-time">One-time Workshop</option>
                        <option value="ongoing">Ongoing Course</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FiAward className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Time of Day Filter */}
                  <div className="space-y-2">
                    <label htmlFor="filter-time" className="block text-sm font-medium text-gray-700">
                      Time of Day
                    </label>
                    <div className="relative">
                      <select
                        id="filter-time"
                        name="time"
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                        value={filters.time}
                        onChange={handleFilterChange}
                      >
                        <option value="">Any Time</option>
                        <option value="morning">Morning (Before 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (After 5 PM)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FiClock className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Age Range Filter - Two Column Layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                    <div className="grid grid-cols-2 gap-x-4">
                      <div className="space-y-1">
                        <label htmlFor="filter-minAge" className="block text-xs text-gray-500">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          id="filter-minAge"
                          name="minAge"
                          min="0"
                          value={filters.minAge}
                          onChange={handleFilterChange}
                          className="block w-full pl-3 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                          placeholder="Any"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="filter-maxAge" className="block text-xs text-gray-500">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          id="filter-maxAge"
                          name="maxAge"
                          min="0"
                          value={filters.maxAge}
                          onChange={handleFilterChange}
                          className="block w-full pl-3 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                          placeholder="Any"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max Cost Filter */}
                  <div className="space-y-2">
                    <label htmlFor="filter-cost" className="block text-sm font-medium text-gray-700">
                      Max Cost ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="filter-cost"
                        name="cost"
                        min="0"
                        step="10"
                        value={filters.cost}
                        onChange={handleFilterChange}
                        className="block w-full pl-7 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white"
                        placeholder="Any Price"
                      />
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-4">
                  <div className="flex justify-between items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                      className={`w-1/2 px-4 py-2.5 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors ${
                        hasActiveFilters
                          ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          : "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="w-1/2 px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterDrawerOpen(false)
                      navigate("/#cities-section")
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline text-center w-full pt-1 flex items-center justify-center"
                  >
                    <FiMapPin className="mr-1.5 h-3.5 w-3.5" />
                    Change City ({selectedCity})
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ClassesPage