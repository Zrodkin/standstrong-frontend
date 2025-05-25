import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

const LoginPage = () => {
  // --- State variables and hooks ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await loginUser(formData.email, formData.password /*, rememberMe */)
      navigate("/dashboard")
    } catch (err) {
      const message = err.response?.data?.message || "Failed to login. Please check your credentials."
      setError(message)
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- Tailwind CSS Classes with improved mobile responsiveness ---
  const formLabelClass = "block text-sm font-medium text-gray-700 mb-1"
  const formInputClass =
    "appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
  const passwordInputWrapperClass = "relative"
  const passwordToggleClass = "absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
  const buttonClass =
    "w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
  const linkClass = "font-medium text-primary-600 hover:text-primary-500"

  // --- Return ONLY the form ---
  // The AuthLayout provides the background, centering, card, logo, and title
  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit} noValidate>
      {error && (
        <div
          className="p-3 sm:p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300"
          role="alert"
          aria-live="assertive"
        >
          <span className="font-medium">Login failed:</span> {error}
        </div>
      )}

      {/* Email Input */}
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
          placeholder="you@example.com"
        />
      </div>

      {/* Password Input with Toggle */}
      <div>
        <label htmlFor="password" className={formLabelClass}>
          Password
        </label>
        <div className={passwordInputWrapperClass}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={formInputClass}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <button
            type="button"
            className={passwordToggleClass}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
            ) : (
              <EyeIcon className="h-6 w-6 sm:h-5 sm:w-5 text-gray-500 hover:text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password Row - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="rememberMeInput"
            type="checkbox"
            checked={rememberMe}
            onChange={handleRememberChange}
            className="h-5 w-5 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-base sm:text-sm text-gray-900">
            Remember me
          </label>
        </div>
        <div className="text-base sm:text-sm">
          <Link to="/forgot-password" className={linkClass}>
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-1">
        <button type="submit" className={buttonClass} disabled={loading || !formData.email || !formData.password}>
          {loading ? (
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
          ) : (
            "Sign in"
          )}
        </button>
      </div>

      {/* Link to Register Page */}
      <div className="text-base sm:text-sm text-center pt-1">
        <span className="text-gray-600">Don't have an account? </span>
        <Link to="/register" className={linkClass}>
          Sign up
        </Link>
      </div>
    </form>
  )
}

export default LoginPage
