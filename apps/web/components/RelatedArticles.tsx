'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FaClock, FaCalendarAlt, FaArrowRight, FaLayerGroup } from 'react-icons/fa';
import { formatDate } from '../utils/formatters';

interface RelatedArticlesProps {
  currentBlogId: string;
  genre?: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentBlogId, genre }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['relatedBlogs', genre, currentBlogId],
    queryFn: async () => {
      // Fetch articles for this genre first
      const genreParam = genre && genre !== 'all' ? `genre=${encodeURIComponent(genre)}&` : '';
      const res = await fetch(`/api/blogs?${genreParam}limit=5`);
      if (!res.ok) throw new Error('Failed to fetch related blogs');
      const json = await res.json();
      let blogs = (json.blogs || []).filter((b: any) => b._id !== currentBlogId);

      // If we don't have at least 3 articles, fetch recent overall
      if (blogs.length < 3) {
        const fallbackRes = await fetch('/api/blogs?limit=6');
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          const fallbackBlogs = (fallbackJson.blogs || []).filter((b: any) => b._id !== currentBlogId);
          const combined = [...blogs, ...fallbackBlogs];
          // Dedup by _id
          const seen = new Set();
          blogs = combined.filter((item) => {
            if (seen.has(item._id)) return false;
            seen.add(item._id);
            return true;
          });
        }
      }

      return blogs.slice(0, 3);
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const blogs = data || [];

  if (!isLoading && blogs.length === 0) {
    return null;
  }

  return (
    <div className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-white/10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#ec5b13] mb-1">
            <FaLayerGroup className="text-xs" />
            <span>Next_In_Feed // Related Intelligence</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Continue Reading Intelligence Nodes
          </h3>
        </div>

        <Link
          href="/blogs"
          className="hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-[#ec5b13] transition-colors"
        >
          <span>View Archive</span>
          <FaArrowRight className="text-[10px]" />
        </Link>
      </div>

      {/* Grid of 3 Related Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse p-6"
              />
            ))
          : blogs.map((article: any, index: number) => {
              const snippet = article.body
                ? article.body.replace(/<[^>]*>/g, '').substring(0, 110)
                : '';
              const readingTime = article.body
                ? Math.max(1, Math.ceil(article.body.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))
                : 3;

              return (
                <motion.article
                  key={article._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#121217] hover:bg-[#16161e] border border-white/10 hover:border-[#ec5b13]/50 transition-all shadow-lg hover:shadow-[#ec5b13]/10"
                >
                  <div>
                    {/* Meta pill row */}
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-3">
                      <span className="uppercase text-[#8b5cf6] font-bold">
                        {article.genre || 'TECH'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <FaClock className="text-[10px]" />
                        {readingTime}m read
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-white group-hover:text-[#ec5b13] transition-colors line-clamp-2 leading-snug mb-2">
                      <Link href={`/blog/${article._id}`} className="focus:outline-none">
                        {article.title}
                      </Link>
                    </h4>

                    {/* Snippet */}
                    {snippet && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {snippet}...
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500">
                      {formatDate(article.createdAt)}
                    </span>
                    <Link
                      href={`/blog/${article._id}`}
                      className="font-mono text-xs uppercase font-bold text-[#ec5b13] group-hover:translate-x-1 transition-transform flex items-center gap-1.5"
                    >
                      <span>Read Node</span>
                      <FaArrowRight className="text-[10px]" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
      </div>
    </div>
  );
};

export default RelatedArticles;
