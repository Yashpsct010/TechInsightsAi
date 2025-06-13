import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb } from 'react-icons/fa';
import ComingSoonPopup from './ComingSoonPopup';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Navigation items - Updated to include Blogs
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Latest Blog', path: '/blog' },
        { name: 'All Blogs', path: '/blogs' },
        { name: 'About', path: '/about' }
    ];

    const handleSubscribeClick = (e) => {
        e.preventDefault();
        setIsPopupOpen(true);
    };

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-sm shadow-lg py-2 sm:py-3'
                    : 'bg-gradient-to-r from-slate-900 to-gray-900 py-3 sm:py-5'
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/" className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -10, 10, -10, 0],
                                        transition: { duration: 0.5 }
                                    }}
                                    className="bg-slate-800 rounded-full p-1.5 sm:p-2 shadow-md border border-cyan-400/50"
                                >
                                    <FaLightbulb className="text-cyan-400 text-lg sm:text-xl" />
                                </motion.div>
                                <div>
                                    <span className="font-bold text-lg sm:text-xl md:text-2xl text-white">
                                        Tech<span className="text-cyan-400">Insights</span>AI
                                    </span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation - Enhanced with better hover effects */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                >
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `
                                            relative px-4 lg:px-5 py-2 rounded-md text-sm font-medium 
                                            ${isActive ? 'text-cyan-400' : 'text-gray-100 hover:text-cyan-300'}
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="navIndicator"
                                                        className="absolute inset-0 bg-fuchsia-900/30 rounded-md -z-10"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{item.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                </motion.div>
                            ))}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="ml-2 lg:ml-4 bg-fuchsia-600 text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-full font-medium text-sm shadow-md shadow-fuchsia-700/30 hover:shadow-lg hover:bg-fuchsia-500 transition-all border border-fuchsia-400/50"
                                onClick={handleSubscribeClick}
                            >
                                Subscribe
                            </motion.button>
                        </nav>

                        {/* Mobile Menu Button - Enhanced with smoother animations */}
                        <motion.button
                            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <motion.div
                                animate={isMenuOpen ? "open" : "closed"}
                                variants={{
                                    open: { rotate: 180 },
                                    closed: { rotate: 0 }
                                }}
                                transition={{ duration: 0.4 }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <motion.path
                                        animate={isMenuOpen ? "open" : "closed"}
                                        variants={{
                                            closed: { d: "M3 5h12M3 9h12M3 13h12" },
                                            open: { d: "M4 4L14 14M4 14L14 4" }
                                        }}
                                        transition={{ duration: 0.4 }}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </motion.div>
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu Overlay - Enhanced with smoother animations and transitions */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="fixed inset-0 z-40 bg-gradient-to-br from-slate-900/98 to-gray-900/98 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col h-full pt-16 sm:pt-20 px-4 sm:px-6">
                                <motion.nav
                                    className="flex flex-col space-y-1 sm:space-y-2 mt-6 sm:mt-8"
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    variants={{
                                        open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                                        closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                                    }}
                                >
                                    {navItems.map((item) => (
                                        <motion.div
                                            key={item.name}
                                            variants={{
                                                open: { opacity: 1, y: 0 },
                                                closed: { opacity: 0, y: 20 }
                                            }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `block py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-xl font-medium rounded-xl transition-colors ${isActive
                                                        ? 'bg-fuchsia-900/20 text-cyan-400 border border-fuchsia-500/30'
                                                        : 'text-gray-100 hover:bg-slate-800/50 hover:text-cyan-300'
                                                    }`
                                                }
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {item.name}
                                            </NavLink>
                                        </motion.div>
                                    ))}
                                    <motion.div
                                        variants={{
                                            open: { opacity: 1, y: 0 },
                                            closed: { opacity: 0, y: 20 }
                                        }}
                                        className="pt-4 sm:pt-6"
                                    >
                                        <button
                                            className="w-full bg-fuchsia-600 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-medium shadow-lg text-center text-base sm:text-lg border border-fuchsia-400/50"
                                            onClick={handleSubscribeClick}
                                        >
                                            Subscribe
                                        </button>
                                    </motion.div>
                                </motion.nav>
                                <div className="mt-auto pb-8 sm:pb-10">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-center text-cyan-300/70 text-xs sm:text-sm"
                                    >
                                        © {new Date().getFullYear()} TechInsights AI
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Coming Soon Popup */}
            <ComingSoonPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    );
};

export default Header;