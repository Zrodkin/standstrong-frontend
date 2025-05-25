"use client"

import { motion } from "framer-motion"

export const AnimatedLoading = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const circleVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const pulseAnimation = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="relative mb-8" variants={itemVariants}>
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
          variants={circleVariants}
        />
        <motion.div
          className="absolute inset-0 w-20 h-20 rounded-full bg-blue-500 bg-opacity-50"
          variants={pulseAnimation}
          animate="animate"
        />
      </motion.div>

      <motion.p
        className="text-2xl font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        Loading Class Details
      </motion.p>

      <motion.p className="text-sm text-gray-500 mt-2" variants={itemVariants}>
        Please wait a moment...
      </motion.p>
    </motion.div>
  )
}
