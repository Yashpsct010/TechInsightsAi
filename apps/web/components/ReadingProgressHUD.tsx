'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaRegBookmark, FaArrowUp, FaShareAlt, FaCheck } from 'react-icons/fa';

interface ReadingProgressHUDProps {
  targetRef: React.RefObject<HTMLElement | null>;
  totalReadingTime?: number;
  blogId?: string;
  blogTitle?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
}

export const ReadingProgressHUD: React.FC<ReadingProgressHUDProps> = ({
  targetRef,
  totalReadingTime = 3,
  blogId,
  blogTitle = '',
  isBookmarked = false,
  onBookmarkToggle,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('Overview');
  const [copied, setCopied] = useState<boolean>(false);

  // Framer Motion useScroll hook (listens on compositor thread with 0 layout thrashing)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Spring physics for buttery-smooth 60-120fps bar animation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Listen to scroll progress updates to update HUD telemetry
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const clamped = Math.max(0, Math.min(100, Math.round(latest * 100)));
      setProgressPercent(clamped);

      // Show floating capsule once user starts scrolling into the article content (> 3%)
      setIsVisible(latest > 0.03);

      if (clamped <= 4) {
        setActiveSection('Overview');
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  // Track active heading via native browser IntersectionObserver (0 CPU scroll cost)
  useEffect(() => {
    if (!targetRef.current) return;

    const headings = targetRef.current.querySelectorAll('h2, h3, h4');
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.textContent) {
            // Clean up heading text (remove markdown symbols or anchors)
            const cleanText = entry.target.textContent.replace(/^#+\s*/, '').trim();
            setActiveSection(cleanText);
          }
        });
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [targetRef, blogTitle, blogId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Dynamic remaining reading time calculation
  const remainingMinutes = Math.max(
    1,
    Math.ceil(totalReadingTime * (1 - progressPercent / 100))
  );

  return (
    <>
      {/* 1. Ultra-slim top edge neon streak (GPU hardware-accelerated) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ec5b13] via-[#ff7828] to-[#8b5cf6] z-50 origin-left shadow-[0_0_12px_rgba(236,91,19,0.7)] pointer-events-none"
        style={{ scaleX }}
      />

      {/* 2. Floating Cyber-Telemetry HUD Capsule (Bottom Center) */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 flex items-center select-none"
          >
            <div className="glass-shard bg-[#0a0a0c]/85 backdrop-blur-xl border border-[#ec5b13]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(236,91,19,0.2)] rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2.5 sm:gap-4 font-mono text-xs sm:text-sm text-slate-200">
              {/* Telemetry Beacon & Progress Dial */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec5b13] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ec5b13]" />
                </span>
                <span className="font-bold text-[#ec5b13] tracking-wider text-[11px] sm:text-xs">
                  {progressPercent >= 100 ? 'COMPLETE' : `${progressPercent}%`}
                </span>
              </div>

              {/* Divider */}
              <div className="h-3.5 w-[1px] bg-white/10" />

              {/* Active Node / Section Tracker (Truncated for clean aesthetics) */}
              <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs max-w-[160px] md:max-w-[220px] truncate">
                <span className="text-slate-600 font-bold shrink-0">NODE:</span>
                <span className="truncate text-slate-300 capitalize">
                  {activeSection.length > 25 ? `${activeSection.slice(0, 25)}…` : activeSection}
                </span>
              </div>

              {/* Divider (visible on sm+) */}
              <div className="hidden sm:block h-3.5 w-[1px] bg-white/10" />

              {/* Reading Velocity / Remaining Time */}
              <span className="text-slate-400 text-[11px] sm:text-xs shrink-0 tracking-tight">
                {progressPercent >= 100 ? 'ARCHIVED' : `~${remainingMinutes}m left`}
              </span>

              {/* Control Action Buttons */}
              <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                {/* Bookmark Toggle Button */}
                {onBookmarkToggle && (
                  <button
                    onClick={onBookmarkToggle}
                    className={`p-1.5 rounded-full transition-colors ${
                      isBookmarked
                        ? 'text-[#ec5b13] hover:text-[#ec5b13]/80'
                        : 'text-slate-400 hover:text-[#ec5b13]'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    aria-label="Bookmark article"
                  >
                    {isBookmarked ? (
                      <FaBookmark className="text-xs sm:text-sm text-[#ec5b13]" />
                    ) : (
                      <FaRegBookmark className="text-xs sm:text-sm" />
                    )}
                  </button>
                )}

                {/* Quick Share / Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-full text-slate-400 hover:text-[#06b6d4] transition-colors"
                  title={copied ? 'Link Copied!' : 'Copy Article Link'}
                  aria-label="Share article"
                >
                  {copied ? (
                    <FaCheck className="text-xs sm:text-sm text-green-400" />
                  ) : (
                    <FaShareAlt className="text-xs sm:text-sm" />
                  )}
                </button>

                {/* Jump To Top */}
                <button
                  onClick={scrollToTop}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Return to top"
                  aria-label="Scroll to top"
                >
                  <FaArrowUp className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReadingProgressHUD;
