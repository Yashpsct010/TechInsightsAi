import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes } from 'react-icons/fa';

const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const PWA_INSTALL_DISMISSED_TIMESTAMP_KEY = 'pwa-install-dismissed-timestamp';

const PWAInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [debugMode, setDebugMode] = useState(
        import.meta.env.DEV || import.meta.env.VITE_API_BASE_URL === 'http://localhost:5000/api'
    );

    useEffect(() => {
        // Check if app is already installed (standalone mode)
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isInWebAppiOS = window.navigator.standalone === true;

            if (isStandalone || isInWebAppiOS) {
                setIsInstalled(true);
                setIsVisible(false);
                console.log('App is already installed/running in standalone mode');
                return true;
            }
            return false;
        };

        // Check if user previously dismissed the prompt
        const checkDismissed = () => {
            const dismissed = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY);
            if (dismissed === 'true') {
                setIsDismissed(true);
                setIsVisible(false);
                console.log('Install prompt was previously dismissed');
                return true;
            }
            return false;
        };

        // Initial checks
        if (checkInstalled() || checkDismissed()) {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setInstallPrompt(e);
            setIsVisible(true);
            console.log('Install prompt detected!');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsVisible(false);
            setInstallPrompt(null);
            localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, 'true');
            console.log('PWA was installed');
        });

        // Re-check on visibility change (user might have installed the app)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkInstalled();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', () => { });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            console.log('No installation prompt available');
            if (debugMode) {
                alert('This app cannot be installed right now. Please make sure you are using a supported browser and the app meets PWA installation criteria.');
            }
            return;
        }

        try {
            // Show the install prompt
            installPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await installPrompt.userChoice;

            // We no longer need the prompt
            setInstallPrompt(null);
            setIsVisible(false);

            if (outcome === 'accepted') {
                setIsInstalled(true);
                localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, 'true');
                localStorage.setItem(PWA_INSTALL_DISMISSED_TIMESTAMP_KEY, Date.now().toString());
                console.log('User accepted the install prompt');
            } else {
                // User dismissed the browser prompt, but we'll still show our button
                // until they explicitly dismiss it
                console.log('User dismissed the install prompt');
            }
        } catch (error) {
            console.error('Error showing install prompt:', error);
            setInstallPrompt(null);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsVisible(false);
        localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, 'true');
        localStorage.setItem(PWA_INSTALL_DISMISSED_TIMESTAMP_KEY, Date.now().toString());
        console.log('User dismissed the install prompt');
    };

    // Don't show if installed (and not in debug mode) or if dismissed
    if ((isInstalled || isDismissed) && !debugMode) return null;

    // In production, only show if visible and install prompt is available
    if (!debugMode && (!isVisible || !installPrompt)) return null;

    return (
        <AnimatePresence>
            {(isVisible || debugMode) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={handleInstallClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-full shadow-lg border border-cyan-400/30"
                        >
                            <FaDownload size={16} />
                            <span className="font-medium text-sm">
                                {debugMode && !installPrompt ? 'Install Not Available' : 'Install App'}
                            </span>
                        </motion.button>

                        {!isInstalled && (
                            <motion.button
                                onClick={handleDismiss}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full shadow-lg border border-slate-600/30"
                                aria-label="Dismiss install prompt"
                            >
                                <FaTimes size={14} />
                            </motion.button>
                        )}
                    </div>

                    {/* Debug info - only in development */}
                    {debugMode && (
                        <div className="bg-slate-900/90 text-white text-xs p-2 rounded-md mt-2 w-64 border border-slate-700">
                            <div>Install Available: {installPrompt ? 'Yes' : 'No'}</div>
                            <div>Already Installed: {isInstalled ? 'Yes' : 'No'}</div>
                            <div>Dismissed: {isDismissed ? 'Yes' : 'No'}</div>
                            <div>Visible: {isVisible ? 'Yes' : 'No'}</div>
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
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
