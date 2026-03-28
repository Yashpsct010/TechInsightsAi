import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrophy } from 'react-icons/fa';

const WhatsNewCard = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [scratched, setScratched] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [intel, setIntel] = useState({ intelHook: "Loading encrypted transmission..." });

    useEffect(() => {
        const fetchIntel = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const res = await fetch(`${baseUrl}/intel/today`);
                const data = await res.json();
                if (data.success && data.intel) {
                    setIntel(data.intel);
                }
            } catch (error) {
                console.error("Failed to fetch daily intel:", error);
                setIntel({ intelHook: "Warning: Disconnected from central intelligence node. Establishing secure link." });
            }
        };
        fetchIntel();
    }, []);

    useEffect(() => {
        const lastSeen = localStorage.getItem('whatsNewLastSeen');
        const today = new Date().toDateString();
        if (lastSeen === today) {
            setScratched(true);
            setIsDrawing(false); // Reset drawing
        }
    }, []);

    useEffect(() => {
        if (!isVisible || scratched) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Fill canvas with brutalist cover
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#333333';
        for(let i=0; i<150; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
        }

        ctx.font = "bold 20px monospace";
        ctx.fillStyle = "#ec5b13";
        ctx.textAlign = "center";
        
        ctx.fillText("SCRATCH DATA", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = "#8b5cf6";
        ctx.font = "12px monospace";
        ctx.fillText("TO REVEAL INTEL", canvas.width / 2, canvas.height / 2 + 15);
    }, [isVisible, scratched]);

    const scratch = (e) => {
        if (!isDrawing || scratched) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Calculate scale since canvas might be styled differently than its internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        checkScratched();
    };

    const checkScratched = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clearPixels = 0;
        
        // Check every 4th pixel alpha value
        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) clearPixels++;
        }
        
        const totalPixels = pixels.length / 16;
        const percentage = (clearPixels / totalPixels) * 100;

        // If more than 40% cleared, auto-reveal
        if (percentage > 40) {
            setScratched(true);
            localStorage.setItem('whatsNewLastSeen', new Date().toDateString());
        }
    };

    const closeCard = () => {
        setIsVisible(false);
        localStorage.setItem('whatsNewLastSeen', new Date().toDateString());
    };

    const openCard = () => {
        setIsVisible(true);
    };

    return (
        <>
            {/* Sticky Floating Button */}
            <motion.button
                onClick={openCard}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-6 right-6 z-40 bg-[#ec5b13] text-white p-4 rounded-full shadow-[0_0_20px_rgba(236,91,19,0.5)] border-2 border-white/20 hover:bg-[#ec5b13]/90 transition-colors"
            >
                {/* Shake animation if not scratched today */}
                <motion.div
                    animate={
                        !scratched 
                        ? { rotate: [-10, 10, -10, 10, 0] } 
                        : { rotate: 0 }
                    }
                    transition={
                        !scratched 
                        ? { repeat: Infinity, duration: 1.5, repeatDelay: 2 }
                        : { duration: 0 }
                    }
                >
                    <FaTrophy className="text-xl sm:text-2xl" />
                </motion.div>
                {!scratched && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-[#ec5b13]"></span>
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCard}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm bg-[#121212] border border-[#ec5b13]/50 rounded-2xl overflow-hidden p-1 shadow-[0_0_30px_rgba(236,91,19,0.15)]"
                        >
                        <button 
                            onClick={closeCard}
                            className="absolute top-3 right-3 z-30 text-slate-400 hover:text-white transition-colors bg-black/50 p-1.5 rounded-full"
                        >
                            <FaTimes />
                        </button>

                        <div className="p-1 text-center bg-[#0a0a0c] rounded-xl flex flex-col items-center justify-center relative overflow-hidden" style={{ height: '300px' }}>
                            {/* Hidden Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-[#121212] to-[#0a0a0c]">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={scratched ? { scale: 1, rotate: [0, -10, 10, 0] } : { scale: 0 }}
                                    transition={{
                                        scale: { type: "spring", duration: 0.8 },
                                        rotate: { duration: 0.8 }
                                    }}
                                >
                                    <FaTrophy className="text-4xl text-[#ec5b13] mb-4" />
                                </motion.div>
                                <h3 className="font-bold text-white mb-2 uppercase tracking-wider text-xl">Daily Intel</h3>
                                <p className="text-sm text-slate-300 font-mono leading-relaxed px-4">{intel.intelHook}</p>
                                {intel.referenceUrl && (
                                    <a href={intel.referenceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs bg-[#ec5b13] hover:bg-[#ec5b13]/80 text-white py-1 px-3 rounded-md uppercase tracking-wider transition-colors z-51">
                                        Access Source Code
                                    </a>
                                )}
                            </div>

                            {/* Canvas Cover */}
                            {!scratched && (
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={300}
                                    onMouseDown={() => setIsDrawing(true)}
                                    onMouseUp={() => setIsDrawing(false)}
                                    onMouseOut={() => setIsDrawing(false)}
                                    onMouseMove={scratch}
                                    onTouchStart={(e) => { setIsDrawing(true); scratch(e); }}
                                    onTouchEnd={() => setIsDrawing(false)}
                                    onTouchMove={scratch}
                                    className="absolute inset-0 w-full h-full cursor-pointer z-20 touch-none"
                                />
                            )}
                            
                            {scratched && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 pointer-events-none rounded-xl inset-shadow-sm shadow-[#ec5b13]/20"
                                />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

export default WhatsNewCard;
