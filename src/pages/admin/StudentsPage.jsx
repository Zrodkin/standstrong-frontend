// src/pages/admin/StudentsPage.jsx
import { useState, useEffect, useCallback } from "react"
import {
  FiUsers,
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiMail,
  FiPhone,
  FiClock,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiUserPlus,
  FiInfo,
} from "react-icons/fi"
import { format } from "date-fns"

// Import actual API services
import { 
  getUsers, 
  getBranches, 
  getTags, 
  exportStudents,
  getUserRegistrations 
} from "../../services/userService"
import { useAuth } from "../../context/AuthContext"

// Reusable components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>{children}</div>
)

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  switch (status) {
    case "active":
      return <Badge color="green">Active</Badge>
    case "inactive":
      return <Badge color="red">Inactive</Badge>
    case "completed":
      return <Badge color="blue">Completed</Badge>
    case "upcoming":
      return <Badge color="yellow">Upcoming</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const Avatar = ({ src, name, size = "md" }) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <div
      className={`relative rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium overflow-hidden ${sizes[size]}`}
    >
      {src ? (
        <img src={src || "/placeholder.svg"} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  )
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []
  const maxVisiblePages = 5

  // Calculate range of visible page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  // Generate page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <FiChevronUp className="h-5 w-5 rotate-90" />
            </button>
            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
              </>
            )}
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <FiChevronDown className="h-5 w-5 rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

