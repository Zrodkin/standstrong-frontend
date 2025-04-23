import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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


// --- Map city names to imported images ---
const cityImageMap = {
    'Boston': bostonImage,
    'New York': newyorkImage,
    'Chicago': chicagoImage,
    'Los Angeles': laImage,
    'Las Vegas': lasvegasImage,
};
const defaultCityImage = '/img/placeholder-city.jpg'; // Fallback

// --- Use imported gallery images ---
const galleryImages = [actionShot1, actionShot2, actionShot3];

// --- Data for About section ---
const aboutFeatures = [
    { Icon: FiShield, title: "Classes for Everyone", text: "Tailored for all ages, genders, and experience levels." },
    { Icon: FiAward, title: "Expert Instructors", text: "Certified professionals passionate about teaching effective techniques." },
    { Icon: FiUsers, title: "Supportive Community", text: "Join a community committed to personal safety and growth." },
    { Icon: FiZap, title: "Practical Skills", text: "Learn techniques that work in real-world situations, focusing on practicality." }
];
// --- End Sample Data ---

const HomePage = () => {
    // --- Animation Variants ---
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };
    const heroItemVariants = (delay = 0) => ({ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7, delay: delay } } });
    // --- End Animation Variants ---

    const displayCities = ['Boston', 'New York', 'Chicago', 'Los Angeles', 'Las Vegas'];

    return (
        // Overall page gradient
        <div className="bg-gradient-to-br from-sky-100 to-gray-100">

            {/* === 1. Hero Section === */}
            <section
  className="relative bg-cover bg-[center_top] sm:bg-center h-[50vh] sm:h-[65vh] md:h-[70vh]"
  style={{ backgroundImage: `url(${heroBackgroundImage})` }}
>
                <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
                 {/* Adjusted top padding for mobile (pt-32), kept pt-48 for larger screens */}
                <div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-full px-4 sm:px-6">

                    {/* Logo Image */}
                    <motion.div
                        variants={heroItemVariants(0)}
                        initial="hidden"
                        animate="visible"
                    >
                        <img
                            src={siteLogo}
                            alt="Stand Strong Logo"
                            // Base height for mobile, increases on medium screens
                            className="h-14 sm:h-16 md:h-20 w-auto"
                        />
                    </motion.div>

                    {/* Tagline */}
                    <motion.p
                        // Base text size for mobile, increases on medium screens. Adjusted top margin.
                        className="mt-4 text-lg sm:text-xl md:text-2xl max-w-xl sm:max-w-2xl"
                        variants={heroItemVariants(0.2)}
                        initial="hidden"
                        animate="visible"
                    >
                        Empowering through self-defense classes in your city
                    </motion.p>

                    {/* Button Container */}
                    <motion.div
                        variants={heroItemVariants(0.4)}
                        initial="hidden"
                        animate="visible"
                        // Adjusted top margin for mobile vs larger screens
                        className="mt-8 md:mt-14"
                    >
                        <Link
                            to="/classes"
                            // Adjusted padding and text size slightly for mobile
                            className="px-8 py-3 sm:px-10 sm:py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300 text-base sm:text-lg shadow-md hover:shadow-lg"
                        >
                            Find Classes
                        </Link>
                    </motion.div>

                </div>
            </section>

            {/* === 2. Cities Grid === */}
             {/* Adjusted vertical padding for mobile */}
            <section className="py-12 md:py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-12">
                        {/* Adjusted text size for mobile */}
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Find Us In Your City</h2>
                         {/* Adjusted text size for mobile */}
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl sm:mt-4">Select your location to see available classes.</p>
                    </div>
                    {/* Grid starts with 2 columns, adjusts for medium and large screens */}
                    <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center" variants={containerVariants} initial="hidden" animate="visible">
                        {displayCities.map((city) => (
                            <motion.div key={city} variants={itemVariants}>
                                <Link to={`/classes?city=${city}`} className="block group">
                                    <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        {/* Adjusted image height for mobile */}
                                        <img src={cityImageMap[city] || defaultCityImage} alt={`${city} skyline`} className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                     {/* Adjusted text size and margin */}
                                    <p className="mt-2 sm:mt-3 font-semibold text-base sm:text-lg text-gray-900">{city}</p>
                                    <p className="text-xs sm:text-sm text-indigo-600 font-medium">Classes Available</p>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* === 3. About Section === */}
             {/* Adjusted vertical padding */}
            <section className="py-12 md:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     {/* Adjusted bottom margin */}
                    <div className="lg:text-center mb-10 md:mb-12">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Stand Strong?</h2>
                        {/* Adjusted text size for mobile */}
                        <p className="mt-2 text-2xl leading-8 font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">Empowerment Through Skill</p>
                         {/* Adjusted text size and margin */}
                        <p className="mt-3 sm:mt-4 max-w-2xl text-lg sm:text-xl text-gray-500 lg:mx-auto">We provide practical self-defense training in a supportive environment.</p>
                    </div>
                    {/* Grid starts with 1 column, adjusts for medium and large screens */}
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" variants={containerVariants} initial="hidden" animate="visible">
                    {aboutFeatures.map((feature, index) => (
    // Adjusted padding for mobile
    <motion.div
        key={index}
        className="bg-white shadow-lg p-5 sm:p-6 rounded-xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
        variants={itemVariants}
    >
        <feature.Icon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
        <h4 className="mt-3 sm:mt-4 font-bold text-base sm:text-lg">{feature.title}</h4>
        <p className="text-sm text-gray-600 mt-1 sm:mt-2">{feature.text}</p>
    </motion.div>
))}
                    </motion.div>
                </div>
            </section>

            {/* === 4. Visual Testimonials/Gallery Section === */}
             {/* Adjusted vertical padding */}
            <section className="bg-gray-50 py-12 md:py-16">
                <div className="text-center max-w-2xl mx-auto px-4 sm:px-0">
                     {/* Adjusted text size */}
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Real People. Real Strength.</h2>
                     {/* Adjusted text size */}
                    <p className="mt-2 text-base sm:text-lg text-gray-500">See how Stand Strong has helped communities nationwide.</p>
                </div>
                {/* Grid starts with 1 column, adjusts for medium screens. Adjusted margin-top and gap */}
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 md:mt-10 max-w-6xl mx-auto px-4 sm:px-6" variants={containerVariants} initial="hidden" animate="visible">
                    {galleryImages.map((imgSrc, index) => (
                        <motion.div key={index} className="overflow-hidden rounded-xl shadow-md" variants={itemVariants}>
                            <img
                                src={imgSrc}
                                alt={`Class action shot ${index + 1}`}
                                // Adjusted image height for mobile
                                className="object-cover h-56 sm:h-64 w-full hover:scale-105 transition-transform duration-300"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* === 5. Call to Action Banner === */}
            {/* Adjusted vertical padding */}
            <section className="py-12 lg:py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                         // Adjusted padding for mobile
                        className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 text-center"
                    >
                         {/* Adjusted text size */}
                        <h2 className="text-2xl sm:text-3xl font-bold">Ready to get started?</h2>
                         {/* Adjusted text size and margin */}
                        <p className="mt-2 sm:mt-3 text-base sm:text-lg max-w-xl mx-auto">
                            Join a self-defense class today and stand strong in your life.
                        </p>
                         {/* Flex direction starts column, becomes row on small screens. Adjusted gap and margin-top */}
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                            <Link
                                to="/classes"
                                 // Adjusted padding/text for mobile, ensures full width then auto
                                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 w-full sm:w-auto text-sm sm:text-base"
                            >
                                Browse Classes
                            </Link>
                            <Link
                                to="/register"
                                 // Adjusted padding/text for mobile, ensures full width then auto
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