import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaLinkedinIn, FaGithub, FaTerminal } from 'react-icons/fa';
import ComingSoonPopup from './ComingSoonPopup';

const Footer = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleSubscribeClick = (e) => {
        e.preventDefault();
        setIsPopupOpen(true);
    };

    const interfaceLinks = [
        { name: 'Neural_Feed', path: '/blog' },
        { name: 'Data_Archive', path: '/blogs' },
        { name: 'Job_Matrix', path: '/jobs' },
        { name: 'About_Node', path: '/about' }
    ];

    const socialLinks = [
        { icon: <FaTwitter />, path: 'https://x.com/Yashp010', label: 'Twitter' },
        { icon: <FaLinkedinIn />, path: 'https://www.linkedin.com/in/y-sh/', label: 'LinkedIn' },
        { icon: <FaGithub />, path: 'https://github.com/Yashpsct010', label: 'GitHub' }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <>
            <footer className="mt-auto border-t border-white/10 bg-black text-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    {/* Main Footer Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
                        {/* Brand Column */}
                        <div className="sm:col-span-2">
                            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.7 }}
                                    className="bg-[#ec5b13] p-1 rounded-lg"
                                >
                                    <FaTerminal className="text-white text-sm sm:text-base" />
                                </motion.div>
                                <h2 className="text-lg sm:text-xl font-black tracking-tighter uppercase font-mono">
                                    TechInsights<span className="text-[#ec5b13]">.AI</span>
                                </h2>
                            </Link>
                            <p className="text-slate-500 max-w-sm mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                                Decentralized artificial intelligence insights for the year {new Date().getFullYear()} and beyond. Synthesized for precision, curated for human intelligence.
                            </p>
                            <div className="flex gap-3 sm:gap-4">
                                {socialLinks.map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={social.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Interface Nodes Column */}
                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 sm:mb-6">
                                Interface_Nodes
                            </h4>
                            <ul className="flex flex-col gap-3 sm:gap-4">
                                {interfaceLinks.map((link, idx) => (
                                    <motion.li key={idx} variants={item}>
                                        <Link
                                            to={link.path}
                                            className="font-mono text-xs sm:text-sm text-slate-500 uppercase tracking-widest hover:text-[#ec5b13] transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Terminal Status Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4 sm:mb-6">
                                Terminal_Status
                            </h4>
                            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-[10px] sm:text-xs text-slate-400 space-y-2">
                                <div className="flex justify-between">
                                    <span>Uptime:</span>
                                    <span className="text-green-500">Online</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Version:</span>
                                    <span>v2026.4.1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Auth:</span>
                                    <span className="text-[#ec5b13]">Encrypted</span>
                                </div>
                            </div>

                            {/* Newsletter */}
                            <form className="mt-4 sm:mt-6" onSubmit={handleSubscribeClick}>
                                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 block">
                                    Neural_Feed_Subscribe
                                </label>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="email@node..."
                                        className="bg-white/5 text-white rounded-l-lg px-3 py-2 grow focus:outline-none focus:ring-1 focus:ring-[#ec5b13]/50 text-xs sm:text-sm font-mono border border-white/10 border-r-0 placeholder:text-slate-600 min-w-0"
                                    />
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white font-mono font-bold text-xs uppercase px-3 sm:px-4 py-2 rounded-r-lg transition-colors shrink-0"
                                    >
                                        Sync
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-white/5 gap-4 sm:gap-0">
                        <span className="font-mono text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center sm:text-left">
                            © {new Date().getFullYear()} TECHINSIGHTS_AI // ALL_DATA_SYNTHESIZED
                        </span>
                        <div className="flex gap-4 sm:gap-8">
                            <Link to="#" className="font-mono text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-white transition-colors">
                                Privacy_Protocol
                            </Link>
                            <Link to="#" className="font-mono text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-white transition-colors">
                                Neural_TOS
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Coming Soon Popup */}
            <ComingSoonPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    );
};

export default Footer;