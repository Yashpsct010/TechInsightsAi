'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFingerprint,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaExternalLinkAlt,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import NewsletterPopup from './NewsletterPopup';
import { CircuitReadingStreak } from './CircuitReadingStreak';
import { formatDate, calculateReadingTime } from '../utils/formatters';

export const Blog = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [uiSelectedGenre, setUiSelectedGenre] = useState<string>('all');
  const [imageError, setImageError] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const { user, toggleBookmark } = useAuth();
  const router = useRouter();
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const {
    data: blog,
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['latestBlog', selectedGenre],
    queryFn: () => blogService.fetchLatestBlog(selectedGenre),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  useEffect(() => {
    setImageError(false);
  }, [blog]);

  const handleGenreChange = (newGenre: string) => {
    setUiSelectedGenre(newGenre);
    setSelectedGenre(newGenre === 'all' ? null : newGenre);
  };

  const genres = [
    { id: 'all', name: 'All Topics' },
    { id: 'tech-news', name: 'Tech News' },
    { id: 'ai-ml', name: 'AI & ML' },
    { id: 'coding', name: 'Coding' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'emerging-tech', name: 'Emerging Tech' },
  ];

  const readingTime = calculateReadingTime(blog?.body);
  const isBookmarked = user && blog && user.bookmarks?.includes(blog._id || (blog as any).id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0a0a0c] text-slate-100 selection:bg-[#ec5b13] selection:text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Genre Filter */}
        <motion.div
          className="mb-8 sm:mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Latest_Insight
            </h2>
            <span className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
              Filter / Topic_Select
            </span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {genres.map((genre, index) => (
              <motion.button
                key={genre.id}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border ${
                  uiSelectedGenre === genre.id
                    ? 'bg-[#ec5b13] text-white border-[#ec5b13]'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
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
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ec5b13] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#8b5cf6]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.2 }}
                />
              </motion.div>
              <p className="mt-4 text-slate-500 text-sm font-mono uppercase tracking-wider">
                {isFetching ? 'Syncing_Data_Stream...' : 'Loading_Node...'}
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-red-500"
            >
              <h3 className="font-bold text-lg mb-2 flex items-center text-red-400 font-mono uppercase tracking-tight">
                <span className="mr-2">⚠</span> System_Error
              </h3>
              <p className="mb-4 text-slate-400">
                {(error as any)?.message || 'Failed to fetch node from archive.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <motion.button
                  onClick={() => refetch()}
                  className="px-5 py-2 bg-[#ec5b13] text-white rounded-lg hover:bg-[#ec5b13]/90 transition-colors text-sm font-mono uppercase tracking-tighter font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Retry_Connection
                </motion.button>
                <motion.button
                  onClick={() => handleGenreChange('all')}
                  className="px-5 py-2 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors text-sm font-mono uppercase tracking-tighter font-bold border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset_Filter
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Blog Content */}
          {blog && !loading && !error && (
            <motion.div
              key={blog._id || 'blog-content'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
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
                  <span>
                    {blog.genre.charAt(0).toUpperCase() +
                      blog.genre.slice(1).replace('-', ' ')}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-slate-100 tracking-tight mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {blog.title}
                </motion.h1>

                {/* Metadata Row */}
                <motion.div
                  className="flex flex-wrap items-center justify-between gap-4 pb-6 sm:pb-8 mb-8 sm:mb-10 border-b border-white/5 font-mono text-xs sm:text-sm text-slate-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
                  </div>

                  {user && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleBookmark(blog._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
                        isBookmarked
                          ? 'bg-[#ec5b13]/20 border-[#ec5b13]/50 text-[#ec5b13]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                      {isBookmarked ? 'Saved' : 'Save_Data'}
                    </motion.button>
                  )}
                </motion.div>

                {/* Featured Image */}
                {blog.image && !imageError && (
                  <motion.div
                    className="relative w-full rounded-2xl overflow-hidden mb-8 sm:mb-12 border border-white/10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 150 }}
                    >
                      <img
                        src={blog.image}
                        alt={blog.imageAlt || 'Blog feature image'}
                        className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-cover"
                        onError={() => setImageError(true)}
                      />
                    </motion.div>
                    {blog.imageCaption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 sm:p-6 md:p-8">
                        <p className="text-xs sm:text-sm font-mono text-slate-300 italic">
                          {blog.imageCaption}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Article Body with Circuit Reading Streak */}
                <div ref={contentWrapperRef} className="relative pl-7 sm:pl-10 md:pl-12">
                  <CircuitReadingStreak containerRef={contentWrapperRef} />
                  <motion.div
                    className="blog-content article-content text-slate-300 text-base sm:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.body }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                </div>

                {/* Share Section */}
                <motion.div
                  className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
                    Share_Protocol
                  </h4>
                  <div className="flex gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        blog.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </motion.div>

                {/* Related Resources */}
                {blog.links && blog.links.length > 0 && (
                  <motion.div
                    className="mt-10 sm:mt-14 p-5 sm:p-6 md:p-8 rounded-2xl bg-[#121212] border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white uppercase tracking-tight">
                      Related Resources
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {blog.links.map((link, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
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
                            <p className="text-slate-500 mt-1 ml-5 text-xs sm:text-sm">
                              {link.description}
                            </p>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
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
                          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
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
                          transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Security Level</span>
                      <span className="text-[#8b5cf6]">DEFCON-4</span>
                    </div>
                  </div>

                  <hr className="my-5 sm:my-6 border-white/5" />

                  <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-[#ec5b13]">📡</span> Related Insights
                  </h3>
                  <div className="space-y-4">
                    <p className="text-xs font-mono text-slate-500 italic">
                      Explore more data nodes in the archive.
                    </p>
                  </div>

                  <Link
                    href="/blogs"
                    className="w-full mt-6 sm:mt-8 py-3 rounded-xl bg-[#121212] border border-[#ec5b13]/30 text-[#ec5b13] font-bold text-xs uppercase tracking-widest hover:bg-[#ec5b13]/10 transition-all flex items-center justify-center gap-2"
                  >
                    <FaArrowRight className="text-xs" />
                    Access_Full_Archive
                  </Link>
                </div>

                {/* Join Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#ec5b13]/20 to-[#8b5cf6]/20 border border-white/10">
                  <h4 className="text-slate-100 font-bold mb-2 text-sm sm:text-base">
                    Join the Collective
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Get the latest architectural blueprints delivered directly to your neural
                    interface.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSubscribeOpen(true);
                      }}
                      className="w-full py-2 bg-[#ec5b13] text-white text-sm font-bold rounded-lg hover:bg-[#ec5b13]/90 transition-all font-mono uppercase tracking-wider"
                    >
                      SUBSCRIBE
                    </button>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <NewsletterPopup isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
    </motion.div>
  );
};

export default Blog;
