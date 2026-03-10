import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFingerprint, FaCalendarAlt, FaClock, FaArrowLeft, FaArrowRight, FaExternalLinkAlt, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { formatDate } from './utils/formatters';
import { useBlogById } from './hooks/useBlogById';
import { useAuth } from '../context/AuthContext';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { blog, loading, error } = useBlogById(id);
    const { user, toggleBookmark } = useAuth();

    const handleBackClick = () => {
        navigate('/blogs');
    };

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        await toggleBookmark(blog._id);
    };

    const isBookmarked = user?.bookmarks?.includes(blog?._id);
    const readingTime = blog?.body ? Math.max(1, Math.ceil(blog.body.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) : 0;
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-16 sm:pt-20 md:pt-28 selection:bg-[#ec5b13] selection:text-white"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Back Button */}
                <motion.button
                    onClick={handleBackClick}
                    className="mb-6 sm:mb-8 flex items-center gap-2 text-slate-400 hover:text-[#ec5b13] font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors group"
                    whileHover={{ x: -3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
                    Back_To_Archive
                </motion.button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
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
                    </div>
                ) : error ? (
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-red-500">
                        <h3 className="font-bold text-lg mb-2 text-red-400 font-mono uppercase tracking-tight">
                            <span className="mr-2">⚠</span> System_Error
                        </h3>
                        <p className="text-slate-400 mb-4">{error}</p>
                        <motion.button
                            onClick={handleBackClick}
                            className="px-5 py-2 bg-[#ec5b13] text-white rounded-lg hover:bg-[#ec5b13]/90 transition-colors text-sm font-mono uppercase tracking-tighter font-bold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Return_To_Archive
                        </motion.button>
                    </div>
                ) : blog ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                    >
                        {/* Main Article */}
                        <article className="lg:col-span-8">
                            {/* Protocol Tags */}
                            <motion.div
                                className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs text-[#06b6d4] uppercase tracking-widest mb-4 sm:mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="px-2 py-1 bg-[#06b6d4]/10 rounded border border-[#06b6d4]/20">
                                    Protocol: 0x{new Date(blog.createdAt).getFullYear()}
                                </span>
                                <span className="text-slate-500">//</span>
                                <span>{blog.genre.charAt(0).toUpperCase() + blog.genre.slice(1).replace('-', ' ')}</span>
                            </motion.div>

                            {/* Title + Bookmark */}
                            <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <motion.h1
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-slate-100 tracking-tight grow"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {blog.title}
                                </motion.h1>
                                <button
                                    onClick={handleBookmark}
                                    className={`shrink-0 mt-1 sm:mt-2 p-2 sm:p-2.5 rounded-xl border transition-all ${isBookmarked
                                        ? 'text-[#ec5b13] bg-[#ec5b13]/10 border-[#ec5b13]/20'
                                        : 'text-slate-500 hover:text-[#ec5b13] bg-white/5 border-white/10 hover:bg-[#ec5b13]/10'
                                        }`}
                                    title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                                >
                                    {isBookmarked ? <FaBookmark className="text-lg sm:text-xl" /> : <FaRegBookmark className="text-lg sm:text-xl" />}
                                </button>
                            </div>

                            {/* Metadata Row */}
                            <motion.div
                                className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6 sm:pb-8 mb-8 sm:mb-10 border-b border-white/5 font-mono text-xs sm:text-sm text-slate-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="flex items-center gap-2">
                                    <FaFingerprint className="text-[#8b5cf6]" />
                                    <span>Auth: TechInsights_AI</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#8b5cf6]" />
                                    <span>Timestamp: {formatDate(blog.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-[#8b5cf6]" />
                                    <span>{readingTime} Min Read</span>
                                </div>
                            </motion.div>

                            {/* Featured Image */}
                            {blog.image && !imageError && (
                                <motion.div
                                    className="relative w-full rounded-2xl overflow-hidden mb-8 sm:mb-12 border border-white/10"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <img
                                        src={blog.image}
                                        alt={blog.imageAlt || "Blog feature image"}
                                        className="w-full h-auto max-h-[500px] object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                    {blog.imageCaption && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 sm:p-6 md:p-8">
                                            <p className="text-xs sm:text-sm font-mono text-slate-300 italic">{blog.imageCaption}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Article Body */}
                            <motion.div
                                className="blog-content article-content text-slate-300 text-base sm:text-lg leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: blog.body }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            />

                            {/* Related Resources */}
                            {blog.links && blog.links.length > 0 && (
                                <motion.div
                                    className="mt-10 sm:mt-14 p-5 sm:p-6 md:p-8 rounded-2xl bg-[#121212] border border-white/10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white uppercase tracking-tight">Related Resources</h3>
                                    <ul className="space-y-3 sm:space-y-4">
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
                                                    className="text-[#06b6d4] hover:text-[#ec5b13] font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
                                                >
                                                    <FaExternalLinkAlt className="text-xs shrink-0" />
                                                    {link.title}
                                                </a>
                                                {link.description && (
                                                    <p className="text-slate-500 mt-1 ml-5 text-xs sm:text-sm">{link.description}</p>
                                                )}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Share + Back */}
                            <motion.div
                                className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div>
                                    <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Share_Protocol</h4>
                                    <div className="flex gap-3">
                                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors"
                                            aria-label="Share on Twitter">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                        </a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors"
                                            aria-label="Share on Facebook">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                        </a>
                                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors"
                                            aria-label="Share on LinkedIn">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" clipRule="evenodd"></path></svg>
                                        </a>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={handleBackClick}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-all font-mono text-xs sm:text-sm uppercase tracking-tighter font-bold"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FaArrowLeft className="text-xs" />
                                    Back_To_Archive
                                </motion.button>
                            </motion.div>
                        </article>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-6 sm:space-y-8">
                            <div className="glass-panel p-5 sm:p-6 rounded-2xl lg:sticky lg:top-28">
                                {/* System Status */}
                                <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="text-[#ec5b13]">⚡</span> System Status
                                </h3>
                                <div className="space-y-3 sm:space-y-4 font-mono text-xs">
                                    <div>
                                        <div className="flex justify-between items-center text-slate-400 mb-1.5">
                                            <span>Core Integrity</span>
                                            <span className="text-green-500">99.8%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <motion.div
                                                className="bg-green-500 h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '99.8%' }}
                                                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-slate-400 mb-1.5">
                                            <span>Logic Load</span>
                                            <span className="text-[#06b6d4]">1.2 PetaFLOP/s</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <motion.div
                                                className="bg-[#06b6d4] h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '65%' }}
                                                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Security Level</span>
                                        <span className="text-[#8b5cf6]">DEFCON-4</span>
                                    </div>
                                </div>

                                <hr className="my-5 sm:my-6 border-white/5" />

                                {/* Browse Archive */}
                                <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="text-[#ec5b13]">📡</span> Data Nexus
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-xs font-mono text-slate-500 italic">Browse more insights in the archive.</p>
                                </div>

                                <Link
                                    to="/blogs"
                                    className="w-full mt-6 sm:mt-8 py-3 rounded-xl bg-[#121212] border border-[#ec5b13]/30 text-[#ec5b13] font-bold text-xs uppercase tracking-widest hover:bg-[#ec5b13]/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaArrowRight className="text-xs" />
                                    Access_Full_Archive
                                </Link>
                            </div>

                            {/* Join Card */}
                            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#ec5b13]/20 to-[#8b5cf6]/20 border border-white/10">
                                <h4 className="text-slate-100 font-bold mb-2 text-sm sm:text-base">Join the Collective</h4>
                                <p className="text-sm text-slate-400 mb-4">Get the latest architectural blueprints delivered directly to your neural interface.</p>
                                <div className="space-y-2">
                                    <input
                                        className="w-full bg-[#121212]/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-[#ec5b13] focus:border-[#ec5b13] outline-none font-mono placeholder:text-slate-600"
                                        placeholder="Email@Network.io"
                                        type="email"
                                    />
                                    <button className="w-full py-2 bg-[#ec5b13] text-white text-sm font-bold rounded-lg hover:bg-[#ec5b13]/90 transition-all font-mono uppercase tracking-wider">
                                        SUBSCRIBE
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </motion.div>
                ) : (
                    <div className="text-center py-16 sm:py-24">
                        <h3 className="text-xl sm:text-2xl font-black mb-3 text-white uppercase tracking-tighter">Node_Not_Found</h3>
                        <p className="text-slate-500 mb-6 font-mono text-sm">The requested data node could not be located in the archive.</p>
                        <motion.button
                            onClick={handleBackClick}
                            className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white px-6 py-3 rounded-xl transition-all font-mono text-sm uppercase tracking-tighter font-bold"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Return_To_Archive
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BlogDetailPage;
