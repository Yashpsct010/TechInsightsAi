import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

const OfflineNotice = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 bg-red-500/10 backdrop-blur-md text-red-500 p-2.5 z-50 flex items-center justify-center border-b border-red-500/30 shadow-[0_4px_30px_rgba(239,68,68,0.15)] font-mono text-xs sm:text-sm uppercase tracking-wider font-bold"
                >
                    <FaExclamationTriangle className="mr-3 text-red-500 animate-pulse" />
                    <span>System_Offline // Connection Lost. Functionality Limited.</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineNotice;
