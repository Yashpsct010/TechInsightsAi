import { motion } from 'framer-motion';

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideIn = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

export const bounce = {
  hidden: { y: 0 },
  visible: { y: -20 },
  transition: {
    yoyo: Infinity,
    duration: 0.5,
  },
};