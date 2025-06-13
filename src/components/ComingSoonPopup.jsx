import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBell } from 'react-icons/fa';

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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
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
                        <div className="bg-gradient-to-br from-slate-900 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20">
                            <div className="relative px-6 py-6 md:px-8 md:py-7">
                                {/* Close button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 z-1"
                                    onClick={onClose}
                                >
                                    <FaTimes size={18} />
                                </motion.button>

                                {/* Decorative elements */}
                                <motion.div
                                    className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500 rounded-full opacity-20 z-0"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.3, 0.2]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 5,
                                        repeatType: "reverse"
                                    }}
                                />

                                {/* Content */}
                                <div className="text-center mb-2">
                                    <motion.div
                                        className="inline-flex items-center justify-center h-16 w-16 bg-fuchsia-600/30 rounded-full mb-4 border border-fuchsia-500/30"
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
                                        <FaBell className="text-fuchsia-300 text-2xl" />
                                    </motion.div>
                                    <motion.h3
                                        className="text-xl md:text-2xl font-bold text-white mb-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Coming Soon!
                                    </motion.h3>
                                    <motion.p
                                        className="text-cyan-300 mb-6"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        We're working hard to bring you our subscription service. Stay tuned for updates!
                                    </motion.p>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        onClick={onClose}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-cyan-500/30 border border-cyan-400/30"
                                    >
                                        I'll check back later
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
