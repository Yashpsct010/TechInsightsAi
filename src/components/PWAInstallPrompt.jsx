import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDownload } from 'react-icons/fa';

const PWAInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [debugMode, setDebugMode] = useState(true); // Enable debug mode for testing

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setInstallPrompt(e);
            console.log('Install prompt detected!');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            console.log('App is already installed');
        } else {
            console.log('App is not installed');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            console.log('No installation prompt available');
            alert('This app cannot be installed right now. Please make sure you are using a supported browser and the app meets PWA installation criteria.');
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        // We no longer need the prompt
        setInstallPrompt(null);

        if (outcome === 'accepted') {
            setIsInstalled(true);
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
    };

    // For testing purposes, we'll show the button regardless of install state
    // In production, use: if (isInstalled || !installPrompt) return null;
    if (isInstalled && !debugMode) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <motion.button
                onClick={handleInstallClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-full shadow-lg border border-cyan-400/30"
            >
                <FaDownload size={16} /> {/* Fixed icon usage */}
                <span className="font-medium text-sm">
                    {debugMode && !installPrompt ? 'Install Not Available' : 'Install App'}
                </span>
            </motion.button>

            {/* Debug info - remove in production */}
            {debugMode && (
                <>
                    {import.meta.env.VITE_API_BASE_URL === 'http://localhost:5000/api' ? (
                        <div className="bg-slate-900/90 text-white text-xs p-2 rounded-md mt-2 w-48 border border-slate-700">
                            <div>Install Available: {installPrompt ? 'Yes' : 'No'}</div>
                            <div>Already Installed: {isInstalled ? 'Yes' : 'No'}</div>
                            <div className="text-xs mt-1 opacity-70">
                                Debug mode - click to {' '}
                                <button
                                    className="underline text-cyan-400"
                                    onClick={() => setDebugMode(false)}
                                >
                                    disable
                                </button>
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </motion.div>
    );
};

export default PWAInstallPrompt;
