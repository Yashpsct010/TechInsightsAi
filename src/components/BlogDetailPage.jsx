import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from './utils/formatters';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBlog = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch blog by ID
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/blogs/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch blog: ${response.statusText}`);
                }

                const data = await response.json();
                setBlog(data);
            } catch (err) {
                console.error("Failed to load blog:", err);
                setError("We couldn't load this blog post. It might have been removed or doesn't exist.");
            } finally {
                setLoading(false);
            }
        };

        loadBlog();
    }, [id]);

    const handleBackClick = () => {
        navigate('/blogs');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 max-w-4xl pt-20 md:pt-28"
        >
            {/* Back button */}
            <motion.button
                onClick={handleBackClick}
                className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300"
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Blogs
            </motion.button>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
                </div>
            ) : error ? (
                <div className="bg-slate-800 border border-red-500/30 text-gray-100 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 text-red-400">Error</h3>
                    <p>{error}</p>
                    <button
                        onClick={handleBackClick}
                        className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-500 border border-fuchsia-400/30"
                    >
                        Go Back to Blog Archive
                    </button>
                </div>
            ) : blog ? (
                <motion.article
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-700"
                >
                    <motion.h1
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4 sm:px-6 pt-6 pb-3 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {blog.title}
                    </motion.h1>

                    <motion.div
                        className="px-4 sm:px-6 pb-4 text-sm text-gray-300 flex flex-wrap gap-2 sm:gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Posted on {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Category: {blog.genre.charAt(0).toUpperCase() + blog.genre.slice(1).replace('-', ' ')}
                        </span>
                    </motion.div>

                    <motion.div
                        className="mb-6 overflow-hidden"
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
                            <p className="text-sm text-center text-gray-400 italic mt-2 px-4 sm:px-6">{blog.imageCaption}</p>
                        )}
                    </motion.div>

                    <motion.div
                        className="blog-content px-4 sm:px-6 pb-6 prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-a:text-cyan-400 prose-li:text-white prose-ul:text-white prose-ol:text-white prose-blockquote:text-gray-300 prose-code:text-cyan-300"
                        dangerouslySetInnerHTML={{ __html: blog.body }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    />

                    {/* Related resources section */}
                    {blog.links && blog.links.length > 0 && (
                        <motion.div
                            className="px-4 sm:px-6 py-6 bg-slate-900 border-t border-slate-700"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-xl font-semibold mb-4 text-white">Related Resources</h3>
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
                                            className="text-cyan-400 hover:underline font-medium flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            {link.title}
                                        </a>
                                        {link.description && (
                                            <p className="text-gray-400 mt-1 ml-6">{link.description}</p>
                                        )}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Share and navigation section */}
                    <motion.div
                        className="px-4 sm:px-6 py-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="mb-4 sm:mb-0">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Share this post:</h4>
                            <div className="flex space-x-3">
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-500"
                                    aria-label="Share on Twitter">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500"
                                    aria-label="Share on Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                </a>
                                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-600"
                                    aria-label="Share on LinkedIn">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" clipRule="evenodd"></path></svg>
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={handleBackClick}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors flex items-center border border-cyan-400/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Blogs
                        </button>
                    </motion.div>
                </motion.article>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-medium mb-2 text-white">Blog not found</h3>
                    <p className="text-gray-300 mb-6">We couldn't find the blog post you're looking for.</p>
                    <button
                        onClick={handleBackClick}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors border border-cyan-400/30"
                    >
                        View All Blogs
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default BlogDetailPage;
