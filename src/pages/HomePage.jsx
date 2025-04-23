// client/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Import Hero image ---
import heroImageFromFile from '../assets/class-hero-image.jpeg';

// --- Import City images ---
import bostonImage from '../assets/boston-skyline.jpeg';
import chicagoImage from '../assets/chicago-skyline.jpeg';
import laImage from '../assets/la-skyline.jpeg';
import newyorkImage from '../assets/newyork-skyline.jpeg';
import lasvegasImage from '../assets/lasvegas-skyline.jpeg';

// --- Import Gallery images (Change 1) ---
import actionShot1 from '../assets/class-action-shot1.jpeg';
import actionShot2 from '../assets/class-action-shot2.jpeg';
import actionShot3 from '../assets/class-action-shot3.jpeg';

import { FiUsers, FiShield, FiAward, FiZap } from 'react-icons/fi';

// --- Assign Hero image ---
const heroBackgroundImage = heroImageFromFile;

// --- Map city names to imported images ---
const cityImageMap = {
    'Boston': bostonImage,
    'New York': newyorkImage,
    'Chicago': chicagoImage,
    'Los Angeles': laImage,
    'Las Vegas': lasvegasImage,
};
const defaultCityImage = '/img/placeholder-city.jpg'; // Fallback

// --- Use imported gallery images (Change 1) ---
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
        <div className="bg-gradient-to-br from-sky-100 to-gray-100">

            {/* === 1. Hero Section === */}
            <section className="relative bg-cover bg-center h-[80vh]" style={{ backgroundImage: `url(${heroBackgroundImage})` }}>
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6">
                    <div className="space-y-6 md:space-y-8">
                        <motion.h1 className="text-4xl md:text-6xl font-bold" variants={heroItemVariants(0)} initial="hidden" animate="visible">Stand Strong</motion.h1>
                        <motion.p className="mt-2 text-xl md:text-2xl max-w-2xl" variants={heroItemVariants(0.2)} initial="hidden" animate="visible">Empowering through self-defense classes in your city</motion.p>
                        <motion.div variants={heroItemVariants(0.4)} initial="hidden" animate="visible" className="mt-8">
                            <Link to="/classes" className="px-10 py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-300 text-lg shadow-md hover:shadow-lg">Find Classes</Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* === 2. Cities Grid === */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Find Us In Your City</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">Select your location to see available classes.</p>
                    </div>
                    <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center" variants={containerVariants} initial="hidden" animate="visible">
                        {displayCities.map((city) => (
                            <motion.div key={city} variants={itemVariants}>
                                <Link to={`/classes?city=${city}`} className="block group">
                                    <div className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <img src={cityImageMap[city] || defaultCityImage} alt={`${city} skyline`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <p className="mt-3 font-semibold text-lg text-gray-900">{city}</p>
                                    <p className="text-sm text-indigo-600 font-medium">Classes Available</p>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* === 3. About Section === */}
            <section className="py-16 bg-white">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="lg:text-center mb-12">
                         <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Stand Strong?</h2>
                         <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">Empowerment Through Skill</p>
                         <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">We provide practical self-defense training in a supportive environment.</p>
                     </div>
                     <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" animate="visible">
                         {aboutFeatures.map((feature, index) => (
                             <motion.div key={index} className="bg-white shadow-lg p-6 rounded-xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100" variants={itemVariants}>
                                 <feature.Icon className="mx-auto h-10 w-10 text-indigo-600" />
                                 <h4 className="mt-4 font-bold text-lg">{feature.title}</h4>
                                 <p className="text-sm text-gray-600 mt-2">{feature.text}</p>
                             </motion.div>
                         ))}
                    </motion.div>
                 </div>
            </section>

            {/* === 4. Visual Testimonials/Gallery Section (Change 1 applied) === */}
            <section className="bg-gray-50 py-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900">Real People. Real Strength.</h2>
                    <p className="mt-2 text-lg text-gray-500">See how Stand Strong has helped communities nationwide.</p>
                </div>
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto px-6" variants={containerVariants} initial="hidden" animate="visible">
                    {/* Use imported galleryImages array */}
                    {galleryImages.map((imgSrc, index) => (
                        <motion.div key={index} className="overflow-hidden rounded-xl shadow-md" variants={itemVariants}>
                            <img
                                src={imgSrc} // Use imported image variable
                                alt={`Class action shot ${index + 1}`}
                                className="object-cover h-64 w-full hover:scale-105 transition-transform duration-300"
                             />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* === 5. Call to Action Banner (Change 2 applied) === */}
            <section className="py-12 lg:py-16"> {/* Padding for the section */}
                 <div className="max-w-5xl mx-auto px-6 lg:px-8"> {/* Constrained width */}
                    {/* The styled container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }} // Animate when scrolled into view
                        viewport={{ once: true, amount: 0.3 }} // Trigger animation once
                        transition={{ duration: 0.6 }}
                        // --- MODIFIED GRADIENT HERE ---
                        className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-xl p-10 lg:p-12 text-center" // Using softer indigo gradient
                        // --- End Modified Gradient ---
                    >
                        <h2 className="text-3xl font-bold">Ready to get started?</h2>
                        <p className="mt-3 text-lg max-w-xl mx-auto"> {/* White text contrasts well */}
                            Join a self-defense class today and stand strong in your life.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/classes"
                                // Original button styles from this design work well here
                                className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 w-full sm:w-auto"
                            >
                                Browse Classes
                            </Link>
                            <Link
                                to="/register"
                                // Original button styles from this design work well here
                                className="px-8 py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-indigo-700 transition-colors duration-300 w-full sm:w-auto"
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