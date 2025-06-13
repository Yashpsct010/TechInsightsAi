import React, { useState, useEffect, useCallback } from 'react';
import { fetchLatestBlog } from './services/blogService';
import { motion, AnimatePresence } from 'framer-motion';

const Blog = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    // Debounce genre changes to prevent rapid API requests
    const debouncedFetchBlog = useCallback((genre) => {
        let timerId = null;

        return (genreValue) => {
            if (timerId) {
                clearTimeout(timerId);
            }

            // Small delay to prevent multiple rapid requests
            timerId = setTimeout(() => {
                loadBlog(genreValue);
            }, 300);

            return () => {
                if (timerId) clearTimeout(timerId);
            };
        };
    }, []);

    // Use useCallback to prevent recreating this function on every render
    const loadBlog = useCallback(async (genreValue) => {
        try {
            setLoading(true);
            setError(null);
            setIsRetrying(false);

            console.log(`Loading blog for genre: ${genreValue || 'all'}`);
            const blogData = await fetchLatestBlog(genreValue);

            if (!blogData) {
                throw new Error("No blog data returned from server");
            }

            setBlog(blogData);
        } catch (err) {
            console.error("Failed to load blog:", err);

            // More user-friendly error message
            const errorMessage = err.message || "An unexpected error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Retry logic for failed requests
    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        // Short delay before retry
        setTimeout(() => {
            loadBlog(selectedGenre);
        }, 500);
    }, [selectedGenre, loadBlog]);

    // Initial load and genre change handler
    useEffect(() => {
        const cleanup = debouncedFetchBlog()(selectedGenre);
        return cleanup;
    }, [selectedGenre, debouncedFetchBlog]);

    const handleGenreChange = (genre) => {
        // Only change if different
        if ((genre === "all" ? null : genre) !== selectedGenre) {
            setSelectedGenre(genre === "all" ? null : genre);
        }
    };

    // Same genres list
    const genres = [
        { id: 'all', name: 'All Topics' },
        { id: 'tech-news', name: 'Tech News' },
        { id: 'ai-ml', name: 'AI & ML' },
        { id: 'coding', name: 'Coding' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'emerging-tech', name: 'Emerging Tech' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 max-w-4xl pt-20 md:pt-28"
        >
            {/* Genre selector with improved responsiveness */}
            <motion.div
                className="mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="pb-4 text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Tech Insights Blog</h2>
                <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Filter by Topic:</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {genres.map((genre, index) => (
                            <motion.button
                                key={genre.id}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base transition-colors ${selectedGenre === (genre.id === 'all' ? null : genre.id)
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500'
                                    : 'bg-slate-800 text-gray-200 border-slate-700 hover:bg-slate-700'
                                    }`}
                                onClick={() => handleGenreChange(genre.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                disabled={loading}
                            >
                                {genre.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* Enhanced loading indicator with pulsing effect */}
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 sm:py-20"
                    >
                        <motion.div
                            className="relative"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 sm:border-4 border-fuchsia-500"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 0, 0.8]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    repeatDelay: 0.2
                                }}
                            />
                        </motion.div>
                        <p className="mt-4 text-gray-300 text-sm sm:text-base font-medium">
                            {isRetrying ? 'Retrying...' : 'Loading blog content...'}
                        </p>
                    </motion.div>
                )}

                {/* Enhanced error display */}
                {error && !loading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-slate-800 border border-red-500/30 text-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
                    >
                        <h3 className="font-bold text-lg mb-2 flex items-center text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Error
                        </h3>
                        <p className="mb-4">{error}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <motion.button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-500 transition-colors text-sm sm:text-base border border-fuchsia-400/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Try Again
                            </motion.button>
                            <motion.button
                                onClick={() => handleGenreChange('all')}
                                className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600 transition-colors text-sm sm:text-base border border-slate-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Reset to All Topics
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Blog content with enhanced animations */}
                {blog && !loading && !error && (
                    <motion.article
                        key={blog.id || 'blog-content'}
                        className="bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-700"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.h1
                            className="text-2xl sm:text-3xl font-bold px-4 sm:px-6 pt-4 sm:pt-6 pb-2 text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm text-gray-300 flex flex-wrap gap-2 sm:gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Posted on {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Category: {blog.genre.charAt(0).toUpperCase() + blog.genre.slice(1).replace('-', ' ')}
                            </span>
                        </motion.div>

                        <motion.div
                            className="mb-4 sm:mb-6 overflow-hidden"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 150 }}
                            >
                                <img
                                    src={blog.image}
                                    alt={blog.imageAlt || "Blog feature image"}
                                    className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-cover"
                                />
                            </motion.div>
                            {blog.imageCaption && (
                                <p className="text-xs sm:text-sm text-center text-gray-400 italic mt-2 px-4 sm:px-6">{blog.imageCaption}</p>
                            )}
                        </motion.div>

                        <motion.div
                            className="blog-content px-4 sm:px-6 pb-4 sm:pb-6 prose prose-sm sm:prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-a:text-cyan-400 prose-li:text-white prose-ul:text-white prose-ol:text-white prose-blockquote:text-gray-300 prose-code:text-cyan-300"
                            dangerouslySetInnerHTML={{ __html: blog.body }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        />

                        {/* Share section - New addition */}
                        <motion.div
                            className="px-4 sm:px-6 py-4 border-t border-slate-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Share this post:</h4>
                            <div className="flex space-x-3">
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-500 transition-colors"
                                    aria-label="Share on Twitter">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                                    aria-label="Share on Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                </a>
                                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                                    aria-label="Share on LinkedIn">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" clipRule="evenodd"></path></svg>
                                </a>
                            </div>
                        </motion.div>

                        {/* Enhanced related resources section */}
                        {blog.links && blog.links.length > 0 && (
                            <motion.div
                                className="px-4 sm:px-6 py-4 sm:py-6 bg-slate-900 border-t border-slate-700"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Related Resources</h3>
                                <ul className="space-y-3 sm:space-y-4">
                                    {blog.links.map((link, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                        >
                                            <motion.a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 hover:underline font-medium flex items-center"
                                                whileHover={{ x: 3 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                {link.title}
                                            </motion.a>
                                            {link.description && (
                                                <p className="text-gray-400 mt-1 ml-6 text-sm sm:text-base">{link.description}</p>
                                            )}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </motion.article>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Blog;