import React from 'react';
import { FaBrain, FaRocket, FaLayerGroup } from 'react-icons/fa';
import type { Variants } from 'framer-motion';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 20,
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export interface HomeFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverBorder: string;
  iconBg: string;
  stats: { label: string; value: string }[];
}

export const homeFeatures: HomeFeature[] = [
  {
    icon: <FaBrain className="text-3xl text-[#8b5cf6]" />,
    title: 'AI-Generated Content',
    description:
      'Deep-learning synthesis of global tech trends, extracting signals from noise across distributed data networks.',
    hoverBorder: 'hover:border-[#8b5cf6]/50',
    iconBg: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20',
    stats: [
      { label: 'ACCURACY', value: '99.8%' },
      { label: 'MODEL', value: 'GEN-X_2026' },
    ],
  },
  {
    icon: <FaRocket className="text-3xl text-[#ec5b13]" />,
    title: 'Updated Regularly',
    description:
      'Real-time ingestion of emerging data shards. System latency minimized to sub-millisecond propagation.',
    hoverBorder: 'hover:border-[#ec5b13]/50',
    iconBg: 'bg-[#ec5b13]/10 border-[#ec5b13]/20',
    stats: [
      { label: 'REFRESH', value: '120s' },
      { label: 'STATUS', value: 'SYNCED' },
    ],
  },
  {
    icon: <FaLayerGroup className="text-3xl text-white" />,
    title: 'Topic Variety',
    description:
      'Cross-spectrum analysis of tech domains ranging from bio-hacking to quantum computing architecture.',
    hoverBorder: 'hover:border-white/40',
    iconBg: 'bg-white/5 border-white/10',
    stats: [
      { label: 'CATEGORIES', value: '242' },
      { label: 'TAGS', value: 'DYNAMIC' },
    ],
  },
];

export interface HomeMetric {
  label: string;
  value: string;
  suffix?: string;
  change: string;
  changeColor: string;
}

export const defaultHomeMetrics: HomeMetric[] = [
  {
    label: 'Active_Nodes',
    value: '1,024',
    suffix: '',
    change: '+12%_LATENCY_GAIN',
    changeColor: 'text-green-500',
  },
  {
    label: 'Data_Shards',
    value: '84.2',
    suffix: 'TB',
    change: '+5%_VOLUME_IN',
    changeColor: 'text-green-500',
  },
  {
    label: 'Uptime',
    value: '99.99',
    suffix: '%',
    change: 'STABLE',
    changeColor: 'text-green-500',
  },
  {
    label: 'Network_Load',
    value: '0.42',
    suffix: 'MS',
    change: 'PEAK_DEMAND',
    changeColor: 'text-[#ec5b13]',
  },
];
