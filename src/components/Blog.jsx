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
                <h2 className="pb-4 text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Tech Insights Blog</h2>
                <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Filter by Topic:</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {genres.map((genre, index) => (
                            <motion.button
                                key={genre.id}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base transition-colors ${selectedGenre === (genre.id === 'all' ? null : genre.id)
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 sm:border-4 border-blue-300"
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
                        <p className="mt-4 text-gray-600 text-sm sm:text-base font-medium">
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
                        className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-6 rounded-lg shadow-md"
                    >
                        <h3 className="font-bold text-lg mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Error
                        </h3>
                        <p className="mb-4">{error}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <motion.button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Try Again
                            </motion.button>
                            <motion.button
                                onClick={() => handleGenreChange('all')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
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
                        className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.h1
                            className="text-2xl sm:text-3xl font-bold px-4 sm:px-6 pt-4 sm:pt-6 pb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm text-gray-500 flex flex-wrap gap-2 sm:gap-4"
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
                                <p className="text-xs sm:text-sm text-center text-gray-500 italic mt-2 px-4 sm:px-6">{blog.imageCaption}</p>
                            )}
                        </motion.div>

                        <motion.div
                            className="blog-content px-4 sm:px-6 pb-4 sm:pb-6 prose prose-sm sm:prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.body }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        />

                        {/* Enhanced related resources section */}
                        {blog.links && blog.links.length > 0 && (
                            <motion.div
                                className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50 border-t border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Related Resources</h3>
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
                                                className="text-blue-600 hover:underline font-medium flex items-center"
                                                whileHover={{ x: 3 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                {link.title}
                                            </motion.a>
                                            {link.description && (
                                                <p className="text-gray-600 mt-1 ml-6 text-sm sm:text-base">{link.description}</p>
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