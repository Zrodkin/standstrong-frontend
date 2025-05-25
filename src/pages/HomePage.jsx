import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
//import CityImage from '../components/CityImage';
//import { preloadCityImages } from '../utils/imagePreloader';
//import { observeElement, getVisibleElementIds } from '../utils/ImageObserver';

// --- Import Hero image ---
import heroImageFromFile from "../assets/class-hero-image.jpeg"
const heroBackgroundImage = heroImageFromFile

// --- Import City images ---
import { staticCities } from '../constants/cityImages';

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
  FiCalendar,
  FiArrowRight,
  FiCheck,
  FiPlay,
  FiMessageCircle,
} from "react-icons/fi"

import { FaStarOfDavid } from "react-icons/fa"

//import { useClasses } from "../context/ClassContext"
//import getFullImageUrl from "../utils/getFullImageUrl"


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
    avatar: "/diverse-group.png",
  },
  {
    quote:
      "As a parent, I've seen my teenager transform through these classes. They stand taller and more confidently now.",
    name: "David K.",
    role: "Parent",
    avatar: "/diverse-group.png",
  },
  {
    quote:
      "The instructors create a supportive environment where everyone can learn at their own pace. Truly exceptional.",
    name: "Michael R.",
    role: "Community Leader",
    avatar: "/diverse-group.png",
  },
]

// Stats data
const stats = [
  { value: "10K+", label: "Students Trained" },
  { value: "100+", label: "Classes Nationwide" },
  { value: "95%", label: "Student Satisfaction" },
  { value: "100%", label: "Confidence Boost" },
]

