'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface CircuitNode {
  id: string;
  title: string;
  top: number;
  percent: number;
  index: number;
}

interface CircuitReadingStreakProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export const CircuitReadingStreak: React.FC<CircuitReadingStreakProps> = ({ containerRef }) => {
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [readPercent, setReadPercent] = useState<number>(0);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Framer Motion scroll tracker strictly scoped to the article body container
  const { scrollYProgress } = useScroll({
    target: containerRef as any,
    offset: ['start 140px', 'end 80%'],
  });

  // Spring physics for buttery-smooth 60-120fps glide
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  // GPU-driven streak height and beacon position transforms
  const streakHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const beaconTop = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // Extract all <h2> headings and calculate their exact vertical circuit positions
  const scanHeadings = () => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll('h2');
    const totalHeight = container.scrollHeight || container.offsetHeight;
    if (!totalHeight || headings.length === 0) {
      setNodes([]);
      return;
    }

    const calculated: CircuitNode[] = [];
    headings.forEach((h2, idx) => {
      if (!h2.id) {
        h2.id = `circuit-node-${idx + 1}`;
      }
      const cleanTitle = h2.textContent?.replace(/^#+\s*/, '').trim() || `Node 0${idx + 1}`;
      const top = h2.offsetTop;
      const percent = Math.min(100, Math.max(0, (top / totalHeight) * 100));

      calculated.push({
        id: h2.id,
        title: cleanTitle,
        top,
        percent,
        index: idx + 1,
      });
    });

    setNodes(calculated);
  };

  useEffect(() => {
    // Initial scan
    scanHeadings();

    // Re-calculate on resize
    const handleResize = () => scanHeadings();
    window.addEventListener('resize', handleResize);

    // Watch for DOM changes inside article
    let observer: MutationObserver | null = null;
    if (containerRef.current) {
      observer = new MutationObserver(() => scanHeadings());
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [containerRef]);

  // Track scroll progress to update telemetry and active node
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const clamped = Math.max(0, Math.min(100, Math.round(latest * 100)));
      setReadPercent(clamped);

      // Determine active section node
      if (nodes.length > 0) {
        let active: string | null = null;
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (clamped >= nodes[i].percent - 3) {
            active = nodes[i].id;
            break;
          }
        }
        setActiveNodeId(active);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, nodes]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="absolute top-0 bottom-0 left-1 sm:left-2 md:left-3 w-8 sm:w-10 select-none z-10"
      aria-hidden="true"
    >
      {/* 1. Header Circuit Terminal (PWR_IN // 0x00) */}
      <div className="absolute top-0 left-[9px] -translate-x-1/2 flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-sm bg-[#0a0a0c] border border-[#ec5b13]/60 shadow-[0_0_6px_rgba(236,91,19,0.4)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#ec5b13]" />
        </div>
        <span className="font-mono text-[8px] text-[#ec5b13]/60 tracking-widest mt-1 hidden sm:block">
          PWR
        </span>
      </div>

      {/* 2. Inactive Background Circuit Rail (Dashed Cyber Wire) */}
      <div className="absolute top-3 bottom-6 left-[9px] w-[2px] -translate-x-1/2 bg-white/5 border-l border-dashed border-[#ec5b13]/20" />

      {/* 3. Dynamic Glowing Neon Laser Streak (Framer Motion scale/height) */}
      <motion.div
        className="absolute top-3 left-[9px] w-[2.5px] -translate-x-1/2 bg-gradient-to-b from-[#ec5b13] via-[#ff7828] to-[#ec5b13] shadow-[0_0_10px_#ec5b13,0_0_20px_rgba(236,91,19,0.7)] rounded-full origin-top"
        style={{ height: streakHeight }}
      />

      {/* 4. Traveling Beacon (Circuit Cursor / Glowing Node) */}
      <motion.div
        className="absolute left-[9px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center"
        style={{ top: beaconTop }}
      >
        {/* Pulsing Beacon Halo */}
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-[#ec5b13] opacity-60" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0a0a0c] border-2 border-[#ec5b13] shadow-[0_0_10px_#ec5b13] items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
          </span>
        </div>

        {/* Micro Telemetry Coordinate Pill */}
        <div className="hidden sm:flex items-center gap-1 ml-2 font-mono text-[9px] text-[#ec5b13] font-bold tracking-tight bg-[#0a0a0c]/90 px-1.5 py-0.5 rounded border border-[#ec5b13]/40 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap">
          <span>{readPercent}%</span>
        </div>
      </motion.div>

      {/* 5. Circuit Section Milestone Nodes */}
      {nodes.map((node) => {
        const isReached = readPercent >= node.percent - 2;
        const isActive = activeNodeId === node.id;

        return (
          <div
            key={node.id}
            className="absolute left-[9px] -translate-x-1/2 flex items-center pointer-events-auto"
            style={{ top: `${node.top}px` }}
          >
            {/* Clickable Junction Pad */}
            <button
              onClick={() => scrollToHeading(node.id)}
              title={`Jump to: ${node.title}`}
              aria-label={`Jump to section ${node.title}`}
              className={`group relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all duration-300 font-mono text-[9px] sm:text-[10px] font-bold cursor-pointer ${
                isReached
                  ? 'bg-[#ec5b13] text-[#0a0a0c] border border-[#ff7828] shadow-[0_0_12px_rgba(236,91,19,0.85)] scale-105'
                  : 'bg-[#0e0e12] text-slate-500 border border-white/15 hover:border-[#ec5b13]/60 hover:text-slate-200'
              } ${isActive ? 'ring-2 ring-[#ec5b13] ring-offset-2 ring-offset-[#0a0a0c]' : ''}`}
            >
              <span>{node.index < 10 ? `0${node.index}` : node.index}</span>

              {/* Hover Tooltip showing heading title */}
              <div className="absolute left-7 hidden group-hover:flex items-center z-30 pointer-events-none">
                <div className="bg-[#0a0a0c]/95 border border-[#ec5b13]/40 text-slate-200 text-[11px] font-mono px-2.5 py-1 rounded-md whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.9)] backdrop-blur-md">
                  <span className="text-[#ec5b13] font-bold mr-1.5">//</span>
                  {node.title}
                </div>
              </div>
            </button>

            {/* Horizontal Circuit Branch line to heading */}
            <div
              className={`h-[1.5px] w-2 sm:w-3.5 transition-all duration-300 ${
                isReached
                  ? 'bg-gradient-to-r from-[#ec5b13] to-[#ec5b13]/30 shadow-[0_0_8px_#ec5b13]'
                  : 'bg-white/10'
              }`}
            />
          </div>
        );
      })}

      {/* 6. Footer Circuit Ground (GND // EOF) */}
      <div className="absolute bottom-0 left-[9px] -translate-x-1/2 flex flex-col items-center">
        <div
          className={`w-2.5 h-2.5 rounded-sm border transition-all duration-300 flex items-center justify-center ${
            readPercent >= 98
              ? 'bg-[#ec5b13] border-[#ff7828] shadow-[0_0_10px_#ec5b13]'
              : 'bg-[#0a0a0c] border-white/20'
          }`}
        >
          <div
            className={`w-1 h-1 rounded-full ${readPercent >= 98 ? 'bg-white' : 'bg-slate-600'}`}
          />
        </div>
        <span
          className={`font-mono text-[8px] tracking-widest mt-1 hidden sm:block ${
            readPercent >= 98 ? 'text-[#ec5b13] font-bold' : 'text-slate-600'
          }`}
        >
          END
        </span>
      </div>
    </div>
  );
};

export default CircuitReadingStreak;

