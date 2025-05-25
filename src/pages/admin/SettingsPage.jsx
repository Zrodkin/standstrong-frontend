"use client"

// src/pages/admin/AdminSettingsPage.jsx
import { useState, useEffect } from "react"
import {
  FiSave,
  FiLoader,
  FiSettings,
  FiMail,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiInfo,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiServer,
  FiSliders,
  FiFileText,
  FiRefreshCw,
  FiHelpCircle,
} from "react-icons/fi"

// Mock service functions - replace with actual API calls
const getSettings = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    // General Settings
    siteName: "StandStrong",
    contactEmail: "admin@standstrong.org",
    supportPhone: "(555) 123-4567",
    timezone: "America/New_York",

    // Email Settings
    emailSender: "noreply@standstrong.org",
    emailReplyTo: "support@standstrong.org",
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "smtp_user",
    smtpPassword: "••••••••••••",

    // Notification Settings
    notifyOnRegistration: true,
    notifyOnCancellation: true,
    notifyAdminOnRegistration: true,
    notifyBeforeClassStarts: true,
    daysBeforeClassToNotify: 2,

    // User Settings
    allowSelfRegistration: true,
    requireEmailVerification: true,
    autoApproveUsers: false,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,

    // Email Templates
    emailTemplates: {
      welcome: {
        subject: "Welcome to StandStrong",
        body: "Dear {{name}},\n\nWelcome to StandStrong! We're excited to have you join our community.\n\nBest regards,\nThe StandStrong Team",
      },
      classRegistration: {
        subject: "Class Registration Confirmation",
        body: "Dear {{name}},\n\nThank you for registering for {{className}}. The class will be held on {{classDate}} at {{classTime}}.\n\nBest regards,\nThe StandStrong Team",
      },
      classReminder: {
        subject: "Upcoming Class Reminder",
        body: "Dear {{name}},\n\nThis is a reminder that your class {{className}} is scheduled for {{classDate}} at {{classTime}}.\n\nBest regards,\nThe StandStrong Team",
      },
      passwordReset: {
        subject: "Password Reset Request",
        body: "Dear {{name}},\n\nWe received a request to reset your password. Please click the link below to reset your password:\n\n{{resetLink}}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nThe StandStrong Team",
      },
    },
  }
}

const updateSettings = async (settings) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1200))
  return settings
}

const sendTestEmail = async (template, email) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { success: true }
}

