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
            className="container mx-auto px-4 py-8 max-w-4xl pt-24 md:pt-28"
        >
            {/* Genre selector - unchanged */}
            <motion.div
                className="mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Tech Insights Blog</h2>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">Filter by Topic:</h3>
                    <div className="flex flex-wrap gap-3">
                        {genres.map((genre, index) => (
                            <motion.button
                                key={genre.id}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                    selectedGenre === (genre.id === 'all' ? null : genre.id)
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
                {/* Improved loading indicator */}
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <motion.div
                            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <p className="mt-4 text-gray-600">
                            {isRetrying ? 'Retrying...' : 'Loading blog content...'}
                        </p>
                    </motion.div>
                )}

                {/* Enhanced error display with retry button */}
                {error && !loading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-md"
                    >
                        <h3 className="font-bold text-lg mb-2">Error</h3>
                        <p>{error}</p>
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => handleGenreChange('all')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Reset to All Topics
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Blog content display - unchanged */}
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
                            className="text-3xl font-bold px-6 pt-6 pb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            className="px-6 pb-4 text-sm text-gray-500 flex flex-wrap gap-4"
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
                            className="mb-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <img
                                src={blog.image}
                                alt={blog.imageAlt || "Blog feature image"}
                                className="w-full h-auto max-h-[500px] object-cover"
                            />
                            {blog.imageCaption && (
                                <p className="text-sm text-center text-gray-500 italic mt-2 px-6">{blog.imageCaption}</p>
                            )}
                        </motion.div>

                        <motion.div
                            className="px-6 pb-6 prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.body }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        />

                        {blog.links && blog.links.length > 0 && (
                            <motion.div
                                className="px-6 py-6 bg-gray-50 border-t border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="text-xl font-semibold mb-4">Related Resources</h3>
                                <ul className="space-y-4">
                                    {blog.links.map((link, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                        >
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-medium flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                {link.title}
                                            </a>
                                            {link.description && (
                                                <p className="text-gray-600 mt-1 ml-6">{link.description}</p>
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