const StudentCard = ({ student, onViewDetails }) => {
  // Default properties in case enrollment data isn't available yet
  const enrollments = student.enrollments || [];
  const activeEnrollments = enrollments.filter(e => e.status === "active" || e.status === "enrolled").length;
  const completedEnrollments = enrollments.filter(e => e.status === "completed").length;

  return (
    <Card className="h-full">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar src={student.profileImage} name={`${student.firstName} ${student.lastName}`} size="lg" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>
          <StatusBadge status={student.status || "active"} />
        </div>

        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex items-center text-sm">
            <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
            <span>{student.city || "Unknown"}</span>
          </div>
          <div className="flex items-center text-sm">
            <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
            <span>{student.phone || "No phone number"}</span>
          </div>
          <div className="flex items-center text-sm">
            <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
            <span>Joined {format(new Date(student.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center text-sm">
            <FiClock className="mr-2 h-4 w-4 text-gray-400" />
            <span>Last active {format(new Date(student.updatedAt || student.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Enrollments:</span>
            <span className="font-medium">{enrollments.length} total</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-green-50 p-2 rounded text-center">
              <span className="block text-lg font-semibold text-green-700">{activeEnrollments}</span>
              <span className="text-xs text-green-600">Active</span>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <span className="block text-lg font-semibold text-blue-700">{completedEnrollments}</span>
              <span className="text-xs text-blue-600">Completed</span>
            </div>
          </div>

          {student.tags && student.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {student.tags.map((tag) => (
                <Badge key={tag} color="purple">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <button
            onClick={() => onViewDetails(student._id)}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiEye className="mr-2 h-4 w-4" />
            View Profile
          </button>
        </div>
      </div>
    </Card>
  )
}

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentEnrollments = async () => {
      if (!isOpen || !student) return;
      
      setLoadingEnrollments(true);
      try {
        // This would ideally be an API call to get enrollments for this student
        // For now, we'll use the enrollments passed from the parent component
        setEnrollments(student.enrollments || []);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Failed to load student enrollments.");
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchStudentEnrollments();
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex items-center">
            <Avatar src={student.profileImage} name={`${student.firstName} ${student.lastName}`} size="lg" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex items-center mt-1">
                <StatusBadge status={student.status || "active"} />
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">{student.city || "Unknown"} Branch</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Close">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Contact & Basic Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FiMail className="mr-3 h-5 w-5 text-gray-400" />
                    <a href={`mailto:${student.email}`} className="text-primary-600 hover:underline">
                      {student.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiPhone className="mr-3 h-5 w-5 text-gray-400" />
                    <a href={`tel:${student.phone}`} className="text-primary-600 hover:underline">
                      {student.phone || "No phone number"}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Membership Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FiCalendar className="mr-3 h-5 w-5 text-gray-400" />
                    <span>
                      Joined <strong>{format(new Date(student.createdAt), "MMMM d, yyyy")}</strong>
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiClock className="mr-3 h-5 w-5 text-gray-400" />
                    <span>
                      Last active <strong>{format(new Date(student.updatedAt || student.createdAt), "MMMM d, yyyy")}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                {student.tags && student.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.tags.map((tag) => (
                      <Badge key={tag} color="purple">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No tags assigned</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                {student.notes ? (
                  <p className="text-sm text-gray-700">{student.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes available</p>
                )}
              </div>
            </div>

            {/* Right column - Enrollments & Activity */}
            <div className="md:col-span-2 space-y-6">
              {loadingEnrollments ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="animate-spin h-8 w-8 text-primary-600 mr-3" />
                  <span>Loading enrollments...</span>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Enrollment History</h3>
                    {enrollments.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Class
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.map((enrollment, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {enrollment.className || enrollment.class?.title || "Class Name Unavailable"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {enrollment.startDate 
                                    ? format(new Date(enrollment.startDate), "MMM d, yyyy")
                                    : enrollment.registrationDate
                                      ? format(new Date(enrollment.registrationDate), "MMM d, yyyy")
                                      : "Date Unavailable"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <StatusBadge status={enrollment.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No enrollment history available</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Classes</h4>
                        <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Active Classes</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {enrollments.filter((e) => e.status === "active" || e.status === "enrolled").length}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Completed Classes</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {enrollments.filter((e) => e.status === "completed").length}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Upcoming Classes</h4>
                        <p className="text-2xl font-bold text-yellow-600">
                          {enrollments.filter((e) => e.status === "upcoming" || e.status === "waitlisted").length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <FiEdit className="inline-block mr-2 h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminStudentsPage = () => {
  // Auth context for token validation
  const { isAdmin } = useAuth();
  
  // State
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    branch: "all",
    status: "all",
    enrollmentStatus: "all",
    tags: [],
  })
  const [sort, setSort] = useState({ field: "lastName", direction: "asc" })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [viewMode, setViewMode] = useState("table") // 'table' or 'grid'
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch branches and tags in parallel
      const [branchesData, tagsData] = await Promise.all([
        getBranches(),
        getTags()
      ]);
      
      setBranches(branchesData);
      setTags(tagsData);

      // Fetch users with filters
      const params = {
        ...filters,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit,
        sort: sort.field,
        direction: sort.direction,
      }

      const userData = await getUsers(params);
      
      // Process user data to add enrollment information
      // In a real implementation, this would likely be handled by the backend
      const processedUsers = userData.users.map(user => ({
        ...user,
        status: user.status || 'active', // Default status
        // Add empty enrollments array if not provided
        enrollments: user.enrollments || []
      }));
      
      setUsers(processedUsers);
      setPagination({
        ...pagination,
        total: userData.total,
        totalPages: userData.totalPages,
      });
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load student data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters, searchTerm, pagination.page, pagination.limit, sort])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination({ ...pagination, page: 1 }) // Reset to first page on new search
  }

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPagination({ ...pagination, page: 1 }) // Reset to first page on filter change
  }

  // Handle tag selection
  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const currentTags = [...prev.tags]
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) }
      } else {
        return { ...prev, tags: [...currentTags, tag] }
      }
    })
    setPagination({ ...pagination, page: 1 }) // Reset to first page on filter change
  }

  // Handle sorting
  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page })
  }

  // Handle view student details
  const handleViewDetails = async (studentId) => {
    const student = users.find((u) => u._id === studentId);
    
    if (student) {
      // If we need to fetch additional student details or enrollment information
      try {
        // This would get all registrations for the student
        // You could implement a getUserRegistrations function in your user service
        // const registrations = await getUserRegistrations(studentId);
        
        // For now, we'll use the student data we already have
        const enhancedStudent = {
          ...student,
          // If there's additional data to fetch, we could merge it here
        };
        
        setSelectedStudent(enhancedStudent);
        setIsDetailsModalOpen(true);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError("Failed to load student details. Please try again.");
      }
    }
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportStudents({
        ...filters,
        search: searchTerm,
      })
      // Show success message
      alert("Export successful! The file has been downloaded.")
    } catch (err) {
      console.error("Export error:", err)
      setError("Failed to export student data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sort.field !== field) return null
    return sort.direction === "asc" ? (
      <FiChevronUp className="ml-1 h-4 w-4 inline-block" />
    ) : (
      <FiChevronDown className="ml-1 h-4 w-4 inline-block" />
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 md:mb-0">
          <FiUsers className="mr-3 h-6 w-6 text-primary-600" /> Student Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => alert("Add Student functionality would go here")}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <FiUserPlus className="mr-2 h-4 w-4" />
            Add Student
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="branch-filter"
            value={filters.branch}
            onChange={(e) => handleFilterChange("branch", e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="all">All Locations</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name} {branch.studentCount > 0 ? `(${branch.studentCount})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="enrollment-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Enrollment
          </label>
          <select
            id="enrollment-filter"
            value={filters.enrollmentStatus}
            onChange={(e) => handleFilterChange("enrollmentStatus", e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="all">All Enrollments</option>
            <option value="active">Active Classes</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed Classes</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="search-students" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              id="search-students"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Name, email, phone..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                  filters.tags.includes(tag)
                    ? "bg-primary-100 text-primary-800 border border-primary-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {filters.tags.includes(tag) && <FiCheck className="mr-1 h-3 w-3" />}
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Toggle & Results Count */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {loading ? (
            <span className="flex items-center">
              <FiLoader className="animate-spin mr-2 h-4 w-4" /> Loading students...
            </span>
          ) : (
            <span>
              Showing <span className="font-medium">{users.length}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> students
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md ${
              viewMode === "table" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Table view"
          >
            <FiList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${
              viewMode === "grid" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Grid view"
          >
            <FiGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <Card className="p-12 flex justify-center items-center">
          <FiLoader className="animate-spin h-8 w-8 text-primary-600 mr-3" />
          <span className="text-lg text-gray-600">Loading students...</span>
        </Card>
      ) : users.length > 0 ? (
        <>
          {viewMode === "table" ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          type="button"
                          className="flex items-center w-full text-left focus:outline-none"
                          onClick={() => handleSort("lastName")}
                        >
                          Student {renderSortIcon("lastName")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          type="button"
                          className="flex items-center w-full text-left focus:outline-none"
                          onClick={() => handleSort("email")}
                        >
                          Contact {renderSortIcon("email")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          type="button"
                          className="flex items-center w-full text-left focus:outline-none"
                          onClick={() => handleSort("city")}
                        >
                          Location {renderSortIcon("city")}
                        </button>
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
                        Enrollments
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          type="button"
                          className="flex items-center w-full text-left focus:outline-none"
                          onClick={() => handleSort("createdAt")}
                        >
                          Joined {renderSortIcon("createdAt")}
                        </button>
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar src={user.profileImage} name={`${user.firstName} ${user.lastName}`} size="sm" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="flex mt-1 space-x-1">
                                {user.tags && user.tags.map((tag) => (
                                  <Badge key={tag} color="purple">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.city || "Unknown"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={user.status || "active"} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-2">{user.enrollments ? user.enrollments.length : 0}</span>
                            <div className="flex space-x-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Active"></span>
                              <span className="text-xs text-green-600" title="Active enrollments">
                                {user.enrollments ? user.enrollments.filter((e) => e.status === "active" || e.status === "enrolled").length : 0}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(user._id)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 mr-3">
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <StudentCard key={user._id} student={user} onViewDetails={handleViewDetails} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <FiInfo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchTerm || Object.values(filters).some((v) => v !== "all" && v.length !== 0)
              ? "Try adjusting your search or filters to find what you're looking for."
              : "There are no students in the system yet. Add your first student to get started."}
          </p>
          {searchTerm || Object.values(filters).some((v) => v !== "all" && v.length !== 0) ? (
            <button
              onClick={() => {
                setSearchTerm("")
                setFilters({
                  branch: "all",
                  status: "all",
                  enrollmentStatus: "all",
                  tags: [],
                })
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => alert("Add Student functionality would go here")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiUserPlus className="mr-2 h-4 w-4" />
              Add Student
            </button>
          )}
        </Card>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  )
}

export default AdminStudentsPage