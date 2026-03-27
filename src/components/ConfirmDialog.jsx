import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrashAlt } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                        onClick={onCancel}
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-full max-w-sm bg-[#121212] border border-[#ec5b13]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(236,91,19,0.15)]"
                    >
                        {/* Inner Content */}
                        <div className="flex flex-col items-center text-center">
                            <motion.div 
                                className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/10"
                            >
                                <FaTrashAlt className="text-slate-400 text-xl" />
                            </motion.div>
                            
                            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2">
                                {title}
                            </h3>
                            
                            <p className="text-sm text-slate-400 font-mono mb-8 leading-relaxed">
                                {message}
                            </p>
                            
                            {/* Actions */}
                            <div className="flex gap-3 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-slate-300 font-mono text-xs sm:text-sm uppercase font-bold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono text-xs sm:text-sm uppercase font-bold transition-colors"
                                >
                                    Confirm
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
