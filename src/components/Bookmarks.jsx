import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { formatDate } from './utils/formatters';

const Bookmarks = () => {
    const { user, toggleBookmark } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            // Optimistically remove from list
            setBookmarks(prev => prev.filter(b => b._id !== blogId));
        } catch (err) {
            console.error("Failed to toggle bookmark", err);
        }
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
            className="container mx-auto px-4 py-8 max-w-6xl pt-20 md:pt-28 min-h-screen"
        >
            <div className="mb-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                        Your Bookmarks
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center py-20"
                        >
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-800 border border-red-500/30 text-gray-100 p-6 rounded-lg"
                        >
                            <h3 className="font-bold text-lg mb-2 text-red-400">Error</h3>
                            <p>{error}</p>
                            <button
                                onClick={fetchBookmarks}
                                className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-500 border border-fuchsia-400/30"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    ) : bookmarks.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-800 border border-slate-700 rounded-lg p-10 text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <h3 className="text-xl font-medium mb-2 text-white">No bookmarks yet</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-6">You haven't saved any articles to your bookmarks. Find something interesting and click the bookmark icon to save it here.</p>
                            <Link to="/blogs" className="inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors border border-cyan-400/30">
                                Explore Blogs
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {bookmarks.map((blog) => (
                                <motion.div
                                    key={blog._id}
                                    variants={item}
                                    className="bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-slate-700 relative"
                                >
                                    <button
                                        onClick={(e) => handleBookmark(e, blog._id)}
                                        className="absolute top-2 right-2 p-2 rounded-full z-10 backdrop-blur-sm transition-colors text-yellow-400 bg-black/40 hover:bg-black/60"
                                        title="Remove Bookmark"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </button>

                                    <Link to={`/blog/${blog._id}`} className="block h-full">
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={blog.image}
                                                alt={blog.imageAlt || blog.title}
                                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                                                    {blog.genre?.charAt(0).toUpperCase() + blog.genre?.slice(1).replace('-', ' ') || 'Blog'}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {formatDate(blog.createdAt)}
                                                </span>
                                            </div>
                                            <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-white">
                                                {blog.title}
                                            </h2>
                                            <div className="mt-4 flex justify-between items-center text-cyan-400 text-sm font-medium">
                                                <span>Read more</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Bookmarks;
