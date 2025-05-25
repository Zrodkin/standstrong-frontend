import { Link } from "react-router-dom"
import standStrongLogo from "../assets/standstrong-logo.svg"

const AuthLayout = ({ children, title = "Authentication", subtitle }) => {
  return (
    // Added px-4 for mobile padding
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-gray-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section - removed sm: prefix from mx-auto to center on all screens */}
      <div className="mx-auto w-full sm:max-w-md text-center">
        {/* Logo - adjusted for better mobile display */}
        <Link to="/" className="flex justify-center" aria-label="Home">
          <img
            className="h-20 sm:h-24 w-auto mx-auto" // Slightly smaller on mobile
            src={standStrongLogo || "/placeholder.svg"}
            alt="Stand Strong Logo"
          />
        </Link>

        {/* Title - adjusted font size for mobile */}
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h2>

        {/* Optional Subtitle - improved mobile readability */}
        {subtitle && <p className="mt-2 text-sm sm:text-sm text-gray-600 max-w-xs sm:max-w-sm mx-auto">{subtitle}</p>}
      </div>

      {/* Form Container - adjusted spacing for mobile */}
      <div className="mt-6 sm:mt-10 mx-auto w-full sm:max-w-md">
        {/* Added more padding on mobile, reduced vertical padding slightly */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-lg rounded-lg">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
