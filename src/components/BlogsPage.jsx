import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBlogArchive } from './services/blogService';
import { formatDate } from './utils/formatters';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter states
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month', 'year'
    const [searchTerm, setSearchTerm] = useState('');

    // Available genre filters
    const genres = [
        { id: 'all', name: 'All Topics' },
        { id: 'tech-news', name: 'Tech News' },
        { id: 'ai-ml', name: 'AI & ML' },
        { id: 'coding', name: 'Coding' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'emerging-tech', name: 'Emerging Tech' },
        { id: 'general', name: 'General Tech' }
    ];

    // Date filter options
    const dateFilters = [
        { id: 'all', name: 'All Time' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' }
    ];

    useEffect(() => {
        fetchBlogs();
    }, [selectedGenre, dateFilter, currentPage]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construct the query parameters for filtering
            const genre = selectedGenre === 'all' ? null : selectedGenre;

            // Fetch blogs with filters
            const data = await fetchBlogArchive(currentPage, 9, genre);

            // Apply client-side date filtering
            let filteredBlogs = data.blogs;
            if (dateFilter !== 'all') {
                const now = new Date();
                const filterDate = new Date();

                if (dateFilter === 'week') {
                    filterDate.setDate(now.getDate() - 7);
                } else if (dateFilter === 'month') {
                    filterDate.setMonth(now.getMonth() - 1);
                } else if (dateFilter === 'year') {
                    filterDate.setFullYear(now.getFullYear() - 1);
                }

                filteredBlogs = filteredBlogs.filter(blog =>
                    new Date(blog.createdAt) >= filterDate
                );
            }

            // Apply search term filter if present
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                filteredBlogs = filteredBlogs.filter(blog =>
                    blog.title.toLowerCase().includes(term) ||
                    (blog.body && blog.body.toLowerCase().includes(term))
                );
            }

            setBlogs(filteredBlogs);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Failed to fetch blogs:", err);
            setError("Failed to load blogs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenreChange = (genre) => {
        setSelectedGenre(genre === 'all' ? null : genre);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleDateFilterChange = (filter) => {
        setDateFilter(filter);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBlogs();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 max-w-6xl pt-20 md:pt-28"
        >
            <div className="mb-8">
                <h1 className="text-3xl py-2 sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    All Tech Blogs
                </h1>

                {/* Search and filters section */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-8">
                    {/* Search form */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                type="submit"
                            >
                                Search
                            </motion.button>
                        </div>
                    </form>

                    {/* Filter sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Genre filter */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Filter by Topic:</h3>
                            <div className="flex flex-wrap gap-2">
                                {genres.map((genre) => (
                                    <button
                                        key={genre.id}
                                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${(selectedGenre === genre.id || (genre.id === 'all' && selectedGenre === null))
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        onClick={() => handleGenreChange(genre.id)}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date filter */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Filter by Date:</h3>
                            <div className="flex flex-wrap gap-2">
                                {dateFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${dateFilter === filter.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        onClick={() => handleDateFilterChange(filter.id)}
                                    >
                                        {filter.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blog cards section */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center py-20"
                        >
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg"
                        >
                            <h3 className="font-bold text-lg mb-2">Error</h3>
                            <p>{error}</p>
                            <button
                                onClick={fetchBlogs}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    ) : blogs.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16"
                        >
                            <h3 className="text-xl font-medium mb-2">No blogs found</h3>
                            <p className="text-gray-600">Try adjusting your filters or search terms</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {blogs.map((blog) => (
                                <motion.div
                                    key={blog._id}
                                    variants={item}
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                                >
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
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    {blog.genre.charAt(0).toUpperCase() + blog.genre.slice(1).replace('-', ' ')}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {formatDate(blog.createdAt)}
                                                </span>
                                            </div>
                                            <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                                                {blog.title}
                                            </h2>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="text-blue-600 text-sm font-medium">Read more</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Pagination */}
                {!loading && !error && blogs.length > 0 && (
                    <div className="mt-10 flex justify-center">
                        <nav className="flex flex-wrap items-center justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Previous
                            </button>

                            {(() => {
                                const pageButtons = [];
                                const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

                                // Always show first page
                                if (totalPages > 0) {
                                    pageButtons.push(
                                        <button
                                            key={1}
                                            onClick={() => setCurrentPage(1)}
                                            className={`px-3 py-1 rounded-md ${currentPage === 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            1
                                        </button>
                                    );
                                }

                                // Calculate range around current page
                                let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);

                                if (endPage - startPage < maxVisiblePages - 2) {
                                    startPage = Math.max(2, endPage - maxVisiblePages + 2);
                                }

                                // Add ellipsis if needed
                                if (startPage > 2) {
                                    pageButtons.push(
                                        <span key="ellipsis-start" className="px-2 py-1 text-gray-500">...</span>
                                    );
                                }

                                // Add pages around current page
                                for (let i = startPage; i <= endPage; i++) {
                                    pageButtons.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`px-3 py-1 rounded-md ${currentPage === i
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Add ellipsis if needed
                                if (endPage < totalPages - 1) {
                                    pageButtons.push(
                                        <span key="ellipsis-end" className="px-2 py-1 text-gray-500">...</span>
                                    );
                                }

                                // Always show last page if there is more than one page
                                if (totalPages > 1) {
                                    pageButtons.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                            className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pageButtons;
                            })()}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BlogsPage;
