import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

// --- Import Hero image ---
import heroImageFromFile from "../assets/class-hero-image.jpeg"
const heroBackgroundImage = heroImageFromFile

// --- Import City images ---
import bostonImage from "../assets/boston-skyline.jpeg"
import chicagoImage from "../assets/chicago-skyline.jpeg"
import laImage from "../assets/la-skyline.jpeg"
import newyorkImage from "../assets/newyork-skyline.jpeg"
import lasvegasImage from "../assets/lasvegas-skyline.jpeg"

// --- Import Gallery images ---
import actionShot1 from "../assets/class-action-shot1.jpeg"
import actionShot2 from "../assets/class-action-shot2.jpeg"
import actionShot3 from "../assets/class-action-shot3.jpeg"

// --- Import Site Logo ---
import siteLogo from "../assets/standstrong-logo-white.svg"

// --- Import Icons ---
import {
  FiUsers,
  FiShield,
  FiAward,
  FiZap,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiHeart,
  FiStar,
} from "react-icons/fi"

import { useClasses } from "../context/ClassContext"
import getFullImageUrl from "../utils/getFullImageUrl"

const cityImageMap = {
  Boston: bostonImage,
  "New York": newyorkImage,
  Chicago: chicagoImage,
  "Los Angeles": laImage,
  "Las Vegas": lasvegasImage,
}
const defaultCityImage = "/img/placeholder-city.jpg"
const galleryImages = [actionShot1, actionShot2, actionShot3]

const aboutFeatures = [
  {
    Icon: FiShield,
    title: "Classes for Everyone",
    text: "Tailored for all ages, genders, and experience levels.",
  },
  {
    Icon: FiAward,
    title: "Expert Instructors",
    text: "Certified professionals passionate about teaching effective techniques.",
  },
  {
    Icon: FiUsers,
    title: "Supportive Community",
    text: "Join a community committed to personal safety and growth.",
  },
  {
    Icon: FiZap,
    title: "Practical Skills",
    text: "Learn techniques that work in real-world situations, focusing on practicality.",
  },
]

// --- Content for "Our Story" ---
const ourStoryContent = {
  title: "Our Journey to Empowerment",
  paragraphs: [
    "At StandStrong our mission is to change the narrative for all groups affected by bigotry, bullying and hate.",
    "We don't seek to change the mindset of those who teach hate. Instead, we choose to set an example of living a positive life with diverse groups who support one another. Every community deserves to be represented by people who are proud of themselves and their heritage.",
    "Our programs do not teach students how to fight, but how to avoid becoming a victim. We teach self-defense skills to disengage and de-escalate tension and conflict in a calm and confident manner.",
    "To date, we have trained thousands of students to be safe, proud and confident in who they are and what they believe. These students are the future leaders of our communities. Their participation in StandStrong programs will provide them with newfound confidence and pride as they help change the narrative generation by generation.",
  ],
}

