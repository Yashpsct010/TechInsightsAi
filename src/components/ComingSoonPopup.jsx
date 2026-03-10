import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTerminal } from 'react-icons/fa';

const ComingSoonPopup = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-md"
                    >
                        <div className="bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ec5b13] via-[#8b5cf6] to-[#06b6d4]" />

                            {/* Background glow */}
                            <motion.div
                                className="absolute -top-10 -right-10 w-32 h-32 bg-[#ec5b13]/10 rounded-full blur-[60px] pointer-events-none"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.1, 0.2, 0.1]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 5,
                                    repeatType: "reverse"
                                }}
                            />

                            <div className="relative px-6 py-6 md:px-8 md:py-7">
                                {/* Close button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-4 right-4 text-slate-500 hover:text-[#ec5b13] transition-colors"
                                    onClick={onClose}
                                >
                                    <FaTimes size={16} />
                                </motion.button>

                                {/* Content */}
                                <div className="text-center mb-2">
                                    {/* Icon */}
                                    <motion.div
                                        className="inline-flex items-center justify-center h-14 w-14 bg-[#ec5b13]/10 rounded-xl mb-5 border border-[#ec5b13]/20"
                                        animate={{
                                            y: [0, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse"
                                        }}
                                    >
                                        <FaTerminal className="text-[#ec5b13] text-xl" />
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h3
                                        className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Coming <span className="text-[#ec5b13]">Soon</span>
                                    </motion.h3>

                                    {/* Description */}
                                    <motion.p
                                        className="text-slate-400 text-sm mb-6 font-mono leading-relaxed"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >This module is currently under development process. Stay tuned for updates!
                                    </motion.p>

                                    {/* Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        onClick={onClose}
                                        className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white px-6 py-3 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all"
                                    >
                                        Acknowledged →
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonPopup;
