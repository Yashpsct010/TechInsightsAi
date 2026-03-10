import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaUserCircle } from 'react-icons/fa';
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
        { name: 'Feed', path: '/' },
        { name: 'Latest', path: '/blog' },
        { name: 'Archive', path: '/blogs' },
        { name: 'Jobs', path: '/jobs' },
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
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-white/10 ${scrolled
                    ? 'bg-[#0a0a0c]/90 backdrop-blur-md py-2 sm:py-3'
                    : 'bg-[#0a0a0c]/80 backdrop-blur-md py-3 sm:py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-12 sm:h-14">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/" className="flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -10, 10, -10, 0],
                                        transition: { duration: 0.5 }
                                    }}
                                    className="bg-[#ec5b13] p-1 sm:p-1.5 rounded-lg"
                                >
                                    <FaTerminal className="text-white text-sm sm:text-lg" />
                                </motion.div>
                                <h2 className="text-base text-white sm:text-lg md:text-xl font-bold tracking-tighter uppercase font-mono">
                                    TechInsights<span className="text-[#ec5b13]">.AI</span>
                                </h2>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                            <div className="flex items-center gap-1 lg:gap-6 font-mono text-xs lg:text-sm uppercase tracking-widest text-slate-400">
                                {navItems.map((navItem, index) => (
                                    <motion.div
                                        key={navItem.name}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 + 0.2 }}
                                    >
                                        <NavLink
                                            to={navItem.path}
                                            className={({ isActive }) =>
                                                `relative px-2 lg:px-3 py-2 transition-colors ${isActive ? 'text-white' : 'hover:text-[#ec5b13]'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {isActive && (
                                                        <motion.span
                                                            layoutId="navIndicator"
                                                            className="absolute bottom-0 left-0 right-0 h-px bg-[#ec5b13]"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                        />
                                                    )}
                                                    <span className="relative z-10">{navItem.name}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="h-6 w-px bg-white/10 mx-2 lg:mx-4" />

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 px-2 lg:px-3 rounded-lg hover:bg-white/5"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec5b13] p-0.5">
                                            <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center">
                                                <FaUserCircle className="text-sm text-white" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono uppercase tracking-wider hidden lg:block">
                                            {user.email.split('@')[0]}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-52 bg-[#14141a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-white/5">
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Signed_In_As</p>
                                                    <p className="text-sm font-bold text-white truncate mt-1">{user.email}</p>
                                                    {user.role === 'admin' && (
                                                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-mono uppercase rounded border border-[#ec5b13]/20">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
                                                    >
                                                        Your_Profile
                                                    </Link>
                                                    <Link
                                                        to="/bookmarks"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="block w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
                                                    >
                                                        Bookmarks
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider"
                                                    >
                                                        Sign_Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="text-slate-300 hover:text-white px-2 lg:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors"
                                    >
                                        Log_In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white px-3 lg:px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all"
                                    >
                                        Sign_Up
                                    </Link>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden lg:block ml-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all"
                                onClick={handleSubscribeClick}
                            >
                                Subscribe
                            </motion.button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <motion.button
                            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white/5 text-white border border-white/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ position: 'relative', zIndex: 101 }}
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

            {/* Mobile Menu Overlay */}
            {createPortal(
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="fixed inset-0 z-[90] bg-[#0a0a0c]/98 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col h-full pt-24 sm:pt-24 px-4 sm:px-6">
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
                                    {navItems.map((navItem) => (
                                        <motion.div
                                            key={navItem.name}
                                            variants={{
                                                open: { opacity: 1, y: 0 },
                                                closed: { opacity: 0, y: 20 }
                                            }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <NavLink
                                                to={navItem.path}
                                                className={({ isActive }) =>
                                                    `block py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-xl font-mono font-bold uppercase tracking-tighter rounded-xl transition-colors ${isActive
                                                        ? 'bg-[#ec5b13]/10 text-[#ec5b13] border border-[#ec5b13]/20'
                                                        : 'text-slate-100 hover:bg-white/5 hover:text-white'
                                                    }`
                                                }
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {navItem.name}
                                            </NavLink>
                                        </motion.div>
                                    ))}
                                    {user && (
                                        <motion.div
                                            key="Bookmarks"
                                            variants={{
                                                open: { opacity: 1, y: 0 },
                                                closed: { opacity: 0, y: 20 }
                                            }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <NavLink
                                                to="/bookmarks"
                                                className={({ isActive }) =>
                                                    `block py-3 sm:py-4 px-3 sm:px-4 text-lg sm:text-xl font-mono font-bold uppercase tracking-tighter rounded-xl transition-colors ${isActive
                                                        ? 'bg-[#ec5b13]/10 text-[#ec5b13] border border-[#ec5b13]/20'
                                                        : 'text-slate-100 hover:bg-white/5 hover:text-white'
                                                    }`
                                                }
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Bookmarks
                                            </NavLink>
                                        </motion.div>
                                    )}
                                    <motion.div
                                        variants={{
                                            open: { opacity: 1, y: 0 },
                                            closed: { opacity: 0, y: 20 }
                                        }}
                                        className="pt-4 sm:pt-6"
                                    >
                                        <button
                                            className="w-full bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-mono font-bold uppercase tracking-tighter text-center text-base sm:text-lg transition-all"
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
                                        className="text-center font-mono text-[10px] text-slate-600 uppercase tracking-[0.3em]"
                                    >
                                        © {new Date().getFullYear()} TECHINSIGHTS_AI // ALL_DATA_SYNTHESIZED
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