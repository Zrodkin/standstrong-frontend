import React, { useState, useRef, useEffect } from 'react'; // Added useRef and useEffect
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import { motion, AnimatePresence } from 'framer-motion';

// --- Import Hero image ---
import heroImageFromFile from '../assets/class-hero-image.jpeg';
const heroBackgroundImage = heroImageFromFile; // --- Assign Hero image ---

// --- Import City images ---
import bostonImage from '../assets/boston-skyline.jpeg';
import chicagoImage from '../assets/chicago-skyline.jpeg';
import laImage from '../assets/la-skyline.jpeg';
import newyorkImage from '../assets/newyork-skyline.jpeg';
import lasvegasImage from '../assets/lasvegas-skyline.jpeg';

// --- Import Gallery images ---
import actionShot1 from '../assets/class-action-shot1.jpeg';
import actionShot2 from '../assets/class-action-shot2.jpeg';
import actionShot3 from '../assets/class-action-shot3.jpeg';

// --- Import Site Logo ---
import siteLogo from '../assets/standstrong-logo-white.svg'; // Assuming this is the correct path

// --- Import Icons ---
import { FiUsers, FiShield, FiAward, FiZap } from 'react-icons/fi';

import { useClasses } from '../context/ClassContext';
import getFullImageUrl from '../utils/getFullImageUrl';

const cityImageMap = {
  'Boston': bostonImage,
  'New York': newyorkImage,
 'Chicago': chicagoImage,
  'Los Angeles': laImage,
  'Las Vegas': lasvegasImage,
};
const defaultCityImage = '/img/placeholder-city.jpg';
const galleryImages = [actionShot1, actionShot2, actionShot3];

const aboutFeatures = [
  { Icon: FiShield, title: 'Classes for Everyone', text: 'Tailored for all ages, genders, and experience levels.' },
  { Icon: FiAward, title: 'Expert Instructors', text: 'Certified professionals passionate about teaching effective techniques.' },
  { Icon: FiUsers, title: 'Supportive Community', text: 'Join a community committed to personal safety and growth.' },
  { Icon: FiZap, title: 'Practical Skills', text: 'Learn techniques that work in real-world situations, focusing on practicality.' },
];

// --- Content for "Our Story" ---
const ourStoryContent = {
    title: "Our Journey to Empowerment",
    paragraphs: [
        "At StandStrong our mission is to change the narrative for all groups affected by bigotry, bullying and hate.",
        "We don't seek to change the mindset of those who teach hate. Instead, we choose to set an example of living a positive life with diverse groups who support one another. Every community deserves to be represented by people who are proud of themselves and their heritage.",
        "Our programs do not teach students how to fight, but how to avoid becoming a victim. We teach self-defense skills to disengage and de-escalate tension and conflict in a calm and confident manner.",
        "To date, we have trained thousands of students to be safe, proud and confident in who they are and what they believe. These students are the future leaders of our communities. Their participation in StandStrong programs will provide them with newfound confidence and pride as they help change the narrative generation by generation.",
    ]
};


