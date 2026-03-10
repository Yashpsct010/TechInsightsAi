import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { formatDate } from './utils/formatters';
import { FaBookmark, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';

const Bookmarks = () => {
    const { user, toggleBookmark } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [failedImages, setFailedImages] = useState(new Set());

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookmarks();
    }, [user, navigate]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const data = await authService.getBookmarks();
            setBookmarks(data);
        } catch (err) {
            console.error("Failed to fetch bookmarks:", err);
            setError("Failed to load your bookmarks. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async (e, blogId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await toggleBookmark(blogId);
            setBookmarks(prev => prev.filter(b => b._id !== blogId));
        } catch (err) {
            console.error("Failed to toggle bookmark", err);
        }
    };

    const handleImageError = (blogId) => {
        setFailedImages(prev => new Set(prev).add(blogId));
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 pb-12 selection:bg-[#ec5b13] selection:text-white"
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-[2px] bg-[#ec5b13]" />
                        <span className="font-mono text-[10px] sm:text-xs text-[#ec5b13] uppercase tracking-widest">// Saved_Data_Nodes</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        Your <span className="text-[#ec5b13]">Bookmarks</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-mono mt-2">{bookmarks.length} node{bookmarks.length !== 1 ? 's' : ''} cached</p>
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {/* Loading */}
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 sm:py-24"
                        >
                            <motion.div className="relative">
                                <motion.div
                                    className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ec5b13] border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#8b5cf6]"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.2 }}
                                />
                            </motion.div>
                            <p className="mt-4 text-slate-500 text-sm font-mono uppercase tracking-wider">Loading_Cached_Data...</p>
                        </motion.div>

                    ) : error ? (
                        /* Error */
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-red-500"
                        >
                            <h3 className="font-bold text-sm mb-2 text-red-400 font-mono uppercase tracking-tight">
                                <span className="mr-2">⚠</span> Retrieval_Error
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">{error}</p>
                            <motion.button
                                onClick={fetchBookmarks}
                                className="px-5 py-2 bg-[#ec5b13] text-white rounded-xl hover:bg-[#ec5b13]/90 transition-colors text-xs sm:text-sm font-mono uppercase tracking-wider font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Retry_Connection
                            </motion.button>
                        </motion.div>

                    ) : bookmarks.length === 0 ? (
                        /* Empty */
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 sm:py-24"
                        >
                            <FaBookmark className="text-4xl sm:text-5xl text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl sm:text-2xl font-black mb-3 text-white uppercase tracking-tighter">No_Data_Cached</h3>
                            <p className="text-slate-500 font-mono text-xs sm:text-sm max-w-md mx-auto mb-6">
                                You haven't saved any articles yet. Explore the archive and cache nodes for quick access.
                            </p>
                            <Link
                                to="/blogs"
                                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-[#ec5b13] text-white rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-[#ec5b13]/90 transition-colors"
                            >
                                Explore_Archive <FaArrowRight className="text-xs" />
                            </Link>
                        </motion.div>

                    ) : (
                        /* Bookmarks Grid */
                        <motion.div
                            key="results"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                        >
                            {bookmarks.map((blog) => {
                                const hasValidImage = blog.image && !failedImages.has(blog._id);

                                return (
                                    <motion.div
                                        key={blog._id}
                                        variants={item}
                                        className="glass-panel rounded-2xl overflow-hidden group hover:border-[#ec5b13]/30 transition-all duration-500 relative"
                                    >
                                        {/* Remove Bookmark */}
                                        <button
                                            onClick={(e) => handleBookmark(e, blog._id)}
                                            className="absolute top-3 right-3 z-10 p-2 rounded-lg backdrop-blur-sm text-[#ec5b13] bg-[#ec5b13]/10 border border-[#ec5b13]/20 hover:bg-[#ec5b13]/20 transition-all"
                                            title="Remove Bookmark"
                                        >
                                            <FaBookmark className="text-sm" />
                                        </button>

                                        <Link to={`/blog/${blog._id}`} className="block h-full">
                                            {/* Image */}
                                            <div className="h-40 sm:h-44 md:h-48 overflow-hidden bg-[#121212]">
                                                {hasValidImage ? (
                                                    <img
                                                        src={blog.image}
                                                        alt={blog.imageAlt || blog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={() => handleImageError(blog._id)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#ec5b13]/10 to-[#8b5cf6]/10 flex items-center justify-center">
                                                        <span className="font-mono text-xs text-slate-600 uppercase tracking-widest">No_Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 sm:p-5">
                                                {/* Genre + Date */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-2 py-0.5 bg-[#06b6d4]/10 text-[#06b6d4] text-[10px] font-mono uppercase rounded border border-[#06b6d4]/20">
                                                        {blog.genre?.charAt(0).toUpperCase() + blog.genre?.slice(1).replace('-', ' ') || 'Blog'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                                                        <FaCalendarAlt className="text-[8px]" /> {formatDate(blog.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h2 className="text-sm sm:text-base font-bold mb-3 line-clamp-2 text-white uppercase tracking-tight leading-snug group-hover:text-[#ec5b13] transition-colors">
                                                    {blog.title}
                                                </h2>

                                                {/* Bottom */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ec5b13]" />
                                                        Cached
                                                    </span>
                                                    <span className="text-[#ec5b13] flex items-center gap-1 font-bold">
                                                        Access_Data <FaArrowRight className="text-[8px]" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Bookmarks;