// Simple CitiesGrid component using static images
const CitiesGrid = () => {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {staticCities.map((city, index) => (
        <motion.div
          key={city.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
          className="mb-2 sm:mb-0"
        >
          <Link to={`/classes?city=${city.name}`} className="block group">
            <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={city.image}
                alt={`${city.name} skyline`}
                className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p className="mt-1 sm:mt-2 font-semibold text-sm sm:text-base md:text-lg text-gray-900">
              {city.name}
            </p>
            <div className="flex items-center justify-center mt-0.5 sm:mt-1">
              <span className="text-xs text-indigo-600 font-medium mr-1">Classes</span>
              <FiChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("about")
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const citiesSectionRef = useRef(null)
  const cityContainerRef = useRef(null) // New ref for the cities container
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

  //const { cities } = useClasses();

  // Initial preload of all city images when cities are loaded
  //useEffect(() => {
   // if (cities.length > 0) {
    //  preloadCityImages(cities);
   // }
  //}, [cities]);

  return (
    <div>
      {/* === Hero Section === */}
      <section className="relative h-[70vh] sm:h-[65vh] md:h-[70vh]">
        {/* Background Image - Fixed centering for all devices */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroBackgroundImage || "/placeholder.svg"}
            alt="Stand Strong Hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* Darker overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-full px-4 sm:px-6">
          {/* Visibly hidden h1 for SEO */}
          <h1 className="sr-only">
            Stand Strong – Empowering Jewish communities through self-defense and leadership
          </h1>
          {/* Logo with motion */}
          <motion.div variants={heroItemVariants(0)} initial="hidden" animate="visible">
            <img src={siteLogo || "/placeholder.svg"} alt="Stand Strong Logo" className="h-14 sm:h-16 md:h-20 w-auto" />
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
          <motion.div variants={heroItemVariants(0.4)} initial="hidden" animate="visible" className="mt-8 md:mt-14">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={cityContainerRef}>
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Find Us In Your City</h2>
              <p className="mt-2 sm:mt-3 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-500">
                Select your location to see available classes.
              </p>
            </motion.div>
          </div>

          {/* Replace the old cities grid with the new optimized CitiesGrid component */}
         <CitiesGrid />
        </div>
      </section>

      {/* The rest of the components remain unchanged */}
      {/* === Stats Section (NEW) === */}
      <section
        className="py-16 text-white"
        style={{
          background:
            "linear-gradient(90deg, rgba(21, 111, 176, 1) 0%, rgba(97, 174, 199, 1) 30%, rgba(97, 174, 199, 1) 70%, rgba(21, 111, 176, 1) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-blue-100 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Minimal transition space */}
      <div className="h-2 bg-[#E3F2FD]"></div>

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
              className={`px-6 py-3 rounded-lg font-['Poppins'] font-semibold transition-all duration-300 text-base ${activeTab === "about"
                  ? "bg-[#0D47A1] text-white shadow-lg"
                  : "bg-white text-[#0D47A1] hover:bg-[#64B5F6]/10"
                }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab("story")}
              className={`px-6 py-3 rounded-lg font-['Poppins'] font-semibold transition-all duration-300 text-base ${activeTab === "story"
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
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* "About Us" Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {aboutFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="bg-white shadow-lg p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-[#64B5F6]/10"
                        whileHover={{
                          y: -10,
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#64B5F6]/10 text-[#0D47A1] mb-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <feature.Icon className="h-8 w-8" />
                        </motion.div>
                        <h4 className="font-['Poppins'] font-bold text-lg text-[#0D47A1]">{feature.title}</h4>
                        <p className="text-gray-600 mt-2">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "story" && (
                <motion.div
                  key="story"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Left Column - Story Content */}
                    <motion.div
                      className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className="text-2xl md:text-3xl font-['Poppins'] font-bold text-[#0D47A1] mb-6">
                        {ourStoryContent.title}
                      </h3>

                      {ourStoryContent.paragraphs.map((para, index) => (
                        <motion.div
                          key={index}
                          className="mb-4 flex items-start"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          <div className="mt-2.5 mr-3 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D72638]"></div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{para}</p>
                        </motion.div>
                      ))}

                      <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                      >
                        <Link
                          to="/about"
                          className="inline-flex items-center text-[#0D47A1] font-medium hover:text-[#1565C0] transition-colors"
                        >
                          Learn more about our mission
                          <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </motion.div>

                    {/* Right Column - Image */}
                    <motion.div
                      className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <img
                        src={actionShot1 || "/placeholder.svg"}
                        alt="Stand Strong Class"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* === Gallery Section (REDESIGNED) === */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#D72638]/10 text-[#D72638] text-sm font-semibold rounded-full mb-4">
              OUR CLASSES
            </span>
            <h2 className="text-3xl md:text-5xl font-['Poppins'] font-bold text-[#0D47A1] tracking-tight">
              See Us in Action
            </h2>
            <div className="w-24 h-1 bg-[#D72638] mx-auto mt-6 mb-6 rounded-full"></div>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Experience the energy and focus of our self-defense training sessions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {galleryImages.map((imgSrc, index) => (
              <motion.div
                key={index}
                className="group relative rounded-2xl overflow-hidden shadow-lg h-80"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <img
                  src={imgSrc || "/placeholder.svg"}
                  alt={`Class action shot ${index + 1}`}
                  className="object-cover h-full w-full transform group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay with play button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlay className="h-8 w-8 text-white" />
                  </motion.div>

                  <h4 className="text-white font-bold text-xl mb-1">Stand Strong in Action</h4>
                  <p className="text-gray-200 text-sm">Building confidence through practice</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/classes"
              className="inline-flex items-center px-6 py-3 bg-[#0D47A1] text-white font-medium rounded-lg hover:bg-[#1565C0] transition-colors shadow-md hover:shadow-lg"
            >
              <FiCalendar className="mr-2 h-5 w-5" />
              View All Classes
            </Link>
          </motion.div>
        </div>
      </section>

      {/* === Testimonials Section (REDESIGNED) === */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#0D47A1 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#D72638]/10 text-[#D72638] text-sm font-semibold rounded-full mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-5xl font-['Poppins'] font-bold text-[#0D47A1] tracking-tight">
              Real People. Real Strength.
            </h2>
            <div className="w-24 h-1 bg-[#D72638] mx-auto mt-6 mb-6 rounded-full"></div>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              See how Stand Strong has helped communities nationwide.
            </p>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#64B5F6]">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#0D47A1] text-white p-1 rounded-full">
                      <FaStarOfDavid className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-['Poppins'] font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <FiMessageCircle className="text-[#D72638] h-6 w-6 mb-2" />
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/testimonials"
              className="inline-flex items-center text-[#0D47A1] font-medium hover:text-[#1565C0] transition-colors"
            >
              Read more success stories
              <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* === Call to Action Banner (REDESIGNED) === */}
      <section className="py-20 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] relative overflow-hidden">
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

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-['Poppins'] font-bold text-white mb-6">
                Ready to Stand Strong?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join a self-defense class today and empower yourself with confidence and skills that last a lifetime.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Expert instructors with real-world experience",
                  "Classes for all skill levels and ages",
                  "Supportive and inclusive learning environment",
                  "Practical techniques you can use immediately",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-1 bg-white/20 rounded-full">
                        <FiCheck className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="ml-3 text-blue-100">{item}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={scrollToCities}
                  className="px-8 py-3.5 bg-white text-[#0D47A1] font-['Poppins'] font-semibold rounded-lg shadow-lg hover:bg-[#64B5F6] hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Classes
                </motion.button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 border-2 border-white text-white font-['Poppins'] font-semibold rounded-lg hover:bg-white hover:text-[#0D47A1] transition-all duration-300 inline-block text-center"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full border-2 border-white/30 rounded-2xl"></div>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={actionShot2 || "/placeholder.svg"}
                    alt="Stand Strong Class"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
