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

  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [totalClassesCount, setTotalClassesCount] = useState(0)

  const [filters, setFilters] = useState(() => {
    return {
      city: selectedCity || "",
      gender: queryParams.get("gender") || "",
      minAge: queryParams.get("minAge") || "",
      maxAge: queryParams.get("maxAge") || "",
      cost: queryParams.get("cost") || "",
      type: queryParams.get("type") || "",
      time: queryParams.get("time") || "",
    }
  })

  // Derived state to check if any non-city filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => key !== "city" && value !== "")
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
    }))
  }

  // Handler for applying filters (just closes the drawer)
  const handleApplyFilters = () => {
    setIsFilterDrawerOpen(false)
  }

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

  // Helper to get class type badge
  const getClassTypeBadge = (type) => {
    if (type === "one-time") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Workshop
        </span>
      )
    } else if (type === "ongoing") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
          Women Only
        </span>
      )
    } else if (gender === "male") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100"
          >
            Find Your Strength
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="mt-4 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Browse our self-defense classes in <span className="font-semibold text-white">{selectedCity}</span>. Find
            the right fit for your needs and schedule.
          </motion.p>
        </div>
      </div>

      {/* Main Content with Improved Spacing and Layout */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
      >
        {/* Header and Filters Button with Enhanced Styling */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/#cities-section")}
                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                aria-label="Change city"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedCity} Classes</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500 pl-10">
              {classesLoading
                ? "Loading..."
                : `Showing ${classes.length} ${classes.length === 1 ? "class" : "classes"}`}
              {hasActiveFilters &&
                !classesLoading &&
                totalClassesCount > 0 &&
                classes.length !== totalClassesCount &&
                ` of ${totalClassesCount} total`}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
            >
              <FiFilter className="mr-2 -ml-0.5 h-5 w-5" />
              Filters {hasActiveFilters && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-white"></span>}
            </button>
          </div>
        </div>

        {/* Classes Content - Conditional Rendering with Enhanced States */}
        {classesLoading ? (
          // Enhanced Loading State
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading classes...</p>
            <p className="text-sm text-gray-500 mt-1">Finding the best options in {selectedCity}</p>
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
        ) : classes.length === 0 ? (
          // Enhanced Empty State
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl py-16 px-6 text-center mt-8 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiSearch className="w-10 h-10 text-blue-500" />
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
          <>
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

            {/* Enhanced Card Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {classes.map((classItem) => (
                <motion.div key={classItem._id} variants={cardItemVariants} layout className="h-full">
                  <Link
                    to={`/classes/${classItem._id}`}
                    state={{ city: selectedCity }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 ease-out overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full relative"
                  >
                    {/* Class Type Badge - Positioned Absolutely */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      {getClassTypeBadge(classItem.type)}
                      {getGenderBadge(classItem.targetGender)}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Title with Enhanced Typography */}
                      <div className="mb-3 pr-16">
                        {" "}
                        {/* Added right padding for badge space */}
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition duration-150 leading-tight">
                          {classItem.title || "Untitled Class"}
                        </h3>
                      </div>

                      {/* Description with Better Spacing */}
                      <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-5 min-h-[60px]">
                        {classItem.description || "No description available."}
                      </p>

                      {/* Details Section with Enhanced Icons and Layout */}
                      <div className="mt-auto space-y-3 text-sm text-gray-700 border-t border-gray-100 pt-4">
                        {/* Instructor with Enhanced Styling */}
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                            <FiUser className="flex-shrink-0 h-4 w-4 text-blue-500" />
                          </div>
                          <span className="font-medium">{classItem.instructor?.name || "Instructor TBD"}</span>
                        </div>

                        {/* Location with Enhanced Styling */}
                        <div className="flex items-center min-w-0">
                          <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                            <FiMapPin className="flex-shrink-0 h-4 w-4 text-blue-500" />
                          </div>
                          <span className="truncate" title={classItem.location?.address || classItem.city || ""}>
                            {classItem.location?.address || classItem.city || "Location TBD"}
                          </span>
                        </div>

                        {/* Schedule with Enhanced Styling */}
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                            <FiCalendar className="flex-shrink-0 h-4 w-4 text-blue-500" />
                          </div>
                          <span>{formatSchedule(classItem)}</span>
                        </div>

                        {/* Cost with Enhanced Styling */}
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                            <FiDollarSign className="flex-shrink-0 h-4 w-4 text-blue-500" />
                          </div>
                          <span className="font-medium">
                            {classItem.cost === 0 ? "Free" : classItem.cost ? `$${classItem.cost}` : "Price TBD"}
                          </span>
                        </div>

                        {/* Ages (Conditional) with Enhanced Styling */}
                        {(classItem.targetAgeRange?.min || classItem.targetAgeRange?.max) && (
                          <div className="flex items-center">
                            <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                              <FiUsers className="flex-shrink-0 h-4 w-4 text-blue-500" />
                            </div>
                            <span>
                              Ages {classItem.targetAgeRange?.min || "?"}
                              {classItem.targetAgeRange?.max ? ` - ${classItem.targetAgeRange.max}` : "+"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="mt-5 text-blue-600 font-medium text-sm flex items-center group-hover:text-blue-700">
                        View details
                        <FiChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Testimonials Section */}
            <section className="py-16 mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-blue/[0.05] bg-[length:20px_20px]"></div>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">What People Are Saying</h2>
                <div className="relative bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-md">
                      <FiAward className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <blockquote className="mt-6">
                    <p className="text-lg italic text-gray-700 leading-relaxed">
                      "StandStrong's classes gave me real skills and real confidence. Highly recommend for everyone!"
                    </p>
                  </blockquote>
                  <footer className="mt-6">
                    <p className="text-base font-semibold text-gray-900">Josh G.</p>
                    <p className="text-sm text-gray-500">Former IDF Sergeant</p>
                  </footer>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Enhanced Filter Drawer with AnimatePresence */}
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <>
              {/* Backdrop Overlay with Improved Animation */}
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 z-40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsFilterDrawerOpen(false)}
              />

              {/* Drawer Panel with Enhanced Design */}
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
                {/* Drawer Header with Enhanced Styling */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <h2 id="filter-drawer-title" className="text-lg font-semibold text-gray-900">
                    Refine Results
                  </h2>
                  <button
                    type="button"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    aria-label="Close filters"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Content with Enhanced Form Controls */}
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
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
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

                  {/* Age Range Filter - Two Column Layout with Enhanced Styling */}
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
                          className="block w-full pl-3 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
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
                          className="block w-full pl-3 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                          placeholder="Any"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max Cost Filter with Enhanced Styling */}
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
                        className="block w-full pl-7 pr-3 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white transition duration-150 ease-in-out"
                        placeholder="Any Price"
                      />
                    </div>
                  </div>
                </div>

                {/* Drawer Footer with Enhanced Buttons */}
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
