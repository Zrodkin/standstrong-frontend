// frontend/src/Layouts/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import standStrongLogo from '../assets/standstrong-logo.svg'; // ✅ Make sure this path is correct

const AuthLayout = ({ children, title = "Authentication", subtitle }) => {
    return (
        // --- MODIFICATION 1: Added gradient background ---
        <div className="min-h-screen bg-gradient-to-br from-sky-100 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8"> {/* Replaced bg-gray-50 */}

            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Logo */}
                <Link to="/" className="flex justify-center" aria-label="Home">
                    <img
                        className="h-24 w-auto mx-auto" // Logo size - adjust h-24 if needed
                        src={standStrongLogo}
                        alt="Stand Strong Logo"
                    />
                </Link>

                {/* Title */}
                {/* --- MODIFICATION 2: Reduced margin-top from mt-6 to mt-4 --- */}
                <h2 className="mt-0 text-3xl font-extrabold text-gray-900"> {/* Changed mt-6 to mt-4 */}
                    {title}
                </h2>

                {/* Optional Subtitle */}
                {subtitle && (
                    <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Form Container */}
            {/* Added slightly more margin-top here to compensate for reduced space above */}
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md"> {/* Changed mt-8 to mt-10 */}
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    {children} {/* This is where LoginPage form will render */}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;