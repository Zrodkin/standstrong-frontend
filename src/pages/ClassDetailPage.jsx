// frontend/pages/ClassDetailPage.jsx
import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiUserCheck,
  FiExternalLink,
  FiHome,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiLoader,
  FiBookOpen,
  FiChevronRight,
  FiImage,
} from "react-icons/fi"
import { useAuth } from "/src/context/AuthContext.jsx"
import { format } from "date-fns"
import nprogress from "nprogress"
import "nprogress/nprogress.css"

// At the top of the file with other imports
import "./styles/animations.css"

// --- Import Services Directly ---
import { getClassById } from "/src/services/classService.js"
import { createRegistration, getMyRegistrations } from "/src/services/registrationService.js"

// --- Reusable Components ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
    <p className="text-xl font-semibold text-gray-800">Loading Class Details</p>
    <p className="text-sm text-gray-500 mt-2">Please wait a moment...</p>
  </div>
)

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 p-8 rounded-xl flex flex-col items-center text-center max-w-md mx-auto my-10 shadow-md">
    <FiAlertCircle className="h-14 w-14 text-red-500 mb-4" />
    <p className="text-xl font-semibold text-red-800 mb-2">{message || "An error occurred."}</p>
    <p className="text-sm text-gray-600 mb-6">
      We couldn't load the class details. Please check your connection or try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center shadow-sm"
      >
        <FiArrowLeft className="mr-2 h-4 w-4" /> Try Again
      </button>
    )}
    <Link to="/classes" className="mt-4 text-sm text-primary-600 hover:underline">
      Back to Classes
    </Link>
  </div>
)


const ConfirmationModal = ({ isOpen, onClose, onConfirm, classTitle, isLoading }) => {
  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Confirm Registration</h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              You are about to register for the class: <strong className="text-gray-800">{classTitle}</strong>. Please
              confirm to proceed.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" /> Registering...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Tab component for content organization
const TabButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
      active ? "bg-primary-50 text-primary-700 border-primary-200 border" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="ml-2">{children}</span>
  </button>
)

const ClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()

  const [classData, setClassData] = useState(null)
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMyRegs, setLoadingMyRegs] = useState(true)
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [registerError, setRegisterError] = useState(null)
  const [activeTab, setActiveTab] = useState("about")
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: 1,
    specialRequirements: "",
  })
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);

  // --- Fetch Class ---
  const fetchClassData = useCallback(async () => {
    setError(null)
    setRegisterSuccess(false)
    setRegisterError(null)
    setLoading(true)
    nprogress.start()
    try {
      const data = await getClassById(id)
      
      // Add null check before accessing imageUrl
      if (data) {
        console.log("Class data imageUrl:", data.imageUrl);
        setClassData(data)
      } else {
        console.log("No class data returned from API");
        setError("Class not found")
      }
    } catch (err) {
      console.error("Fetch Class Error:", err)
      setError(err.response?.data?.message || "Failed to load class details. Please try again.")
    } finally {
      setLoading(false)
      nprogress.done()
    }
  }, [id])

  const fetchUserRegistrations = useCallback(async () => {
    if (!isAuthenticated) {
      setMyRegistrations([])
      setLoadingMyRegs(false)
      return
    }
    setLoadingMyRegs(true)
    try {
      const regs = await getMyRegistrations()
      setMyRegistrations(regs || [])
    } catch (err) {
      console.error("Failed to fetch user registrations", err)
      setMyRegistrations([])
    } finally {
      setLoadingMyRegs(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchClassData()
    fetchUserRegistrations()
  }, [id, fetchClassData, fetchUserRegistrations])

  useEffect(() => {
    if (classData?.partnerLogo) {
      console.log("Original partnerLogo path:", classData.partnerLogo)
      console.log("Constructed URL:", getFullImageUrl(classData.partnerLogo))
      console.log("Running in:", window.location.hostname === "localhost" ? "development" : "production")
      console.log("API base URL:", import.meta.env.VITE_API_URL)
    }
  }, [classData])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTabMenuOpen && !event.target.closest(".tab-dropdown")) {
        setIsTabMenuOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTabMenuOpen]);

  // --- Image Helpers ---
 

  const handleImageError = (e) => {
    console.warn("Failed to load image:", e.target.src)

    // Get the image filename
    const filename = classData?.partnerLogo?.split("/").pop()

    // Try different fallback approaches
    if (!e.target.dataset.fallbackAttempted && filename) {
      // First fallback: Try the standard uploads path
      const fallbackUrl = `/uploads/partner-logos/${filename}`
      console.log("Trying fallback #1:", fallbackUrl)
      e.target.src = fallbackUrl
      e.target.dataset.fallbackAttempted = "1"
    }
    // Second fallback: Try with API base URL
    else if (e.target.dataset.fallbackAttempted === "1" && filename) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || ""
      if (apiBaseUrl) {
        const fallbackUrl = `${apiBaseUrl}/uploads/partner-logos/${filename}`
        console.log("Trying fallback #2:", fallbackUrl)
        e.target.src = fallbackUrl
        e.target.dataset.fallbackAttempted = "2"
      } else {
        // Skip to placeholder if no API base URL
        e.target.src = "/placeholder.svg"
        e.target.dataset.fallbackAttempted = "3"
      }
    }
    // Final fallback: Use placeholder image
    else if (e.target.dataset.fallbackAttempted === "2") {
      console.log("Trying placeholder image")
      e.target.src = "/placeholder.svg"
      e.target.dataset.fallbackAttempted = "3"
    }
    // If all fallbacks fail, show the fallback content
    else {
      console.warn("All fallbacks failed, showing text fallback")
      e.target.style.display = "none"
      // Show the fallback element
      const fallbackEl = document.getElementById(`fallback-${classData._id}`)
      if (fallbackEl) {
        fallbackEl.style.display = "flex"
      }
    }
  }

  // --- Registration ---
  const handleOpenConfirmation = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/classes/${id}`)
      return
    }
    setRegisterError(null)
    setRegisterSuccess(false)
    setIsConfirming(true)
  }

  const handleConfirmRegister = async () => {
    if (!isAuthenticated) return
    setRegistering(true)
    setRegisterError(null)
    nprogress.start()
    try {
      await createRegistration(id)
      setRegisterSuccess(true)
      setIsConfirming(false)
      fetchUserRegistrations()
    } catch (err) {
      console.error("Registration Error:", err)
      if (err.response?.status === 409) {
        setRegisterError(err.response?.data?.message || "Registration conflict. Class may be full.")
      } else {
        setRegisterError(err.response?.data?.message || "Registration failed. Please try again.")
      }
      setIsConfirming(false)
    } finally {
      setRegistering(false)
      nprogress.done()
    }
  }

  // --- Helpers ---
  const isUserRegistered = useCallback(() => {
    if (!isAuthenticated || loadingMyRegs || !classData) return false
    return myRegistrations.some(
      (reg) => reg.class?._id === classData._id && (reg.status === "enrolled" || reg.status === "waitlisted"),
    )
  }, [isAuthenticated, loadingMyRegs, myRegistrations, classData])

  const formatTime = (timeStr) => {
    if (!timeStr) return "TBD"
    try {
      const [hour, minute] = timeStr.split(":").map(Number)
      const date = new Date()
      date.setHours(hour, minute)
      return format(date, "h:mm a")
    } catch (e) {
      console.error("Error formatting time:", timeStr, e)
      return "Invalid time"
    }
  }

  const googleMapsUrl = classData?.location?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(classData.location.address)}`
    : null

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", formData)
    alert("Registration successful! You will receive a confirmation email shortly.")
    setShowRegistrationForm(false)
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  }

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  }

  // --- Render ---
  if (loading || loadingMyRegs) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchClassData} />
  }

  if (!classData) {
    return <ErrorMessage message="Class not found or could not be loaded." onRetry={() => navigate("/classes")} />
  }

  const alreadyRegistered = isUserRegistered()
  const isExternal = classData.registrationType === "external"
  const schedule = classData.schedule || []

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary-600 flex items-center">
            <FiHome className="mr-1.5 h-4 w-4" /> Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/classes" className="text-gray-500 hover:text-primary-600">
            Classes
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium truncate" title={classData.title}>
            {classData.title}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <div
        className="relative text-white overflow-hidden py-16 md:py-24"
        style={{
          background:
            "linear-gradient(90deg, rgba(21, 111, 176, 1) 0%, rgba(97, 174, 199, 1) 30%, rgba(97, 174, 199, 1) 70%, rgba(21, 111, 176, 1) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
    
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 h-full flex items-center">
          <div className="flex flex-col items-center text-center w-full">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                {classData.targetGender === "male" && "Men's Class"}
                {classData.targetGender === "female" && "Women's Class"}
                {classData.targetGender === "any" && "Open to All (Co-ed)"}
              </span>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{classData.title}</h1>

              {classData.instructor?.name && (
                <p className="text-white font-semibold text-lg">{classData.instructor.name}</p>
              )}
            </div>

           {classData.partnerLogo && (
  <div className="bg-white p-3 rounded-xl shadow-xl max-h-24 mt-6">
    <img
      src={classData.partnerLogo}
      alt={`${classData.partnerName || "Partner"} Logo`}
      className="h-16 sm:h-20 object-contain"
    />
  </div>
)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-12 gap-y-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
          <div className="relative">
  <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 px-1 scrollbar-hide scroll-smooth -mx-1">
    <TabButton
      active={activeTab === "about"}
      onClick={() => setActiveTab("about")}
      icon={<FiBookOpen className="h-4 w-4" />}
    >
      About
    </TabButton>
    <TabButton
      active={activeTab === "schedule"}
      onClick={() => setActiveTab("schedule")}
      icon={<FiCalendar className="h-4 w-4" />}
    >
      Schedule
    </TabButton>
    {classData.instructor?.bio && (
      <TabButton
        active={activeTab === "instructor"}
        onClick={() => setActiveTab("instructor")}
        icon={<FiUserCheck className="h-4 w-4" />}
      >
        Instructor
      </TabButton>
    )}
  </div>
</div>
            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* About Tab */}
              {activeTab === "about" && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold gradient-text mb-4">Safe. Confident. Proud.</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                    {classData.description || "No description provided."}
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Class Schedule</h2>
                    {schedule.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {schedule.length} session{schedule.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {schedule.length > 0 ? (
                    <div className="space-y-4">
                      {schedule.map((session, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex-shrink-0 w-14 h-14 bg-primary-50 rounded-lg flex flex-col items-center justify-center text-primary-700">
                            <span className="text-xs font-medium">{format(new Date(session.date), "MMM")}</span>
                            <span className="text-xl font-bold">{format(new Date(session.date), "d")}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {format(new Date(session.date), "EEEE, MMMM d, yyyy")}
                            </p>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <FiClock className="mr-1.5 h-3.5 w-3.5" />
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-md border border-blue-100">
                      <FiInfo className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        Schedule details are not yet available. Please check back later.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {/* Instructor Tab */}
              {activeTab === "instructor" && classData.instructor?.bio && (
                <div className="p-6">
                  {/* Centered Instructor Name */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{classData.instructor.name}</h2>

                  {/* Left-aligned Bio */}
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 max-w-2xl mx-auto text-left">{classData.instructor.bio}</p>
                  </div>
                </div>
              )}
 
                     
            </div>
         {/* Enhanced View Flyer Button */}
{classData.imageUrl && (
  <div className="mt-6">
    <button
      onClick={() => setIsFlyerModalOpen(true)}
      className="group w-full flex items-center justify-center px-6 py-4 rounded-xl border border-[#61aec7]/30 
            text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(21, 111, 176, 1) 0%, rgba(97, 174, 199, 1) 30%, rgba(97, 174, 199, 1) 70%, rgba(21, 111, 176, 1) 100%)",
            }}
  
    >
      <div className="mr-3 bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
        <FiImage className="h-5 w-5" />
      </div>
      <span className="text-lg tracking-wide">View Flyer</span>
      <div className="ml-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <FiChevronRight className="h-5 w-5" />
      </div>
    </button>
  </div>
)}
            {/* --- Flyer Modal --- */}
      {isFlyerModalOpen && classData.imageUrl && (
        <div 
          // Full screen overlay
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setIsFlyerModalOpen(false)} // Close on overlay click
        >
          {/* Modal Content (prevents close on image click) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}> 
            {/* Close Button */}
            <button 
              className="absolute -top-4 -right-4 sm:top-0 sm:-right-8 text-white bg-gray-800/50 hover:bg-gray-800 rounded-full p-2 z-10"
              onClick={() => setIsFlyerModalOpen(false)}
              aria-label="Close flyer view"
            >
              <FiX size={24} /> {/* Make sure FiX is imported */}
            </button>
            {/* Image inside Modal */}
            <img 
  src={classData.imageUrl} 
  alt={`${classData.title} flyer - Full view`} 
  className="block max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-lg" 
/>
          </div>
        </div>
      )}
      {/* --- End Flyer Modal --- */}
          </div>



          {/* Right Column */}
          <div className="mt-10 lg:mt-0">
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 lg:sticky lg:top-6 space-y-6 hover-lift"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">Class Details</h3>

              {/* Success/Error Messages */}
              {registerSuccess && (
                <div className="flex items-center bg-green-50 p-4 rounded-lg text-green-800 mb-4 border border-green-200">
                  <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Successfully Registered!</p>
                    <p className="text-sm text-green-700 mt-0.5">You're all set for this class.</p>
                  </div>
                </div>
              )}

              {registerError && (
                <div className="flex items-center bg-red-50 p-4 rounded-lg text-red-800 mb-4 border border-red-200">
                  <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Registration Failed</p>
                    <p className="text-sm text-red-700 mt-0.5">{registerError}</p>
                  </div>
                </div>
              )}

              {/* Class Details */}
              <div className="space-y-5">
                {/* Location */}
                <div className="flex gap-4">
                  <FiMapPin className="text-primary-600 mt-1 flex-shrink-0 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</p>
                    {classData.location?.name ? (
                      <>
                        <p className="text-gray-800 font-medium">{classData.location.name}</p>
                        {classData.location?.address && (
                          <p className="text-sm text-gray-600">{classData.location.address}</p>
                        )}
                      </>
                    ) : classData.location?.address ? (
                      <p className="text-gray-800 font-medium">{classData.location.address}</p>
                    ) : (
                      <p className="text-gray-500 italic">Location To Be Announced</p>
                    )}
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                      >
                        View on Google Maps <FiExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                <hr className="border-gray-100" />

                {/* First Session */}
                {schedule.length > 0 && (
                  <>
                    <div className="flex gap-4">
                      <FiCalendar className="text-primary-600 mt-1 flex-shrink-0 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">First Session</p>
                        <p className="text-gray-800 font-medium">
                          {format(new Date(schedule[0].date), "MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(schedule[0].startTime)} - {formatTime(schedule[0].endTime)}
                        </p>
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                  </>
                )}

                {/* Audience */}
                <div className="flex gap-4">
                  <FiUsers className="text-primary-600 mt-1 flex-shrink-0 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Audience</p>
                    <p className="text-gray-800 font-medium">
                      {classData.targetGender === "male" && "Men's Class"}
                      {classData.targetGender === "female" && "Women's Class"}
                      {classData.targetGender === "any" && "Open to All (Co-ed)"}
                    </p>
                    {classData.capacity != null && (
                      <p className="text-sm text-gray-600">Limited to {classData.capacity} participants</p>
                    )}
                  </div>
                </div>
                <hr className="border-gray-100" />

                {/* Cost */}
                <div className="flex gap-4">
                  <FiDollarSign className="text-primary-600 mt-1 flex-shrink-0 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cost</p>
                    <p className="text-xl font-bold text-gray-800">
                      {classData.cost === 0 ? "Free" : `$${classData.cost}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Section */}
              <div className="pt-5 mt-6 border-t border-gray-100">
                {alreadyRegistered ? (
                  <div className="text-center bg-primary-50 p-5 rounded-lg border border-primary-100">
                    <FiUserCheck className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                    <p className="font-semibold text-primary-800">You are registered for this class!</p>
                    <Link
                      to="/dashboard"
                      className="mt-2 inline-block text-sm text-primary-600 hover:underline font-medium"
                    >
                      View in Dashboard <FiChevronRight className="inline ml-1 h-3 w-3" />
                    </Link>
                  </div>
                ) : isExternal ? (
                  <a
                    href={classData.externalRegistrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Register on Partner Site <FiExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleOpenConfirmation}
                    disabled={isConfirming || registering}
                    className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed pulse-on-hover"
                    whileHover={{ scale: 1.02, backgroundColor: "#1a56db" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {isAuthenticated ? "Register for Class" : "Login to Register"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleConfirmRegister}
        classTitle={classData?.title || ""}
        isLoading={registering}
      />

     
    </div>
  )
}

export default ClassDetailPage