// Reusable components
const Alert = ({ type, message, onDismiss }) => {
  const types = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <FiAlertCircle className="h-5 w-5 text-red-500" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <FiInfo className="h-5 w-5 text-blue-500" />,
    },
  }

  const style = types[type] || types.info

  return (
    <div className={`mb-4 p-4 ${style.bg} ${style.border} ${style.text} border rounded-lg flex items-start`}>
      <div className="flex-shrink-0 mr-3">{style.icon}</div>
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

const Card = ({ title, description, children }) => (
  <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 mb-6">
    {(title || description) && (
      <div className="mb-4 pb-4 border-b border-gray-100">
        {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    )}
    {children}
  </div>
)

const FormField = ({ label, htmlFor, required, description, error, children }) => (
  <div className="mb-4">
    <div className="flex justify-between">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
    {children}
    {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
  </div>
)

const TabButton = ({ active, icon, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active ? "bg-primary-50 text-primary-700 border-primary-100 border" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="ml-2">{children}</span>
  </button>
)

const PasswordInput = ({ id, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  )
}

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailTemplate, setTestEmailTemplate] = useState("welcome")
  const [testEmailResult, setTestEmailResult] = useState(null)
  const [activeTemplate, setActiveTemplate] = useState("welcome")

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      setError("")
      try {
        const currentSettings = await getSettings()
        setSettings(currentSettings)
      } catch (err) {
        setError("Failed to load settings. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Handle nested properties (e.g., emailTemplates.welcome.subject)
    if (name.includes(".")) {
      const parts = name.split(".")
      setSettings((prev) => {
        const newSettings = { ...prev }
        let current = newSettings

        // Navigate to the nested object
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]]
        }

        // Set the value
        current[parts[parts.length - 1]] = type === "checkbox" ? checked : value
        return newSettings
      })
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    // Clear messages when user makes changes
    setSuccess("")
    setError("")
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const updatedSettings = await updateSettings(settings)
      setSettings(updatedSettings)
      setSuccess("Settings saved successfully!")

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess("")
      }, 5000)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sending test email
  const handleSendTestEmail = async (e) => {
    e.preventDefault()

    if (!testEmailAddress) {
      setTestEmailResult({ type: "error", message: "Please enter an email address." })
      return
    }

    setSendingTestEmail(true)
    setTestEmailResult(null)

    try {
      const result = await sendTestEmail(testEmailTemplate, testEmailAddress)
      setTestEmailResult({
        type: "success",
        message: `Test email sent successfully to ${testEmailAddress}!`,
      })
    } catch (err) {
      setTestEmailResult({
        type: "error",
        message: "Failed to send test email. Please check your email settings.",
      })
      console.error(err)
    } finally {
      setSendingTestEmail(false)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 md:mb-0">
          <FiSettings className="mr-3 h-6 w-6 text-primary-600" /> Application Settings
        </h1>

        <button
          type="button"
          form="settings-form"
          onClick={handleSubmit}
          className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="-ml-1 mr-2 h-5 w-5" />
              Save All Settings
            </>
          )}
        </button>
      </div>

      {/* Display Global Success/Error Messages */}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess("")} />}
      {error && <Alert type="error" message={error} onDismiss={() => setError("")} />}

      {/* Tabs Navigation */}
      <div className="mb-6 bg-white p-4 shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
        <div className="flex space-x-2">
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            icon={<FiGlobe className="h-4 w-4" />}
          >
            General
          </TabButton>
          <TabButton
            active={activeTab === "email"}
            onClick={() => setActiveTab("email")}
            icon={<FiMail className="h-4 w-4" />}
          >
            Email Settings
          </TabButton>
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={<FiSliders className="h-4 w-4" />}
          >
            Notifications
          </TabButton>
          <TabButton
            active={activeTab === "templates"}
            onClick={() => setActiveTab("templates")}
            icon={<FiFileText className="h-4 w-4" />}
          >
            Email Templates
          </TabButton>
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<FiUsers className="h-4 w-4" />}
          >
            User Settings
          </TabButton>
          <TabButton
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
            icon={<FiServer className="h-4 w-4" />}
          >
            System
          </TabButton>
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSubmit}>
        {/* General Settings Tab */}
        {activeTab === "general" && (
          <div>
            <Card title="Site Information" description="Basic information about your organization and website.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Site Name" htmlFor="siteName" required>
                  <input
                    id="siteName"
                    name="siteName"
                    type="text"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </FormField>

                <FormField label="Contact Email" htmlFor="contactEmail" required>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </FormField>

                <FormField label="Support Phone" htmlFor="supportPhone">
                  <input
                    id="supportPhone"
                    name="supportPhone"
                    type="tel"
                    value={settings.supportPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </FormField>

                <FormField label="Timezone" htmlFor="timezone" required>
                  <select
                    id="timezone"
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                </FormField>
              </div>
            </Card>

            <Alert
              type="info"
              message={
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FiHelpCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Need help with settings?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        These settings control the basic information about your organization. The site name and contact
                        email are used throughout the application and in emails sent to users.
                      </p>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === "email" && (
          <div>
            <Card
              title="Email Configuration"
              description="Configure the email server settings used to send emails from the application."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Email Sender Address" htmlFor="emailSender" required>
                  <input
                    id="emailSender"
                    name="emailSender"
                    type="email"
                    value={settings.emailSender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </FormField>

                <FormField label="Reply-To Email Address" htmlFor="emailReplyTo">
                  <input
                    id="emailReplyTo"
                    name="emailReplyTo"
                    type="email"
                    value={settings.emailReplyTo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </FormField>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">SMTP Server Settings</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="SMTP Host" htmlFor="smtpHost" required>
                    <input
                      id="smtpHost"
                      name="smtpHost"
                      type="text"
                      value={settings.smtpHost}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </FormField>

                  <FormField label="SMTP Port" htmlFor="smtpPort" required>
                    <input
                      id="smtpPort"
                      name="smtpPort"
                      type="text"
                      value={settings.smtpPort}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </FormField>

                  <FormField label="SMTP Username" htmlFor="smtpUsername">
                    <input
                      id="smtpUsername"
                      name="smtpUsername"
                      type="text"
                      value={settings.smtpUsername}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </FormField>

                  <FormField label="SMTP Password" htmlFor="smtpPassword">
                    <PasswordInput
                      id="smtpPassword"
                      value={settings.smtpPassword}
                      onChange={handleChange}
                      placeholder="Enter SMTP password"
                    />
                  </FormField>
                </div>
              </div>
            </Card>

            <Card title="Test Email Configuration">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Send a test email to verify your email configuration is working correctly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Email Template" htmlFor="testEmailTemplate">
                    <select
                      id="testEmailTemplate"
                      value={testEmailTemplate}
                      onChange={(e) => setTestEmailTemplate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="welcome">Welcome Email</option>
                      <option value="classRegistration">Class Registration</option>
                      <option value="classReminder">Class Reminder</option>
                      <option value="passwordReset">Password Reset</option>
                    </select>
                  </FormField>

                  <FormField label="Recipient Email" htmlFor="testEmailAddress">
                    <div className="flex">
                      <input
                        id="testEmailAddress"
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="Enter email address"
                        className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={sendingTestEmail}
                        className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {sendingTestEmail ? <FiLoader className="animate-spin h-4 w-4" /> : "Send"}
                      </button>
                    </div>
                  </FormField>
                </div>

                {testEmailResult && (
                  <div className="mt-4">
                    <Alert
                      type={testEmailResult.type}
                      message={testEmailResult.message}
                      onDismiss={() => setTestEmailResult(null)}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <Card
              title="Email Notification Settings"
              description="Configure when emails are sent to users and administrators."
            >
              <div className="space-y-4">
                <FormField label="Registration Notifications" htmlFor="notifyOnRegistration">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="notifyOnRegistration"
                        name="notifyOnRegistration"
                        type="checkbox"
                        checked={settings.notifyOnRegistration}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifyOnRegistration" className="font-medium text-gray-700">
                        Send confirmation email to users when they register for a class
                      </label>
                    </div>
                  </div>
                </FormField>

                <FormField label="Cancellation Notifications" htmlFor="notifyOnCancellation">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="notifyOnCancellation"
                        name="notifyOnCancellation"
                        type="checkbox"
                        checked={settings.notifyOnCancellation}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifyOnCancellation" className="font-medium text-gray-700">
                        Send email to users when their registration is cancelled
                      </label>
                    </div>
                  </div>
                </FormField>

                <FormField label="Admin Notifications" htmlFor="notifyAdminOnRegistration">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="notifyAdminOnRegistration"
                        name="notifyAdminOnRegistration"
                        type="checkbox"
                        checked={settings.notifyAdminOnRegistration}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifyAdminOnRegistration" className="font-medium text-gray-700">
                        Notify administrators when a user registers for a class
                      </label>
                    </div>
                  </div>
                </FormField>

                <FormField label="Class Reminders" htmlFor="notifyBeforeClassStarts">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="notifyBeforeClassStarts"
                        name="notifyBeforeClassStarts"
                        type="checkbox"
                        checked={settings.notifyBeforeClassStarts}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifyBeforeClassStarts" className="font-medium text-gray-700">
                        Send reminder emails before class starts
                      </label>
                    </div>
                  </div>
                </FormField>

                {settings.notifyBeforeClassStarts && (
                  <div className="ml-7 mt-3">
                    <FormField label="Days Before Class" htmlFor="daysBeforeClassToNotify">
                      <select
                        id="daysBeforeClassToNotify"
                        name="daysBeforeClassToNotify"
                        value={settings.daysBeforeClassToNotify}
                        onChange={handleChange}
                        className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="1">1 day before</option>
                        <option value="2">2 days before</option>
                        <option value="3">3 days before</option>
                        <option value="5">5 days before</option>
                        <option value="7">1 week before</option>
                      </select>
                    </FormField>
                  </div>
                )}
              </div>
            </Card>

            <Alert
              type="info"
              message="Email notifications help keep your users informed about their class registrations and upcoming events. Configure which notifications are sent and when to provide the best experience for your users."
            />
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === "templates" && (
          <div>
            <Card title="Email Templates" description="Customize the content of emails sent to users.">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Template Selection</p>
                  <nav className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveTemplate("welcome")}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTemplate === "welcome"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Welcome Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTemplate("classRegistration")}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTemplate === "classRegistration"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Class Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTemplate("classReminder")}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTemplate === "classReminder"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Class Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTemplate("passwordReset")}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTemplate === "passwordReset"
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Password Reset
                    </button>
                  </nav>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Available Variables:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        <code>{{ name }}</code> - User's full name
                      </li>
                      <li>
                        <code>{{ firstName }}</code> - User's first name
                      </li>
                      <li>
                        <code>{{ className }}</code> - Name of the class
                      </li>
                      <li>
                        <code>{{ classDate }}</code> - Date of the class
                      </li>
                      <li>
                        <code>{{ classTime }}</code> - Time of the class
                      </li>
                      <li>
                        <code>{{ location }}</code> - Class location
                      </li>
                      {activeTemplate === "passwordReset" && (
                        <li>
                          <code>{{ resetLink }}</code> - Password reset link
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <FormField label="Email Subject" htmlFor={`emailTemplates.${activeTemplate}.subject`}>
                      <input
                        id={`emailTemplates.${activeTemplate}.subject`}
                        name={`emailTemplates.${activeTemplate}.subject`}
                        type="text"
                        value={settings.emailTemplates[activeTemplate].subject}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </FormField>

                    <FormField label="Email Body" htmlFor={`emailTemplates.${activeTemplate}.body`}>
                      <textarea
                        id={`emailTemplates.${activeTemplate}.body`}
                        name={`emailTemplates.${activeTemplate}.body`}
                        rows="12"
                        value={settings.emailTemplates[activeTemplate].body}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                      />
                    </FormField>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => {
                          setTestEmailTemplate(activeTemplate)
                          setActiveTab("email")
                        }}
                      >
                        <FiMail className="-ml-0.5 mr-2 h-4 w-4" /> Test This Template
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => {
                          // Reset to default template
                          const defaultTemplates = {
                            welcome: {
                              subject: "Welcome to StandStrong",
                              body: "Dear {{name}},\n\nWelcome to StandStrong! We're excited to have you join our community.\n\nBest regards,\nThe StandStrong Team",
                            },
                            classRegistration: {
                              subject: "Class Registration Confirmation",
                              body: "Dear {{name}},\n\nThank you for registering for {{className}}. The class will be held on {{classDate}} at {{classTime}}.\n\nBest regards,\nThe StandStrong Team",
                            },
                            classReminder: {
                              subject: "Upcoming Class Reminder",
                              body: "Dear {{name}},\n\nThis is a reminder that your class {{className}} is scheduled for {{classDate}} at {{classTime}}.\n\nBest regards,\nThe StandStrong Team",
                            },
                            passwordReset: {
                              subject: "Password Reset Request",
                              body: "Dear {{name}},\n\nWe received a request to reset your password. Please click the link below to reset your password:\n\n{{resetLink}}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nThe StandStrong Team",
                            },
                          }

                          setSettings({
                            ...settings,
                            emailTemplates: {
                              ...settings.emailTemplates,
                              [activeTemplate]: defaultTemplates[activeTemplate],
                            },
                          })
                        }}
                      >
                        <FiRefreshCw className="-ml-0.5 mr-2 h-4 w-4" /> Reset to Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* User Settings Tab */}
        {activeTab === "users" && (
          <div>
            <Card title="User Registration Settings" description="Configure how users register and access the system.">
              <div className="space-y-4">
                <FormField label="User Registration" htmlFor="allowSelfRegistration">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="allowSelfRegistration"
                        name="allowSelfRegistration"
                        type="checkbox"
                        checked={settings.allowSelfRegistration}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowSelfRegistration" className="font-medium text-gray-700">
                        Allow users to register accounts themselves
                      </label>
                      <p className="text-gray-500">If disabled, administrators must create all user accounts.</p>
                    </div>
                  </div>
                </FormField>

                <FormField label="Email Verification" htmlFor="requireEmailVerification">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="requireEmailVerification"
                        name="requireEmailVerification"
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requireEmailVerification" className="font-medium text-gray-700">
                        Require email verification before users can log in
                      </label>
                      <p className="text-gray-500">Users will receive a verification email after registration.</p>
                    </div>
                  </div>
                </FormField>

                <FormField label="Auto-Approve Users" htmlFor="autoApproveUsers">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="autoApproveUsers"
                        name="autoApproveUsers"
                        type="checkbox"
                        checked={settings.autoApproveUsers}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="autoApproveUsers" className="font-medium text-gray-700">
                        Automatically approve new user registrations
                      </label>
                      <p className="text-gray-500">
                        If disabled, administrators must approve new users before they can log in.
                      </p>
                    </div>
                  </div>
                </FormField>
              </div>
            </Card>

            <Card title="Password Policy" description="Configure password requirements for user accounts.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Minimum Password Length" htmlFor="passwordMinLength">
                  <input
                    id="passwordMinLength"
                    name="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </FormField>

                <FormField label="Password Complexity" htmlFor="passwordRequireSpecialChar">
                  <div className="flex items-start mt-1">
                    <div className="flex items-center h-5">
                      <input
                        id="passwordRequireSpecialChar"
                        name="passwordRequireSpecialChar"
                        type="checkbox"
                        checked={settings.passwordRequireSpecialChar}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="passwordRequireSpecialChar" className="font-medium text-gray-700">
                        Require at least one special character
                      </label>
                      <p className="text-gray-500">
                        Passwords must contain at least one special character (e.g., !@#$%^&*).
                      </p>
                    </div>
                  </div>
                </FormField>
              </div>
            </Card>
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div>
            <Card title="System Information" description="View information about the system and application.">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application Version</p>
                    <p className="mt-1 text-sm text-gray-900">1.0.0</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Environment</p>
                    <p className="mt-1 text-sm text-gray-900">Production</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Database Status</p>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Connected
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="System Maintenance" description="Perform system maintenance tasks.">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-3 sm:mb-0"
                  >
                    <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    Clear Cache
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiServer className="-ml-1 mr-2 h-4 w-4" />
                    Test Database Connection
                  </button>
                </div>
              </div>
            </Card>

            <Alert
              type="info"
              message="System settings should only be modified by administrators with technical knowledge. Incorrect settings may cause the application to malfunction."
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default AdminSettingsPage
