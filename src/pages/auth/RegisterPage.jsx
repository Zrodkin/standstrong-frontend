"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { getAllCityRecords } from "../../services/cityService"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    phone: "",
    city: "", // Added city field
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cities, setCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { registerUser } = useAuth()
  const navigate = useNavigate()

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await getAllCityRecords()
        setCities(citiesData)
      } catch (err) {
        console.error("Error fetching cities:", err)
        setError("Failed to load cities. Please try again later.")
      } finally {
        setCitiesLoading(false)
      }
    }

    fetchCities()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic Client-Side Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.age ||
      !formData.gender ||
      !formData.city
    ) {
      // Added city validation
      setError("Please fill in all required fields.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    const ageNum = Number.parseInt(formData.age)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError("Please enter a valid age (must be 13 or older).")
      return
    }

    setLoading(true)

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData
      // Ensure age is sent as a number
      userData.age = Number.parseInt(userData.age)

      await registerUser(userData)
      navigate("/dashboard") // Redirect after successful registration
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
      console.error("Registration Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Tailwind classes
  const formLabelClass = "block text-sm font-medium text-gray-700 mb-1"
  const formInputClass =
    "appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
  const formSelectClass = formInputClass
  const passwordInputWrapperClass = "relative"
  const passwordToggleClass = "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
  const buttonClass =
    "w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
  const linkClass = "font-medium text-primary-600 hover:text-primary-500"

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
          {error}
        </div>
      )}

      {/* First Name / Last Name Row */}
      <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={formLabelClass}>
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className={formInputClass}
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={formLabelClass}>
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className={formInputClass}
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={formLabelClass}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={formInputClass}
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Password / Confirm Password Row */}
      <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className={formLabelClass}>
            Password
          </label>
          <div className={passwordInputWrapperClass}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength="6"
              className={formInputClass}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className={passwordToggleClass}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className={formLabelClass}>
            Confirm Password
          </label>
          <div className={passwordInputWrapperClass}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength="6"
              className={formInputClass}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className={passwordToggleClass}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Age / Gender Row */}
      <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="age" className={formLabelClass}>
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            required
            min="13"
            max="120"
            className={formInputClass}
            value={formData.age}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="gender" className={formLabelClass}>
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            required
            className={formSelectClass}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* City / Phone Row */}
      <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={formLabelClass}>
            Branch Location
          </label>
          <select
            id="city"
            name="city"
            required
            className={formSelectClass}
            value={formData.city}
            onChange={handleChange}
            disabled={citiesLoading}
          >
            <option value="" disabled>
              {citiesLoading ? "Loading cities..." : "Select branch location"}
            </option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="phone" className={formLabelClass}>
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={formInputClass}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-1">
        <button type="submit" className={buttonClass} disabled={loading || citiesLoading}>
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </div>

      {/* Link to Login Page */}
      <div className="text-base sm:text-sm text-center pt-1">
        <span className="text-gray-500">Already have an account? </span>
        <Link to="/login" className={linkClass}>
          Sign in
        </Link>
      </div>
    </form>
  )
}

export default RegisterPage
