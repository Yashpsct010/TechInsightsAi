import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaUserCircle } from 'react-icons/fa';
import ComingSoonPopup from './ComingSoonPopup';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
        setShowProfileMenu(false);
    }, [location]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Navigation items
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
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

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
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
                                            relative px-3 lg:px-4 py-2 rounded-md text-sm font-medium 
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

                            <div className="h-6 w-px bg-gray-700 mx-2"></div>

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-slate-800/50"
                                    >
                                        <FaUserCircle className="text-xl text-cyan-400" />
                                        <span className="text-sm font-medium hidden lg:block">
                                            {user.email.split('@')[0]}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-2 border-b border-slate-700">
                                                    <p className="text-xs text-gray-400">Signed in as</p>
                                                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                                    {user.role === 'admin' && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-fuchsia-900/50 text-fuchsia-300 text-xs rounded border border-fuchsia-500/30">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors mt-1"
                                                >
                                                    Sign out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="text-gray-200 hover:text-cyan-300 px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden lg:block ml-4 bg-fuchsia-600 text-white px-5 py-1.5 rounded-full font-medium text-sm shadow-md shadow-fuchsia-700/30 hover:shadow-lg hover:bg-fuchsia-500 transition-all border border-fuchsia-400/50"
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
                            style={{ position: 'relative', zIndex: 101 }} // Ensure button is above overlay
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
            </motion.header>

            {/* Mobile Menu Overlay - Enhanced with smoother animations and transitions */}
            {createPortal(
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="fixed inset-0 z-[90] bg-gradient-to-br from-slate-900/98 to-gray-900/98 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col h-full pt-28 sm:pt-24 px-4 sm:px-6"> {/* Increased/Adjusted padding-top to avoid overlap with header */}
                                <motion.nav
                                    className="flex flex-col space-y-1 sm:space-y-2 mt-4"
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
                </AnimatePresence>,
                document.body
            )}

            {/* Coming Soon Popup */}
            <ComingSoonPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    );
};

export default Header;