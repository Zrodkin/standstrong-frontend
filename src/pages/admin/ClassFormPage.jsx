// src/pages/admin/ClassFormPage.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  FiSave,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiPlus,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiUsers,
  FiExternalLink,
  FiImage,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi"
import { getClassById, createClass, updateClass, deleteClass } from "/src/services/classService.js"
import api from "/src/services/api.js"
import { useClasses } from "/src/context/ClassContext.jsx"
import PlacesAutocompleteInput from "/src/components/PlacesAutocompleteInput.jsx"




const ClassFormPage = () => {
  const { cities } = useClasses()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    location: { address: "" },
    instructor: { name: "", bio: "" },
    type: "one-time",
    cost: 0,
    targetGender: "any",
    targetAgeRange: { min: 18, max: "" }, // Max optional
    capacity: 10,
    schedule: [{ date: "", startTime: "", endTime: "" }],
    registrationType: "internal",
    externalRegistrationLink: "",
    partnerLogo: "",
    imageUrl: "",
  })

  // New helper states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [hasMaxAge, setHasMaxAge] = useState(true)
  const [activeSection, setActiveSection] = useState("basic") // Track which section is expanded
  const [previewMode, setPreviewMode] = useState(false) // For session generator preview
  const [imagePreview, setImagePreview] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Repeat Weekly settings
  const [repeatSettings, setRepeatSettings] = useState({
    enabled: false,
    startDate: "",
    numberOfClasses: "",
    startTime: "",
    endTime: "",
    frequency: "weekly", // weekly, biweekly, monthly
    daysOfWeek: [], // For multiple days per week
    previewSessions: [], // To preview generated sessions
  })

  // Helper to format date for input - Moved outside useEffect for potential reuse
  const formatDateForInput = (date) => {
    if (!date) return "" // Handle null or undefined dates
    try {
      const d = new Date(date)
      // Add timezone offset to prevent date potentially shifting across midnight
      // when converting to ISO string in different timezones. Test carefully!
      const offset = d.getTimezoneOffset()
      const adjustedDate = new Date(d.getTime() - offset * 60 * 1000)
      return adjustedDate.toISOString().split("T")[0]
    } catch (e) {
      console.error("Error formatting date:", date, e)
      return "" // Return empty string if date is invalid
    }
  }

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      console.error("Error formatting date for display:", dateString, e)
      return dateString
    }
  }

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return ""
    try {
      // Parse time string (HH:MM format)
      const [hours, minutes] = timeString.split(":").map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (e) {
      console.error("Error formatting time for display:", timeString, e)
      return timeString
    }
  }

  // Load class data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchClassData = async () => {
        try {
          setLoading(true)
          setError(null) // Clear previous errors
          const classData = await getClassById(id)
          // --- Construct Full Logo URL for Fetched Data ---
          const fetchedRelativePath = classData.partnerLogo || "" // e.g., "/uploads/..."
          const fullLogoUrlForFetched = constructFullUrl(fetchedRelativePath) // Use helper
          // --- End Logo URL Construction ---

          // --- MODIFIED SECTION START ---
          setFormData((prevData) => ({
            // Use functional update
            ...prevData, // Keep previous state as base
            ...classData, // Spread fetched data over it (handles most fields)
            partnerLogo: fullLogoUrlForFetched,

            // Explicitly handle schedule: Use fetched schedule or default
            schedule:
              classData.schedule && classData.schedule.length > 0
                ? classData.schedule.map((session) => ({
                    // Ensure date exists and format it correctly
                    date: session.date ? formatDateForInput(session.date) : "",
                    startTime: session.startTime || "", // Provide fallback
                    endTime: session.endTime || "", // Provide fallback
                  }))
                : [{ date: "", startTime: "", endTime: "" }], // Default if no schedule fetched or empty


                
            // Explicitly handle nested objects with defaults
            targetAgeRange: {
              min: classData.targetAgeRange?.min || 0, // Use optional chaining and default
              max: classData.targetAgeRange?.max || "", // Use optional chaining and default
            },
            location: classData.location || { address: "" }, // Default if missing
            instructor: classData.instructor || { name: "", bio: "" }, // Default if missing

            // Ensure other potentially missing fields have defaults if needed
            title: classData.title || "",
            description: classData.description || "",
            city: classData.city || "",
            type: classData.type || "one-time",
            cost: classData.cost || 0,
            targetGender: classData.targetGender || "any",
            capacity: classData.capacity || 10,
            registrationType: classData.registrationType || "internal",
            externalRegistrationLink: classData.externalRegistrationLink || "",
          }))

          
          // --- MODIFIED SECTION END ---
          if (classData.imageUrl) {
            const fullImageUrl = constructFullUrl(classData.imageUrl);
            setImagePreview(fullImageUrl);
          }

          
          // Update hasMaxAge based on the potentially updated targetAgeRange.max
          setHasMaxAge(!!classData.targetAgeRange?.max) // Use optional chaining
        } catch (err) {
          console.error("Error fetching class data:", err) // More specific log
          setError("Failed to load class data. Please try again.") // User-friendly error
        } finally {
          setLoading(false)
        }
      }
      fetchClassData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]) // Keep dependencies as they are

  const uploadPartnerLogo = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formDataUpload = new FormData()
  formDataUpload.append("file", file)

  try {
    setUploadingLogo(true)
    setError(null)
    
    const { data } = await api.post("/upload?type=logo", formDataUpload, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    // Store the Cloudinary URL directly
    setFormData((prev) => ({
      ...prev,
      partnerLogo: data.url,
    }))
    
    setSuccess("Logo uploaded successfully!")
  } catch (err) {
    console.error("Failed to upload logo:", err)
    setError("Logo upload failed. Please try again.")
  } finally {
    setUploadingLogo(false)
  }
}

  const uploadClassImage = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formDataUpload = new FormData()
  formDataUpload.append("file", file)

  try {
    setUploadingImage(true)
    setError(null)
    
    const { data } = await api.post("/upload?type=flyer", formDataUpload, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    // Store the Cloudinary URL directly
    setFormData((prev) => ({
      ...prev,
      imageUrl: data.url,
    }))
    
    setImagePreview(data.url)
    setSuccess("Image uploaded successfully!")
  } catch (err) {
    console.error("Failed to upload image:", err)
    setError("Image upload failed. Please try again.")
  } finally {
    setUploadingImage(false)
  }
}

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target // Include type and checked for checkboxes

    // Handle nested properties like instructor.name or targetAgeRange.min
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }))
    }
    // Specific handling for age range direct inputs if needed (though covered by dot notation above)
    else if (name === "targetAgeMin") {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, min: Number.parseInt(value) || 0 },
      }))
    } else if (name === "targetAgeMax") {
      setFormData((prev) => ({
        ...prev,
        targetAgeRange: { ...prev.targetAgeRange, max: value === "" ? "" : Number.parseInt(value) || "" }, // Allow empty string
      }))
    }
    // Handle checkboxes (like hasMaxAge, though that has its own state)
    else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    }
    // Handle standard inputs
    else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // --- Function to process the link on Blur ---
  const handleLinkBlur = (e) => {
    const currentValue = formData.externalRegistrationLink || "" // Default to empty string
    let processedValue = currentValue.trim()

    if (processedValue && !processedValue.startsWith("http://") && !processedValue.startsWith("https://")) {
      processedValue = `https://${processedValue}`
      if (processedValue !== currentValue) {
        setFormData((prev) => ({ ...prev, externalRegistrationLink: processedValue }))
      }
    } else if (!processedValue && currentValue) {
      setFormData((prev) => ({ ...prev, externalRegistrationLink: "" }))
    }
  }

  // Handle schedule changes for date, startTime, endTime
  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule]
    // Create a new object for the session to ensure state update immutability
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setFormData((prev) => ({ ...prev, schedule: newSchedule }))
  }

  // Add a new empty session manually
  const addScheduleSession = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { date: "", startTime: "", endTime: "" }], // Add new empty session
    }))
  }

  // Remove a session
  const removeScheduleSession = (index) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== index) // Use filter for immutability

    // If the schedule becomes empty after removal, add back one empty session
    if (newSchedule.length === 0) {
      setFormData((prev) => ({ ...prev, schedule: [{ date: "", startTime: "", endTime: "" }] }))
    } else {
      setFormData((prev) => ({ ...prev, schedule: newSchedule }))
    }
  }

  // Toggle day of week selection for multi-day sessions
  const toggleDayOfWeek = (day) => {
    setRepeatSettings((prev) => {
      const currentDays = [...prev.daysOfWeek]
      if (currentDays.includes(day)) {
        return { ...prev, daysOfWeek: currentDays.filter((d) => d !== day) }
      } else {
        return { ...prev, daysOfWeek: [...currentDays, day] }
      }
    })
  }

  // Preview generated sessions
  const previewGeneratedSessions = () => {
    setError(null) // Clear previous errors
    const { startDate, numberOfClasses, startTime, endTime, frequency, daysOfWeek } = repeatSettings

    // Validate required fields
    if (!startDate || !numberOfClasses || !startTime || !endTime) {
      setError("Please fill in all required fields for generating sessions.")
      return
    }

    // Validate number of classes
    const numClasses = Number.parseInt(numberOfClasses)
    if (isNaN(numClasses) || numClasses <= 0 || numClasses > 52) {
      setError("Number of classes must be between 1 and 52.")
      return
    }

    // For multi-day frequency, ensure at least one day is selected
    if (frequency === "multiple-days" && daysOfWeek.length === 0) {
      setError("Please select at least one day of the week.")
      return
    }

    try {
      const previewSessions = []
      const start = new Date(startDate)
      const offset = start.getTimezoneOffset()
      const current = new Date(start.getTime() + offset * 60 * 1000) // Adjust to treat date as local

      // Different logic based on frequency
      if (frequency === "weekly") {
        // Simple weekly sessions
        for (let i = 0; i < numClasses; i++) {
          previewSessions.push({
            date: formatDateForInput(current),
            startTime,
            endTime,
          })
          // Increment date by 7 days
          current.setDate(current.getDate() + 7)
        }
      } else if (frequency === "biweekly") {
        // Every two weeks
        for (let i = 0; i < numClasses; i++) {
          previewSessions.push({
            date: formatDateForInput(current),
            startTime,
            endTime,
          })
          // Increment date by 14 days
          current.setDate(current.getDate() + 14)
        }
      } else if (frequency === "monthly") {
        // Monthly (same day of month)
        for (let i = 0; i < numClasses; i++) {
          previewSessions.push({
            date: formatDateForInput(current),
            startTime,
            endTime,
          })
          // Increment by one month
          current.setMonth(current.getMonth() + 1)
        }
      } else if (frequency === "multiple-days") {
        // Multiple days per week
        const sortedDays = [...daysOfWeek].sort() // Sort days for consistent order
        let classCount = 0
        let weekCount = 0
        const daysMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }

        // Set current to the first selected day on or after the start date
        const startDay = start.getDay()
        let foundFirstDay = false

        // First, find the first occurrence of any selected day on or after the start date
        for (let i = 0; i < 7 && !foundFirstDay; i++) {
          const checkDay = (startDay + i) % 7
          const dayKey = Object.keys(daysMap).find((key) => daysMap[key] === checkDay)
          if (sortedDays.includes(dayKey)) {
            if (i > 0) {
              current.setDate(current.getDate() + i)
            }
            foundFirstDay = true
            break
          }
        }

        // Now generate the sessions
        while (classCount < numClasses) {
          const currentDay = current.getDay()
          const dayKey = Object.keys(daysMap).find((key) => daysMap[key] === currentDay)

          if (sortedDays.includes(dayKey)) {
            previewSessions.push({
              date: formatDateForInput(current),
              startTime,
              endTime,
            })
            classCount++
          }

          // Move to next day
          current.setDate(current.getDate() + 1)

          // Safety check to prevent infinite loops
          if (weekCount > 100) break
          if (current.getDay() === 0) weekCount++
        }
      }

      // Update state with preview sessions
      setRepeatSettings((prev) => ({
        ...prev,
        previewSessions,
      }))
      setPreviewMode(true)
    } catch (err) {
      console.error("Error generating session preview:", err)
      setError("Failed to generate session preview. Please check your inputs.")
    }
  }

  // Apply generated sessions to the schedule
  const applyGeneratedSessions = () => {
    if (repeatSettings.previewSessions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        schedule: repeatSettings.previewSessions,
      }))
      setPreviewMode(false)
      setSuccess("Sessions generated and applied successfully!")
    }
  }

  // Cancel preview mode
  const cancelPreview = () => {
    setPreviewMode(false)
    setRepeatSettings((prev) => ({
      ...prev,
      previewSessions: [],
    }))
  }

  // Handle form submission
 // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null) // Clear previous errors
  setSuccess(null)

  // Basic validation
  if (!formData.title || !formData.city || !formData.location?.address || !formData.instructor?.name) {
    setError("Please fill out all required fields: Title, City, Address, Instructor Name.")
    return
  }
  if (
    !formData.schedule ||
    formData.schedule.length === 0 ||
    !formData.schedule[0].date ||
    !formData.schedule[0].startTime ||
    !formData.schedule[0].endTime
  ) {
    setError("Please add at least one valid schedule entry (Date, Start Time, End Time).")
    return
  }

  try {
    setLoading(true)

    // Prepare data for submission - no URL conversion needed with Cloudinary
    const formattedData = {
      ...formData,
      // Ensure numeric fields are numbers
      cost: Number.parseFloat(formData.cost) || 0,
      capacity: Number.parseInt(formData.capacity) || 0,
      targetAgeRange: {
        min: Number.parseInt(formData.targetAgeRange.min) || 0,
        max: hasMaxAge && formData.targetAgeRange.max ? Number.parseInt(formData.targetAgeRange.max) : undefined,
      },
    }

    // Remove max age if checkbox is unchecked
    if (!hasMaxAge) {
      formattedData.targetAgeRange.max = undefined
    }
    // Remove external link if registration is internal
    if (formData.registrationType === "internal") {
      formattedData.externalRegistrationLink = undefined
    }

    if (isEditMode) {
      await updateClass(id, formattedData)
    } else {
      await createClass(formattedData)
    }

    navigate("/admin/classes") // Redirect on success
  } catch (err) {
    console.error("Failed to save class:", err)
    setError(err.response?.data?.message || "Failed to save class. An unexpected error occurred.")
  } finally {
    setLoading(false)
  }
}

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!isEditMode) return

    try {
      setLoading(true)
      await deleteClass(id)
      navigate("/admin/classes")
    } catch (err) {
      console.error("Failed to delete class:", err)
      setError(err.response?.data?.message || "Failed to delete class. Please try again.")
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  // Toggle section expansion
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section)
  }

  // --- JSX Structure ---
  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Class" : "Create New Class"}</h1>
        <Link
          to="/admin/classes"
          className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
        >
          <FiX className="mr-1 h-4 w-4" />
          Back to Classes
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 p-4 flex items-start" role="alert">
          <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="mt-1">{error}</p>
          </div>
          <button
            className="ml-auto -mr-1.5 -mt-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-red-100"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          className="mb-6 bg-green-50 border border-green-200 rounded-lg text-green-700 p-4 flex items-start"
          role="alert"
        >
          <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Success</p>
            <p className="mt-1">{success}</p>
          </div>
          <button
            className="ml-auto -mr-1.5 -mt-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-green-100"
            onClick={() => setSuccess(null)}
          >
            <span className="sr-only">Dismiss</span>
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Basic Information Section --- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            className={`w-full px-6 py-4 text-left flex justify-between items-center ${
              activeSection === "basic" ? "bg-gray-50" : "bg-white"
            }`}
            onClick={() => toggleSection("basic")}
          >
            <div className="flex items-center">
              <FiInfo className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            </div>
            {activeSection === "basic" ? (
              <FiChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {activeSection === "basic" && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., Advanced Self-Defense Workshop"
                    />
                  </div>
                </div>

                {/* Class Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="one-time">Defender Course</option>
                      <option value="ongoing">Seminar</option>
                      {/* Add other types as needed */}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Select a City</option>
                      {cities.map((city) => (
                        <option key={city._id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiMapPin className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <PlacesAutocompleteInput
                    id="address"
                    onAddressSelect={(selected) =>
                      setFormData((prev) => ({ ...prev, location: { address: selected.address } }))
                    }
                    initialValue={formData.location.address}
                  />
                </div>

                {/* Cost */}
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="cost"
                      type="number"
                      name="cost"
                      min="0"
                      step="0.01" // Allow cents
                      value={formData.cost}
                      onChange={handleChange}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUsers className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="capacity"
                      type="number"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
    Description <span className="text-red-500">*</span>
  </label>
  <textarea
    id="description"
    name="description"
    rows="4"
    value={formData.description}
    onChange={handleChange}
    required
    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
    placeholder="Provide a detailed description of the class... Press Enter for paragraph breaks."
  ></textarea>
  <p className="mt-1 text-xs text-gray-500">
    Use paragraph breaks (Enter key) to organize your text into readable sections.
  </p>
</div>
            </div>
          )}
        {/* Class Image Upload */}
<div className="mt-6">
  <label htmlFor="classImageFile" className="block text-sm font-medium text-gray-700 mb-1">
    Class Image
  </label>
  <div className="flex items-center space-x-4">
    <div className="flex-1">
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <FiImage className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="classImageFile"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <span>Upload a file</span>
              <input
                id="classImageFile"
                name="classImageFile"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="sr-only"
                onChange={uploadClassImage}
                disabled={uploadingImage}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 2MB</p>
        </div>
      </div>
    </div>

    {/* Image Preview */}
    {imagePreview && (
      <div className="flex-shrink-0 w-32">
        <div className="relative">
          <img
            src={imagePreview || "/placeholder.svg"}
            alt="Class Image Preview"
            className="h-24 w-auto object-contain border border-gray-200 rounded-md p-1"
          />
          <button
            type="button"
            onClick={() => {
              setImagePreview("")
              setFormData((prev) => ({ ...prev, imageUrl: "" }))
            }}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 text-gray-500 hover:text-red-500"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
    )}
  </div>
  {uploadingImage && (
    <div className="mt-2 flex items-center text-sm text-primary-600">
      <FiRefreshCw className="animate-spin mr-2 h-4 w-4" />
      Uploading image...
    </div>
  )}
</div>
        </section>

        {/* --- Instructor Info Section --- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            className={`w-full px-6 py-4 text-left flex justify-between items-center ${
              activeSection === "instructor" ? "bg-gray-50" : "bg-white"
            }`}
            onClick={() => toggleSection("instructor")}
          >
            <div className="flex items-center">
              <FiUser className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Instructor</h2>
            </div>
            {activeSection === "instructor" ? (
              <FiChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {activeSection === "instructor" && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instructor Name */}
                <div>
                  <label htmlFor="instructor.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="instructor.name"
                    type="text"
                    name="instructor.name" // Use dot notation for nested state
                    value={formData.instructor.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="e.g., John Smith"
                  />
                </div>

                {/* Instructor Bio */}
                <div>
                  <label htmlFor="instructor.bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor Bio
                  </label>
                  <textarea
                    id="instructor.bio"
                    name="instructor.bio" // Use dot notation
                    rows="4"
                    value={formData.instructor.bio}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Brief bio of the instructor..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- Registration Info Section --- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            className={`w-full px-6 py-4 text-left flex justify-between items-center ${
              activeSection === "registration" ? "bg-gray-50" : "bg-white"
            }`}
            onClick={() => toggleSection("registration")}
          >
            <div className="flex items-center">
              <FiExternalLink className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Registration Settings</h2>
            </div>
            {activeSection === "registration" ? (
              <FiChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {activeSection === "registration" && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Type */}
                <div>
                  <label htmlFor="registrationType" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Type
                  </label>
                  <select
                    id="registrationType"
                    name="registrationType"
                    value={formData.registrationType}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="internal">Use StandStrong Form</option>
                    <option value="external">Redirect to Partner Website</option>
                  </select>
                </div>

                {/* External URL (Conditional) */}
                {formData.registrationType === "external" && (
                  <div>
                    <label htmlFor="externalRegistrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Registration URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="externalRegistrationLink"
                        type="url" // Use type="url" for basic browser validation
                        name="externalRegistrationLink"
                        value={formData.externalRegistrationLink}
                        onChange={handleChange}
                        onBlur={handleLinkBlur} // Add https:// on blur if missing
                        placeholder="https://partnerwebsite.com/register"
                        className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        required={formData.registrationType === "external"}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Required for external registration. URL must start with http:// or https://
                    </p>
                  </div>
                )}
              </div>

              {/* Partner Logo Upload */}
              <div>
                <label htmlFor="partnerLogoFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Logo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="partnerLogoFile"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="partnerLogoFile"
                              name="partnerLogoFile"
                              type="file"
                              accept="image/png, image/jpeg, image/gif, image/webp"
                              className="sr-only"
                              onChange={uploadPartnerLogo}
                              disabled={uploadingLogo}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Logo Preview */}
                  {formData.partnerLogo && (
                    <div className="flex-shrink-0 w-32">
                      <div className="relative">
                        <img
                          src={formData.partnerLogo || "/placeholder.svg"}
                          alt="Partner Logo Preview"
                          className="h-24 w-auto object-contain border border-gray-200 rounded-md p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, partnerLogo: "" }))}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 text-gray-500 hover:text-red-500"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {uploadingLogo && (
                  <div className="mt-2 flex items-center text-sm text-primary-600">
                    <FiRefreshCw className="animate-spin mr-2 h-4 w-4" />
                    Uploading logo...
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* --- Target Audience Section --- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            className={`w-full px-6 py-4 text-left flex justify-between items-center ${
              activeSection === "audience" ? "bg-gray-50" : "bg-white"
            }`}
            onClick={() => toggleSection("audience")}
          >
            <div className="flex items-center">
              <FiUsers className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Target Audience</h2>
            </div>
            {activeSection === "audience" ? (
              <FiChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {activeSection === "audience" && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Audience Type (Gender) */}
                <div>
                  <label htmlFor="targetGender" className="block text-sm font-medium text-gray-700 mb-1">
                    Audience Type
                  </label>
                  <select
                    id="targetGender"
                    name="targetGender"
                    value={formData.targetGender}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="any">Co-ed Class</option>
                    <option value="male">Men Only</option>
                    <option value="female">Women Only</option>
                  </select>
                </div>

                {/* Minimum Age */}
                <div>
                  <label htmlFor="targetAgeRange.min" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Age
                  </label>
                  <input
                    id="targetAgeRange.min"
                    type="number"
                    name="targetAgeRange.min" // Use dot notation
                    min="0"
                    value={formData.targetAgeRange.min}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="18"
                  />
                </div>

                {/* Maximum Age (Conditional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="targetAgeRange.max" className="block text-sm font-medium text-gray-700">
                      Maximum Age
                    </label>
                    <div className="flex items-center">
                      <input
                        id="hasMaxAge"
                        type="checkbox"
                        checked={hasMaxAge}
                        onChange={(e) => setHasMaxAge(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hasMaxAge" className="ml-2 block text-sm text-gray-500">
                        Set limit
                      </label>
                    </div>
                  </div>

                  {hasMaxAge && (
                    <input
                      id="targetAgeRange.max"
                      type="number"
                      name="targetAgeRange.max" // Use dot notation
                      min={formData.targetAgeRange.min || 0} // Min should be at least min age
                      value={formData.targetAgeRange.max}
                      onChange={handleChange}
                      placeholder="e.g. 65"
                      className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- Schedule Builder Section --- */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            className={`w-full px-6 py-4 text-left flex justify-between items-center ${
              activeSection === "schedule" ? "bg-gray-50" : "bg-white"
            }`}
            onClick={() => toggleSection("schedule")}
          >
            <div className="flex items-center">
              <FiCalendar className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
            </div>
            {activeSection === "schedule" ? (
              <FiChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {activeSection === "schedule" && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Enhanced Session Generator */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-medium text-gray-800 mb-4">Session Generator</h3>

                <div className="space-y-4">
                  {/* Generator Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label htmlFor="repeatStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="repeatStartDate"
                          type="date"
                          value={repeatSettings.startDate}
                          onChange={(e) => setRepeatSettings((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label htmlFor="repeatFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        id="repeatFrequency"
                        value={repeatSettings.frequency}
                        onChange={(e) =>
                          setRepeatSettings((prev) => ({ ...prev, frequency: e.target.value, daysOfWeek: [] }))
                        }
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="weekly">Weekly (Same Day Each Week)</option>
                        <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                        <option value="monthly">Monthly (Same Day Each Month)</option>
                        <option value="multiple-days">Multiple Days Per Week</option>
                      </select>
                    </div>

                    {/* Days of Week (for multiple-days frequency) */}
                    {repeatSettings.frequency === "multiple-days" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days of Week <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDayOfWeek(day)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                                repeatSettings.daysOfWeek.includes(day)
                                  ? "bg-primary-100 text-primary-800 border border-primary-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Number of Classes */}
                    <div>
                      <label htmlFor="repeatNumClasses" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Classes <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="repeatNumClasses"
                        type="number"
                        min="1"
                        max="52"
                        value={repeatSettings.numberOfClasses}
                        onChange={(e) => setRepeatSettings((prev) => ({ ...prev, numberOfClasses: e.target.value }))}
                        placeholder="e.g., 6"
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="repeatStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiClock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="repeatStartTime"
                            type="time"
                            step="900" // 15 min increments
                            value={repeatSettings.startTime}
                            onChange={(e) => setRepeatSettings((prev) => ({ ...prev, startTime: e.target.value }))}
                            className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="repeatEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiClock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="repeatEndTime"
                            type="time"
                            step="900" // 15 min increments
                            value={repeatSettings.endTime}
                            onChange={(e) => setRepeatSettings((prev) => ({ ...prev, endTime: e.target.value }))}
                            className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview/Generate Buttons */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={previewGeneratedSessions}
                      disabled={
                        !repeatSettings.startDate ||
                        !repeatSettings.numberOfClasses ||
                        !repeatSettings.startTime ||
                        !repeatSettings.endTime ||
                        (repeatSettings.frequency === "multiple-days" && repeatSettings.daysOfWeek.length === 0)
                      }
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      <FiRefreshCw className="mr-2 h-4 w-4" />
                      Preview Sessions
                    </button>
                  </div>
                </div>

                {/* Preview Mode */}
                {previewMode && repeatSettings.previewSessions.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Preview: {repeatSettings.previewSessions.length} Sessions
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={applyGeneratedSessions}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <FiCheckCircle className="mr-1 h-3 w-3" />
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={cancelPreview}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <FiX className="mr-1 h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Time
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {repeatSettings.previewSessions.map((session, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {formatDateForDisplay(session.date)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatTimeForDisplay(session.startTime)} - {formatTimeForDisplay(session.endTime)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Schedule List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-800">Class Sessions</h3>
                  <span className="text-sm text-gray-500">
                    {formData.schedule.length} session{formData.schedule.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Check if schedule exists and has items before mapping */}
                {formData.schedule && formData.schedule.length > 0 ? (
                  <div className="space-y-3">
                    {formData.schedule.map((session, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start p-4 border rounded-md relative bg-white hover:bg-gray-50 transition-colors"
                      >
                        {/* Date Input */}
                        <div>
                          <label
                            htmlFor={`schedule-date-${index}`}
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiCalendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id={`schedule-date-${index}`}
                              type="date"
                              value={session.date || ""} // Ensure value is controlled
                              onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                              required // Make individual sessions required
                              className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* Start Time Input */}
                        <div>
                          <label
                            htmlFor={`schedule-startTime-${index}`}
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            Start Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiClock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id={`schedule-startTime-${index}`}
                              type="time"
                              step="900" // 15 min increments
                              value={session.startTime || ""} // Ensure value is controlled
                              onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                              required
                              className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* End Time Input */}
                        <div>
                          <label
                            htmlFor={`schedule-endTime-${index}`}
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiClock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id={`schedule-endTime-${index}`}
                              type="time"
                              step="900" // 15 min increments
                              value={session.endTime || ""} // Ensure value is controlled
                              onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                              required
                              className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-center justify-end h-full">
                          <button
                            type="button"
                            onClick={() => removeScheduleSession(index)}
                            className="inline-flex items-center justify-center p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Remove this session"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Session</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FiCalendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">
                      No sessions added yet. Use the generator above or add sessions manually.
                    </p>
                  </div>
                )}

                {/* Add Manual Session Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addScheduleSession}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Add Session Manually
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- Save/Cancel/Delete Actions --- */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          {/* Delete Button (Edit Mode Only) */}
          {isEditMode && (
            <div>
              {confirmDelete ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600 font-medium">Confirm deletion?</span>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete Class
                </button>
              )}
            </div>
          )}

          {/* Cancel/Save Buttons */}
          <div className="flex space-x-4 ml-auto">
            <Link
              to="/admin/classes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  {isEditMode ? "Save Changes" : "Create Class"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ClassFormPage
