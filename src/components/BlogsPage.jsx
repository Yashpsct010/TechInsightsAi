import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaBookmark, FaRegBookmark, FaCalendarAlt, FaClock, FaSearch } from 'react-icons/fa';
import { fetchBlogArchive } from './services/blogService';
import { formatDate } from './utils/formatters';
import { useAuth } from '../context/AuthContext';

const BlogsPage = () => {
    const { user, toggleBookmark } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [failedImages, setFailedImages] = useState(new Set());

    // Filter states
    const defaultGenre = user && user.preferences?.length > 0 ? 'for-you' : 'all';
    const [selectedGenre, setSelectedGenre] = useState(defaultGenre);
    const [dateFilter, setDateFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Available genre filters
    const baseGenres = [
        { id: 'all', name: 'All Topics' },
        { id: 'tech-news', name: 'Tech News' },
        { id: 'ai-ml', name: 'AI & ML' },
        { id: 'coding', name: 'Coding' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'emerging-tech', name: 'Emerging Tech' },
        { id: 'general', name: 'General Tech' }
    ];

    const genres = user && user.preferences?.length > 0
        ? [{ id: 'for-you', name: 'For You' }, ...baseGenres]
        : baseGenres;

    // Date filter options
    const dateFilters = [
        { id: 'all', name: 'All Time' },
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'year', name: 'This Year' }
    ];

    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGenre, dateFilter, currentPage, user?.preferences]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const genre = (selectedGenre === 'all' || selectedGenre === 'for-you') ? null : selectedGenre;
            const term = searchTerm.trim() ? searchTerm.trim() : null;
            const date = dateFilter === 'all' ? null : dateFilter;
            const preferredGenres = selectedGenre === 'for-you' && user ? user.preferences : null;

            const data = await fetchBlogArchive(currentPage, 9, genre, term, date, preferredGenres);

            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
            setFailedImages(new Set());
        } catch (err) {
            console.error("Failed to fetch blogs:", err);
            setError("Failed to load blogs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenreChange = (genre) => {
        setSelectedGenre(genre === 'all' ? null : genre);
        setCurrentPage(1);
    };

    const handleDateFilterChange = (filter) => {
        setDateFilter(filter);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBlogs();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleBookmark = async (e, blogId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            return;
        }
        try {
            await toggleBookmark(blogId);
        } catch (err) {
            console.error("Failed to toggle bookmark", err);
        }
    };

    const handleImageError = (blogId) => {
        setFailedImages(prev => new Set(prev).add(blogId));
    };

    const readingTime = (body) => {
        if (!body) return 0;
        return Math.max(1, Math.ceil(body.replace(/<[^>]*>/g, '').split(/\s+/).length / 200));
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

    // Get the featured (first) blog and the rest
    const featuredBlog = blogs.length > 0 ? blogs[0] : null;
    const restBlogs = blogs.length > 1 ? blogs.slice(1) : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-16 sm:pt-20 md:pt-24 selection:bg-[#ec5b13] selection:text-white"
        >
            {/* Hero Section */}
            <section className="relative py-10 sm:py-14 md:py-20 px-4 sm:px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#ec5b13]/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter mb-6 sm:mb-8 glitch-text"
                    >
                        THE <span className="text-[#ec5b13]">FEED</span>
                    </motion.h1>

                    {/* Search Bar */}
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="max-w-2xl mx-auto mb-8 sm:mb-10"
                    >
                        <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
                            <span className="text-[#ec5b13] font-mono text-lg pl-4 pr-2 hidden sm:block">›</span>
                            <input
                                type="text"
                                placeholder="Execute_Search_Query ..."
                                className="grow bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base font-mono text-white placeholder:text-slate-600 focus:outline-none min-w-0"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button
                                type="submit"
                                className="p-3 sm:p-4 text-slate-400 hover:text-[#ec5b13] transition-colors shrink-0"
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </motion.form>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
                {/* Filter Section */}
                <motion.div
                    className="mb-8 sm:mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Genre Filters */}
                    <div className="mb-4 sm:mb-6">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {genres.map((genre, index) => (
                                <motion.button
                                    key={genre.id}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border ${(selectedGenre === genre.id || (genre.id === 'all' && selectedGenre === null))
                                        ? 'bg-[#ec5b13] text-white border-[#ec5b13]'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    onClick={() => handleGenreChange(genre.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + index * 0.03 }}
                                >
                                    {genre.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {dateFilters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border ${dateFilter === filter.id
                                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                                onClick={() => handleDateFilterChange(filter.id)}
                            >
                                {filter.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Blog Content */}
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
                            <p className="mt-4 text-slate-500 text-sm font-mono uppercase tracking-wider">Syncing_Data_Stream...</p>
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
                            <h3 className="font-bold text-lg mb-2 text-red-400 font-mono uppercase tracking-tight">
                                <span className="mr-2">⚠</span> System_Error
                            </h3>
                            <p className="text-slate-400 mb-4">{error}</p>
                            <motion.button
                                onClick={fetchBlogs}
                                className="px-5 py-2 bg-[#ec5b13] text-white rounded-lg hover:bg-[#ec5b13]/90 transition-colors text-sm font-mono uppercase tracking-tighter font-bold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Retry_Connection
                            </motion.button>
                        </motion.div>
                    ) : blogs.length === 0 ? (
                        /* No Results */
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 sm:py-24"
                        >
                            <h3 className="text-xl sm:text-2xl font-black mb-3 text-white uppercase tracking-tighter">No_Data_Found</h3>
                            <p className="text-slate-500 font-mono text-sm">Adjust filters or search parameters to locate data nodes.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`results-${currentPage}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Featured Blog (first blog) */}
                            {featuredBlog && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                    className="mb-8 sm:mb-10"
                                >
                                    {/* Trending Signal */}
                                    <div className="flex items-center gap-2 mb-4 font-mono text-xs text-[#ec5b13] uppercase tracking-widest">
                                        <span className="flex h-2 w-2 rounded-full bg-[#ec5b13] animate-pulse" />
                                        // TRENDING_SIGNAL_DETECTED
                                    </div>

                                    <Link to={`/blog/${featuredBlog._id}`} className="block group">
                                        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.5/1] rounded-2xl overflow-hidden border border-white/10 bg-[#121212]">
                                            {/* Bookmark Button */}
                                            {user && (
                                                <button
                                                    onClick={(e) => handleBookmark(e, featuredBlog._id)}
                                                    className={`absolute top-4 right-4 z-20 p-2 rounded-lg backdrop-blur-sm transition-all ${user?.bookmarks?.includes(featuredBlog._id)
                                                        ? 'text-[#ec5b13] bg-[#ec5b13]/20 border border-[#ec5b13]/30'
                                                        : 'text-white/70 bg-black/40 border border-white/20 hover:text-[#ec5b13] hover:bg-[#ec5b13]/20'
                                                        }`}
                                                    title={user?.bookmarks?.includes(featuredBlog._id) ? "Remove Bookmark" : "Save Bookmark"}
                                                >
                                                    {user?.bookmarks?.includes(featuredBlog._id) ? (
                                                        <FaBookmark className="text-sm sm:text-base" />
                                                    ) : (
                                                        <FaRegBookmark className="text-sm sm:text-base" />
                                                    )}
                                                </button>
                                            )}

                                            {featuredBlog.image && !failedImages.has(featuredBlog._id) ? (
                                                <img
                                                    src={featuredBlog.image}
                                                    alt={featuredBlog.imageAlt || featuredBlog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    onError={() => handleImageError(featuredBlog._id)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#ec5b13]/20 to-[#8b5cf6]/20" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                                                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                                                    <span className="px-2 py-1 bg-[#ec5b13] text-white text-[10px] sm:text-xs font-mono uppercase rounded">
                                                        {featuredBlog.genre.charAt(0).toUpperCase() + featuredBlog.genre.slice(1).replace('-', ' ')}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-3 sm:mb-4">
                                                    {featuredBlog.title}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono text-[10px] sm:text-xs text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-[#8b5cf6]" />
                                                        <span>Timestamp: {formatDate(featuredBlog.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FaClock className="text-[#8b5cf6]" />
                                                        <span>ID: #{featuredBlog._id?.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Blog Cards Grid */}
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                            >
                                {restBlogs.map((blog) => {
                                    const isBookmarked = user?.bookmarks?.includes(blog._id);
                                    const hasValidImage = blog.image && !failedImages.has(blog._id);

                                    return (
                                        <motion.div
                                            key={blog._id}
                                            variants={item}
                                            className="glass-panel rounded-2xl overflow-hidden group hover:border-[#ec5b13]/30 transition-all duration-500 relative"
                                        >
                                            {/* Bookmark Button */}
                                            {user && (
                                                <button
                                                    onClick={(e) => handleBookmark(e, blog._id)}
                                                    className={`absolute top-3 right-3 z-10 p-2 rounded-lg backdrop-blur-sm transition-all ${isBookmarked
                                                        ? 'text-[#ec5b13] bg-[#ec5b13]/10 border border-[#ec5b13]/20'
                                                        : 'text-white/50 bg-black/30 border border-white/10 hover:text-[#ec5b13] hover:bg-[#ec5b13]/10'
                                                        }`}
                                                    title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                                                >
                                                    {isBookmarked ? (
                                                        <FaBookmark className="text-sm" />
                                                    ) : (
                                                        <FaRegBookmark className="text-sm" />
                                                    )}
                                                </button>
                                            )}

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
                                                    {/* Protocol Tag */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="px-2 py-0.5 bg-[#06b6d4]/10 text-[#06b6d4] text-[10px] font-mono uppercase rounded border border-[#06b6d4]/20">
                                                            {blog.genre.charAt(0).toUpperCase() + blog.genre.slice(1).replace('-', ' ')}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h2 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 line-clamp-2 text-white uppercase tracking-tight leading-snug group-hover:text-[#ec5b13] transition-colors">
                                                        {blog.title}
                                                    </h2>

                                                    {/* Excerpt */}
                                                    {blog.body && (
                                                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                                            {blog.body.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                                        </p>
                                                    )}

                                                    {/* Bottom Metadata */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest">
                                                        <span>Read_Time: {readingTime(blog.body)}m</span>
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

                            {/* Stats Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="mt-10 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-[#121212] border border-white/10"
                            >
                                <div>
                                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">System_Status</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-green-500 uppercase tracking-tighter italic">Operational</span>
                                </div>
                                <div>
                                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Active_Nodes</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tighter">{(blogs.length * 1602).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Data_Ingested</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-[#ec5b13] tracking-tighter">4.2 PB/Day</span>
                                </div>
                                <div>
                                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Last_Sync</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tighter">0.4 MS AGO</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {!loading && !error && blogs.length > 0 && (
                    <div className="mt-10 sm:mt-12 flex justify-center">
                        <nav className="flex flex-wrap items-center justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${currentPage === 1
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                            >
                                Prev
                            </button>

                            {(() => {
                                const pageButtons = [];
                                const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

                                if (totalPages > 0) {
                                    pageButtons.push(
                                        <button
                                            key={1}
                                            onClick={() => setCurrentPage(1)}
                                            className={`px-3 py-2 rounded-lg font-mono text-xs transition-all ${currentPage === 1
                                                ? 'bg-[#ec5b13] text-white border border-[#ec5b13]'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            1
                                        </button>
                                    );
                                }

                                let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);

                                if (endPage - startPage < maxVisiblePages - 2) {
                                    startPage = Math.max(2, endPage - maxVisiblePages + 2);
                                }

                                if (startPage > 2) {
                                    pageButtons.push(
                                        <span key="ellipsis-start" className="px-2 py-1 text-slate-600 font-mono text-xs">...</span>
                                    );
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pageButtons.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`px-3 py-2 rounded-lg font-mono text-xs transition-all ${currentPage === i
                                                ? 'bg-[#ec5b13] text-white border border-[#ec5b13]'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages - 1) {
                                    pageButtons.push(
                                        <span key="ellipsis-end" className="px-2 py-1 text-slate-600 font-mono text-xs">...</span>
                                    );
                                }

                                if (totalPages > 1) {
                                    pageButtons.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                            className={`px-3 py-2 rounded-lg font-mono text-xs transition-all ${currentPage === totalPages
                                                ? 'bg-[#ec5b13] text-white border border-[#ec5b13]'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
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
                                className={`px-3 sm:px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${currentPage === totalPages
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
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
