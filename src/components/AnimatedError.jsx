"use client"

import { motion } from "framer-motion"
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi"
import { Link } from "react-router-dom"

export const AnimatedError = ({ message, onRetry }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-red-50 to-white border border-red-200 p-8 rounded-xl flex flex-col items-center text-center max-w-md mx-auto my-10 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{
          scale: { duration: 0.5 },
          rotate: { delay: 0.5, duration: 0.5 },
        }}
      >
        <FiAlertCircle className="h-16 w-16 text-red-500 mb-4" />
      </motion.div>

      <motion.p
        className="text-xl font-semibold text-red-800 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {message || "An error occurred."}
      </motion.p>

      <motion.p
        className="text-sm text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        We couldn't load the class details. Please check your connection or try again.
      </motion.p>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium flex items-center shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.3,
            type: "spring",
            stiffness: 500,
            damping: 15,
          }}
        >
          <FiArrowLeft className="mr-2 h-4 w-4" /> Try Again
        </motion.button>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}>
        <Link to="/classes" className="mt-4 text-sm text-primary-600 hover:underline inline-block">
          Back to Classes
        </Link>
      </motion.div>
    </motion.div>
  )
}
