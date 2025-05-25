"use client"


// src/pages/admin/RegistrationsPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import {
  FiUsers,
  FiList,
  FiFilter,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiSearch,
  FiInfo,
  FiCalendar,
  FiMail,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiDownload,
  FiX,
} from "react-icons/fi"


// --- Service functions ---
import { getClasses } from "/src/services/classService.js"
import { getClassRegistrations, updateRegistration, deleteRegistration } from "/src/services/registrationService.js"
import { getAllCityRecords } from "/src/services/cityService.js";


// --- Reusable Components ---
const LoadingSpinner = ({ size = "medium", message = "Loading..." }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }


  return (
    <div className="flex flex-col items-center justify-center py-8">
      <FiLoader className={`animate-spin ${sizeClasses[size]} text-primary-600 mb-3`} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}


const Alert = ({ type, message, onDismiss }) => {
  const types = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <FiAlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <FiInfo className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />,
    },
  }


  const style = types[type] || types.info


  return (
    <div
      className={`my-4 p-4 rounded-lg border ${style.bg} ${style.border} ${style.text} flex items-start`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto -mr-1.5 -mt-1.5 bg-transparent text-gray-400 hover:text-gray-600 rounded-lg p-1.5"
          aria-label="Dismiss"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}


const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center px-6 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
)


const Badge = ({ status }) => {
  const styles = {
    enrolled: "bg-green-100 text-green-800 border-green-200",
    waitlisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cancelled_by_admin: "bg-red-100 text-red-800 border-red-200",
    cancelled_by_user: "bg-gray-100 text-gray-800 border-gray-200",
  }


  const icons = {
    enrolled: <FiUserCheck className="h-3 w-3 mr-1" />,
    waitlisted: <FiClock className="h-3 w-3 mr-1" />,
    cancelled_by_admin: <FiUserX className="h-3 w-3 mr-1" />,
    cancelled_by_user: <FiUserX className="h-3 w-3 mr-1" />,
  }


  const displayText = {
    enrolled: "Enrolled",
    waitlisted: "Waitlisted",
    cancelled_by_admin: "Cancelled (Admin)",
    cancelled_by_user: "Cancelled (User)",
  }


  const style = styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
  const icon = icons[status] || null
  const text = displayText[status] || status.replace(/_/g, " ")


  return (
    <span className={`px-2.5 py-1 inline-flex items-center text-xs font-medium rounded-full border ${style}`}>
      {icon}
      {text}
    </span>
  )
}


const ConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  if (!isOpen) return null


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
            >
              {cancelText || "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              {confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


const RegistrationsPage = () => {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [registrations, setRegistrations] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [processingRegistrationId, setProcessingRegistrationId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, registrationId: null })
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [allCities, setAllCities] = useState([]); // To store city objects { _id, name, ... }
  const [loadingCitiesFilter, setLoadingCitiesFilter] = useState(true);
  const [errorCitiesFilter, setErrorCitiesFilter] = useState("");


  // --- Fetch Classes for Dropdown ---
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true)
      setError("")
      try {
        const data = await getClasses()
        setClasses(data || [])
      } catch (err) {
        console.error("Error fetching classes:", err)
        setError("Failed to load classes list.")
        setClasses([])
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [])


  useEffect(() => {
    const fetchCitiesForFilter = async () => {
      setLoadingCitiesFilter(true);
      setErrorCitiesFilter(""); // Clear previous errors
      try {
        const citiesData = await getAllCityRecords(); // Call the new service function
        setAllCities(citiesData || []);
      } catch (err) {
        console.error("Error fetching cities for filter:", err);
        setErrorCitiesFilter("Failed to load city filter options.");
        setAllCities([]);
      } finally {
        setLoadingCitiesFilter(false);
      }
    };
    fetchCitiesForFilter();
  }, []); // Empty dependency array means run once on mount


  // --- Fetch Registrations when Class Changes ---
  const fetchRegistrationsForClass = useCallback(async (classId) => {
    if (!classId) {
      setRegistrations([])
      return
    }
    setLoadingRegistrations(true)
    setError("")
    setSuccess("")
    try {
      const data = await getClassRegistrations(classId)
      setRegistrations(data || [])
    } catch (err) {
      console.error(`Error fetching registrations for class ${classId}:`, err)
      setError(err.response?.data?.message || "Failed to load registrations.")
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }, [])


  useEffect(() => {
    fetchRegistrationsForClass(selectedClassId)
  }, [selectedClassId, fetchRegistrationsForClass])


  // --- Handle Actions ---
  const openStatusChangeDialog = (registrationId, currentStatus) => {
    setConfirmDialog({
      isOpen: true,
      type: "status",
      registrationId,
      currentStatus,
      title: "Change Registration Status",
      message: "Are you sure you want to change the status of this registration?",
    })
  }


  const openDeleteDialog = (registrationId) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      registrationId,
      title: "Unenroll Student",
      message: "Are you sure you want to unenroll this student? This action cannot be undone.",
    })
  }


  const handleStatusChange = async (registrationId, newStatus) => {
    setProcessingRegistrationId(registrationId)
    setError("")
    setSuccess("")
    try {
      await updateRegistration(registrationId, { status: newStatus })
      setSuccess("Registration status updated successfully!")
      fetchRegistrationsForClass(selectedClassId)
    } catch (err) {
      console.error("Error updating registration status:", err)
      setError(err.response?.data?.message || "Failed to update status.")
    } finally {
      setProcessingRegistrationId(null)
    }
  }


  const handleDelete = async (registrationId) => {
    setProcessingRegistrationId(registrationId)
    setError("")
    setSuccess("")
    try {
      await deleteRegistration(registrationId)
      setSuccess("Student unenrolled successfully!")
      fetchRegistrationsForClass(selectedClassId)
    } catch (err) {
      console.error("Error deleting registration:", err)
      setError(err.response?.data?.message || "Failed to unenroll student.")
    } finally {
      setProcessingRegistrationId(null)
    }
  }


  const handleConfirmDialog = async (newStatus) => {
    const { type, registrationId } = confirmDialog


    if (type === "status") {
      await handleStatusChange(registrationId, newStatus)
    } else if (type === "delete") {
      await handleDelete(registrationId)
    }


    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }


  const handleCancelDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }


  const selectedClassDetails = useMemo(() => {
    return classes.find((c) => c._id === selectedClassId)
  }, [classes, selectedClassId])


  // --- Filtered Registrations ---
  const filteredRegistrations = useMemo(() => {
    if (!registrations.length) return []


    return registrations.filter((reg) => {
      // Status filter
      if (statusFilter !== "all" && reg.status !== statusFilter) {
        return false
      }


      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const fullName = `${reg.user?.firstName || ""} ${reg.user?.lastName || ""}`.toLowerCase()
        const email = (reg.user?.email || "").toLowerCase()


        return fullName.includes(searchLower) || email.includes(searchLower)
      }


      return true
    })
  }, [registrations, searchTerm, statusFilter])


  const filteredClassesForDropdown = useMemo(() => {
    if (cityFilter === 'all') {
        return classes; // Show all classes if 'All Cities' is selected
    }
    // Filter the classes fetched initially based on the city name in the filter state
    return classes.filter(cls => cls.city === cityFilter);
}, [classes, cityFilter]); // Dependencies: recalculate when classes or cityFilter change


  // --- Export to CSV ---
  const exportToCSV = () => {
    if (!filteredRegistrations.length) return


    const headers = ["First Name", "Last Name", "Email", "Status", "Registration Date"]


    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map((reg) => {
        return [
          reg.user?.firstName || "",
          reg.user?.lastName || "",
          reg.user?.email || "",
          reg.status.replace(/_/g, " "),
          format(new Date(reg.registrationDate), "yyyy-MM-dd HH:mm:ss"),
        ].join(",")
      }),
    ].join("\n")


    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `registrations-${selectedClassDetails?.title || "class"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 md:mb-0">
          <FiList className="mr-3 h-6 w-6 text-primary-600" /> Class Registrations
        </h1>


        {selectedClassId && registrations.length > 0 && (
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export to CSV
          </button>
        )}
      </div>


      {/* Global Error/Success Display */}
      {error && <Alert type="error" message={error} onDismiss={() => setError("")} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}


      {/* Class Selector Card */}
      <div className="mb-8 bg-white p-6 shadow-sm rounded-xl border border-gray-100">
        {/* --- CITY FILTER DROPDOWN --- */}
        <div className="mb-4">
           <label htmlFor="cityFilterSelect" className="block text-sm font-medium text-gray-700 mb-1">
             Filter Classes by City
           </label>
           <select
             id="cityFilterSelect"
             className="block w-full md:w-1/2 lg:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
             value={cityFilter}
             onChange={(e) => {
              const newCity = e.target.value;
              setCityFilter(newCity);
              setSearchTerm(""); // Reset search term
              setRegistrations([]); // Clear registrations
            
              const matchingClasses = newCity === "all"
                ? classes
                : classes.filter(cls => cls.city === newCity);
            
              if (matchingClasses.length === 1) {
                setSelectedClassId(matchingClasses[0]._id); // Auto-select class
              } else {
                setSelectedClassId(""); // Reset if not exactly one match
              }
            }}
             // Disable while loading cities or if there's an error fetching them
             disabled={loadingCitiesFilter || !!errorCitiesFilter || allCities.length === 0}
           >
             <option value="all">-- All Cities --</option>
             {/* Map over the allCities state */}
             {allCities.map((city) => (
               // Use city._id for key, city.name for value and display text
               <option key={city._id} value={city.name}>
                 {city.name}
               </option>
             ))}
           </select>
           {/* Optional: Show loading/error state for the filter */}
           {loadingCitiesFilter && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <FiLoader className="animate-spin h-3 w-3 mr-2" /> Loading cities...
                </div>
           )}
           {errorCitiesFilter && !loadingCitiesFilter &&(
               <p className="mt-2 text-sm text-red-600">{errorCitiesFilter}</p>
           )}
         </div>
       {/* --- END CITY FILTER DROPDOWN --- */}




        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select a Class to View Registrations
            </label>
            <select
 id="classSelect"
  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
  value={selectedClassId}
  onChange={(e) => setSelectedClassId(e.target.value)}
   // Disable if loading classes OR if no classes match the current city filter
   disabled={loadingClasses || filteredClassesForDropdown.length === 0}
 >
   <option value="">-- Select a Class --</option>
   {/* --- CHANGE classes.map to filteredClassesForDropdown.map --- */}
   {filteredClassesForDropdown.map((cls) => (
     <option key={cls._id} value={cls._id}>
       {cls.title} {cls.city && `(${cls.city})`}
     </option>
   ))}
 </select>
 {/* Optional: Add message if no classes match city filter */}
 {!loadingClasses && cityFilter !== 'all' && filteredClassesForDropdown.length === 0 && (
     <p className="mt-2 text-sm text-gray-500">No classes found in {cityFilter}.</p>
 )}
 {loadingClasses && (
    <div className="flex items-center mt-2 text-sm text-gray-500">
      <FiLoader className="animate-spin h-3 w-3 mr-2" /> Loading classes...
    </div>
 )}
          </div>


          {selectedClassId && (
            <button
              onClick={() => fetchRegistrationsForClass(selectedClassId)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loadingRegistrations}
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${loadingRegistrations ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>


      {/* Registrations Section */}
      {selectedClassId ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiUsers className="mr-2 h-5 w-5 text-primary-600" />
                {selectedClassDetails?.title || "Class"} Registrations
                {!loadingRegistrations && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredRegistrations.length} {filteredRegistrations.length === 1 ? "student" : "students"})
                  </span>
                )}
              </h2>


              {registrations.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>


                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-auto sm:text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="cancelled_by_admin">Cancelled (Admin)</option>
                    <option value="cancelled_by_user">Cancelled (User)</option>
                  </select>
                </div>
              )}
            </div>
          </div>


          {loadingRegistrations ? (
            <LoadingSpinner message="Loading registrations..." />
          ) : registrations.length > 0 ? (
            <>
              {filteredRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Student
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Registered On
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                                {reg.user?.firstName?.charAt(0) || ""}
                                {reg.user?.lastName?.charAt(0) || ""}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {reg.user?.firstName} {reg.user?.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiMail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {reg.user?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {format(new Date(reg.registrationDate), "MMM d, yyyy")}
                              <span className="ml-1 text-gray-400">
                                {format(new Date(reg.registrationDate), "h:mm a")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge status={reg.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <select
                                  value={reg.status}
                                  onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                                  className="pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                  disabled={processingRegistrationId === reg._id}
                                  title="Change Status"
                                >
                                  <option value="enrolled">Enrolled</option>
                                  <option value="waitlisted">Waitlisted</option>
                                  <option value="cancelled_by_admin">Cancel (Admin)</option>
                                  {reg.status === "cancelled_by_user" && (
                                    <option value="cancelled_by_user">Cancelled (User)</option>
                                  )}
                                </select>
                              </div>


                              <button
                                onClick={() => openDeleteDialog(reg._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded-md hover:bg-red-50"
                                disabled={processingRegistrationId === reg._id}
                                title="Unenroll Student"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>


                              {processingRegistrationId === reg._id && (
                                <FiLoader className="h-4 w-4 animate-spin text-gray-500" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center px-6 py-12">
                  <FiSearch className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No matching registrations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                    className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<FiUsers className="h-8 w-8" />}
              title="No Registrations Found"
              description="There are currently no students registered for this class."
              action={
                <Link
                  to="/admin/classes"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Manage Classes
                </Link>
              }
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<FiFilter className="h-8 w-8" />}
          title="Select a Class"
          description="Please choose a class from the dropdown above to view its registrations."
        />
      )}


      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === "delete" ? "Unenroll" : "Change Status"}
        cancelText="Cancel"
        onConfirm={() => handleConfirmDialog(confirmDialog.newStatus)}
        onCancel={handleCancelDialog}
      />
    </div>
  )
}


export default RegistrationsPage