const HomePage = () => {
  const [activeTab, setActiveTab] = useState('about'); // State for toggling content
  const citiesSectionRef = useRef(null); // Reference to cities section
  const location = useLocation(); // Get location for detecting hash changes

  // Handle scroll to cities section when hash changes
  useEffect(() => {
    // Check for hash in URL or if coming from /classes route
    if (location.hash === '#cities-section' && citiesSectionRef.current) {
      // Scroll to cities section with a small delay to ensure proper rendering
      setTimeout(() => {
        citiesSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [location]);

  // Function to scroll to cities section
  const scrollToCities = (e) => {
    e.preventDefault(); // Prevent default link behavior
    if (citiesSectionRef.current) {
      citiesSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };
  const heroItemVariants = (delay = 0) => ({
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, delay } },
  });

  // Animation variants for the tab content
  const tabContentVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  const { cities } = useClasses();
  

  return (
    <div className="bg-gradient-to-br from-sky-100 to-gray-100">

      {/* === 1. Hero Section (Rewritten with <img>) === */}
      <section className="relative h-[50vh] sm:h-[65vh] md:h-[70vh]">
        <img
          src={heroBackgroundImage}
          alt="Stand Strong Hero"
          className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-full px-4 sm:px-6">
          <motion.div variants={heroItemVariants(0)} initial="hidden" animate="visible">
            <img src={siteLogo} alt="Stand Strong Logo" className="h-14 sm:h-16 md:h-20 w-auto" />
          </motion.div>
          <motion.p
            className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl max-w-xl sm:max-w-2xl"
            variants={heroItemVariants(0.2)}
            initial="hidden"
            animate="visible"
          >
            Empowering through self-defense classes in your city
          </motion.p>
          <motion.div
            variants={heroItemVariants(0.4)}
            initial="hidden"
            animate="visible"
            className="mt-8 md:mt-14"
          >
            {/* Changed to use onClick scrollToCities instead of Link to="/classes" */}
            <button
              onClick={scrollToCities}
              className="px-8 py-3 sm:px-10 sm:py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300 text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              Find Classes
            </button>
          </motion.div>
        </div>
      </section>

      {/* === 2. Cities Grid === */}
      <section id="cities-section" className="py-12 md:py-16 bg-gray-50" ref={citiesSectionRef}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 md:mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Find Us In Your City</h2>
                  <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl sm:mt-4">Select your location to see available classes.</p>
              </div>
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center" variants={containerVariants} initial="hidden" animate="visible">
              {cities.map((city) => (
                  <motion.div key={city._id} variants={itemVariants}>
                      <Link to={`/classes?city=${city.name}`} className="block group">
                          <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <img
                            src={getFullImageUrl(city.imageUrl) || defaultCityImage}
                            alt={`${city.name} skyline`}
                            className="w-full h-40 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          </div>
                          <p className="mt-2 sm:mt-3 font-semibold text-base sm:text-lg text-gray-900">{city.name}</p>
                          <p className="text-xs sm:text-sm text-indigo-600 font-medium">Classes Available</p>
                      </Link>
                  </motion.div>
              ))}
              </motion.div>
          </div>
      </section>

      {/* === 3. Why Stand Strong (NEW Toggling Section) === */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Headings */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Stand Strong</h2>
            <p className="mt-2 text-2xl leading-8 font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">Empowerment Through Skill</p>
            {/* Keep the general description here or move it into "About Us"? Let's keep it general. */}
            <p className="mt-3 sm:mt-4 max-w-2xl text-lg sm:text-xl text-gray-500 lg:mx-auto">Discover our mission and the story behind Stand Strong.</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-8 md:mb-10">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base ${
                activeTab === 'about'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base ${
                activeTab === 'story'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Our Story
            </button>
          </div>

          {/* Dynamic Content Area */}
          <div className="mt-8">
            <AnimatePresence mode="wait"> {/* mode="wait" ensures exit animation finishes first */}
              {activeTab === 'about' && (
                <motion.div
                    key="about" // Key is important for AnimatePresence
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                  {/* "About Us" Content Grid (Existing Features) */}
                  <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                      variants={containerVariants} // Use existing container variants for staggering children
                      initial="hidden"
                      animate="visible" // Animate children when this tab is visible
                  >
                    {aboutFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="bg-white shadow-lg p-5 sm:p-6 rounded-xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                        variants={itemVariants} // Use existing item variants
                      >
                        <feature.Icon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
                        <h4 className="mt-3 sm:mt-4 font-bold text-base sm:text-lg">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 sm:mt-2">{feature.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'story' && (
                <motion.div
                    key="story" // Key is important for AnimatePresence
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="max-w-4xl mx-auto text-gray-700 leading-relaxed px-4" // Center and style story text
                >
                    {/* "Our Story" Content */}
                    <h3 className="text-2xl font-semibold text-center text-gray-900 mb-6">{ourStoryContent.title}</h3>
                    {ourStoryContent.paragraphs.map((para, index) => (
                        <p key={index} className="mb-4 text-base sm:text-lg">
                            {para}
                        </p>
                    ))}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* === 4. Visual Testimonials/Gallery Section === */}
      <section className="bg-gray-50 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto px-4 sm:px-0">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Real People. Real Strength.</h2>
              <p className="mt-2 text-base sm:text-lg text-gray-500">See how Stand Strong has helped communities nationwide.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 md:mt-10 max-w-6xl mx-auto px-4 sm:px-6" variants={containerVariants} initial="hidden" animate="visible">
              {galleryImages.map((imgSrc, index) => (
                  <motion.div key={index} className="overflow-hidden rounded-xl shadow-md" variants={itemVariants}>
                      <img
                          src={imgSrc}
                          alt={`Class action shot ${index + 1}`}
                          className="object-cover h-56 sm:h-64 w-full hover:scale-105 transition-transform duration-300"
                      />
                  </motion.div>
              ))}
          </motion.div>
      </section>

      {/* === 5. Call to Action Banner === */}
      <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 text-center"
              >
                  <h2 className="text-2xl sm:text-3xl font-bold">Ready to get started?</h2>
                  <p className="mt-2 sm:mt-3 text-base sm:text-lg max-w-xl mx-auto">
                      Join a self-defense class today and stand strong in your life.
                  </p>
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                      {/* Update this link to use the scroll function */}
                      <button
                          onClick={scrollToCities}
                          className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 w-full sm:w-auto text-sm sm:text-base"
                      >
                          Browse Classes
                      </button>
                      <Link
                          to="/register"
                          className="px-6 py-2.5 sm:px-8 sm:py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-indigo-700 transition-colors duration-300 w-full sm:w-auto text-sm sm:text-base"
                      >
                          Sign Up
                      </Link>
                  </div>
              </motion.div>
          </div>
      </section>
    </div>
  );
};

export default HomePage;