// Testimonials data
const testimonials = [
  {
    quote:
      "Stand Strong gave me the confidence to walk through life without fear. The skills I learned are practical and empowering.",
    name: "Sarah M.",
    role: "Program Graduate",
  },
  {
    quote:
      "As a parent, I've seen my teenager transform through these classes. They stand taller and more confidently now.",
    name: "David K.",
    role: "Parent",
  },
  {
    quote:
      "The instructors create a supportive environment where everyone can learn at their own pace. Truly exceptional.",
    name: "Michael R.",
    role: "Community Leader",
  },
]

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("about")
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const citiesSectionRef = useRef(null)
  const location = useLocation()

  // Handle scroll to cities section when hash changes
  useEffect(() => {
    if (location.hash === "#cities-section" && citiesSectionRef.current) {
      setTimeout(() => {
        citiesSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [location])

  // Function to scroll to cities section
  const scrollToCities = (e) => {
    e.preventDefault()
    if (citiesSectionRef.current) {
      citiesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  const heroItemVariants = (delay = 0) => ({
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, delay } },
  })

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  }

  const { cities } = useClasses()

  
return (
  <div>
    {/* === Hero Section === */}
    <section className="relative h-[70vh] sm:h-[65vh] md:h-[70vh]">
      {/* Background Image - Fixed centering for all devices */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroBackgroundImage}
          alt="Stand Strong Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      
      {/* Darker overlay */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-full px-4 sm:px-6">
        {/* Logo with motion */}
        <motion.div variants={heroItemVariants(0)} initial="hidden" animate="visible">
          <img 
            src={siteLogo} 
            alt="Stand Strong Logo" 
            className="h-14 sm:h-16 md:h-20 w-auto" 
          />
        </motion.div>
        
        {/* Text */}
        <motion.p
          className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl max-w-xl sm:max-w-2xl"
          variants={heroItemVariants(0.2)}
          initial="hidden"
          animate="visible"
        >
          Empowering through self-defense classes in your city
        </motion.p>
        
        {/* Button with larger bottom margin */}
        <motion.div
          variants={heroItemVariants(0.4)}
          initial="hidden"
          animate="visible"
          className="mt-8 md:mt-14"
        >
          <button
            onClick={scrollToCities}
            className="px-8 py-3 sm:px-10 sm:py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300 text-base sm:text-lg shadow-md hover:shadow-lg"
          >
            Find Classes
          </button>
        </motion.div>
      </div>
    </section>



{/* === Cities Grid with Enhanced Mobile Responsiveness === */}
<section id="cities-section" className="py-8 sm:py-12 md:py-16 bg-gray-50" ref={citiesSectionRef}>
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8 sm:mb-10 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Find Us In Your City</h2>
        <p className="mt-2 sm:mt-3 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-500">
          Select your location to see available classes.
        </p>
      </motion.div>
    </div>
    
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 text-center" 
      variants={containerVariants} 
      initial="hidden" 
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {cities.map((city) => (
        <motion.div key={city._id} variants={itemVariants} className="mb-2 sm:mb-0">
          <Link to={`/classes?city=${city.name}`} className="block group">
            <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={getFullImageUrl(city.imageUrl) || cityImageMap[city.name] || defaultCityImage}
                alt={`${city.name} skyline`}
                className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="eager"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultCityImage;
                }}
              />
            </div>
            <p className="mt-1 sm:mt-2 font-semibold text-sm sm:text-base md:text-lg text-gray-900">{city.name}</p>
            <div className="flex items-center justify-center mt-0.5 sm:mt-1">
              <span className="text-xs text-indigo-600 font-medium mr-1">Classes</span>
              <FiChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>

      {/* === Why Stand Strong Section with Tabs === */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#E3F2FD] to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#0D47A1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Headings */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 bg-[#64B5F6]/10 text-[#0D47A1] text-sm font-semibold rounded-full mb-3">
              WHY STAND STRONG
            </span>
            <h2 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-[#0D47A1]">
              Empowerment Through Skill
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Discover our mission and the story behind Stand Strong.
            </p>
          </motion.div>

          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-10">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-3 rounded-lg font-['Poppins'] font-semibold transition-all duration-300 text-base ${
                activeTab === "about"
                  ? "bg-[#0D47A1] text-white shadow-lg"
                  : "bg-white text-[#0D47A1] hover:bg-[#64B5F6]/10"
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab("story")}
              className={`px-6 py-3 rounded-lg font-['Poppins'] font-semibold transition-all duration-300 text-base ${
                activeTab === "story"
                  ? "bg-[#0D47A1] text-white shadow-lg"
                  : "bg-white text-[#0D47A1] hover:bg-[#64B5F6]/10"
              }`}
            >
              Our Story
            </button>
          </div>

          {/* Dynamic Content Area */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div key="about" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                  {/* "About Us" Content Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {aboutFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="bg-white shadow-lg p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#64B5F6]/10"
                        variants={itemVariants}
                      >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#64B5F6]/10 text-[#0D47A1] mb-4">
                          <feature.Icon className="h-8 w-8" />
                        </div>
                        <h4 className="font-['Poppins'] font-bold text-lg text-[#0D47A1]">{feature.title}</h4>
                        <p className="text-gray-600 mt-2">{feature.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "story" && (
                <motion.div
                  key="story"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md"
                >
                  {/* "Our Story" Content */}
                  <h3 className="text-2xl font-['Poppins'] font-bold text-center text-[#0D47A1] mb-6">
                    {ourStoryContent.title}
                  </h3>
                  {ourStoryContent.paragraphs.map((para, index) => (
                    <motion.p
                      key={index}
                      className="mb-4 text-gray-600 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* === Testimonials Section === */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 bg-[#D72638]/10 text-[#D72638] text-sm font-semibold rounded-full mb-3">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-[#0D47A1]">
              Real People. Real Strength.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              See how Stand Strong has helped communities nationwide.
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-3xl mx-auto mb-16">
            <AnimatePresence mode="wait">
              {testimonials.map(
                (testimonial, index) =>
                  activeTestimonial === index && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white p-8 rounded-xl shadow-lg border border-[#64B5F6]/20 text-center"
                    >
                      <div className="mb-6">
                        <FiStar className="inline-block text-[#D72638] h-8 w-8" />
                      </div>
                      <p className="text-xl italic text-gray-700 mb-6">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-['Poppins'] font-semibold text-[#0D47A1]">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>

            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? "bg-[#0D47A1] w-6" : "bg-[#64B5F6]/30"
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Gallery Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {galleryImages.map((imgSrc, index) => (
              <motion.div
                key={index}
                className="overflow-hidden rounded-xl shadow-lg relative group"
                variants={itemVariants}
              >
                <img
                  src={imgSrc || "/placeholder.svg"}
                  alt={`Class action shot ${index + 1}`}
                  className="object-cover h-64 w-full transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D47A1]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-['Poppins'] font-semibold">Stand Strong in Action</p>
                    <p className="text-sm">Building confidence through practice</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === Call to Action Banner === */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#E3F2FD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl shadow-xl p-10 md:p-12 text-center relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-['Poppins'] font-bold mb-4">Ready to Stand Strong?</h2>
              <p className="text-xl max-w-2xl mx-auto text-blue-100">
                Join a self-defense class today and empower yourself with confidence and skills.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={scrollToCities}
                  className="px-8 py-3.5 bg-white text-[#0D47A1] font-['Poppins'] font-semibold rounded-lg shadow-lg hover:bg-[#64B5F6] hover:text-white transition-all duration-300 w-full sm:w-auto transform hover:scale-105"
                >
                  Browse Classes
                </button>
                <Link
                  to="/register"
                  className="px-8 py-3.5 border-2 border-white text-white font-['Poppins'] font-semibold rounded-lg hover:bg-white hover:text-[#0D47A1] transition-all duration-300 w-full sm:w-auto transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>

              {/* Decorative Icon */}
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center text-blue-200">
                  <FiHeart className="h-5 w-5 mr-2" />
                  <span>Join our community today</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
