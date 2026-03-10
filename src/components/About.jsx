import React from 'react';
import { motion } from 'framer-motion';
import { FaPuzzlePiece, FaLightbulb, FaRocket, FaUsers, FaTerminal, FaGithub, FaLinkedin } from 'react-icons/fa';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const teamMembers = [
        {
            name: "Yash Parmar",
            role: "Full Stack Developer",
            image: "/my-image-square.jpg",
        }
    ];

    const values = [
        {
            icon: <FaPuzzlePiece />,
            title: "Innovation",
            code: "DIR_001",
            color: "#ec5b13",
            description: "We embrace cutting-edge AI technology to create unique, informative content for our readers."
        },
        {
            icon: <FaLightbulb />,
            title: "Insight",
            code: "DIR_002",
            color: "#8b5cf6",
            description: "We strive to provide valuable insights that help our readers understand complex tech concepts."
        },
        {
            icon: <FaRocket />,
            title: "Quality",
            code: "DIR_003",
            color: "#06b6d4",
            description: "We maintain high standards in our content, ensuring accuracy and relevance."
        },
        {
            icon: <FaUsers />,
            title: "Community",
            code: "DIR_004",
            color: "#22c55e",
            description: "We aim to build a community of tech enthusiasts who share knowledge and ideas."
        },
    ];

    return (
        <motion.div
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-16 sm:pt-20 md:pt-24 selection:bg-[#ec5b13] selection:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#ec5b13]/5 to-transparent pointer-events-none" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-[#ec5b13]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-[#8b5cf6]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ec5b13] rounded-lg text-white font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <FaTerminal className="text-xs" /> System_Manifest // About
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter mb-6 sm:mb-8 glitch-text"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    >
                        ABOUT <span className="text-[#ec5b13]">US</span>
                    </motion.h1>

                    <motion.p
                        className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        We're on a mission to make technology insights accessible to everyone through the power of artificial intelligence.
                    </motion.p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <div className="w-8 h-[2px] bg-[#ec5b13]" />
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Origin_Protocol</h2>
                        </div>

                        <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-[#121212] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-[80px] pointer-events-none" />

                            {/* Terminal-style line numbers */}
                            <div className="space-y-5 sm:space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed relative">
                                <div className="flex gap-4">
                                    <span className="font-mono text-xs text-slate-600 pt-1 select-none shrink-0 hidden sm:block">01</span>
                                    <p>
                                        TechInsights AI began with a simple idea: use artificial intelligence to create high-quality content about technology trends and innovations. We recognized that keeping up with the rapidly evolving tech landscape is challenging, and many people struggle to find clear, accessible information.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-mono text-xs text-slate-600 pt-1 select-none shrink-0 hidden sm:block">02</span>
                                    <p>
                                        Our platform leverages advanced AI models to generate insightful articles on various technology topics. These articles are then reviewed by our human editors to ensure accuracy, relevance, and readability.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-mono text-xs text-slate-600 pt-1 select-none shrink-0 hidden sm:block">03</span>
                                    <p>
                                        What sets us apart is our commitment to bridging the gap between complex technology concepts and general understanding. We believe that everyone should have access to clear, informative content about the technologies shaping our future.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex flex-wrap items-center gap-4 font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
                                <span>Est. 2024</span>
                                <span className="text-slate-700">|</span>
                                <span>Status: <span className="text-green-500">Active</span></span>
                                <span className="text-slate-700">|</span>
                                <span>Build: <span className="text-[#ec5b13]">v2.026</span></span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Directives (Values) Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="flex items-center gap-3 mb-8 sm:mb-10"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="w-8 h-[2px] bg-[#ec5b13]" />
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Core_Directives</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="glass-panel p-5 sm:p-6 rounded-2xl hover:border-[#ec5b13]/30 transition-all duration-500 group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                {/* Code Tag */}
                                <div className="flex items-center justify-between mb-4 sm:mb-5">
                                    <span className="px-2 py-1 bg-white/5 text-slate-500 text-[10px] font-mono uppercase rounded border border-white/10 tracking-wider">
                                        {value.code}
                                    </span>
                                    <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110" style={{ color: value.color }}>
                                        {value.icon}
                                    </span>
                                </div>

                                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 uppercase tracking-tight">{value.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{value.description}</p>

                                {/* Bottom indicator */}
                                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: value.color }} />
                                        Priority: Active
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Creator / Architect Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="flex items-center gap-3 mb-8 sm:mb-10"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="w-8 h-[2px] bg-[#ec5b13]" />
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">System_Architect</h2>
                    </motion.div>

                    <div className="flex justify-center">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                className="w-full max-w-md"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="glass-panel rounded-2xl overflow-hidden hover:border-[#ec5b13]/30 transition-all duration-500 group">
                                    {/* Photo */}
                                    <motion.div
                                        className="relative h-64 sm:h-72 md:h-80 overflow-hidden"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                                    </motion.div>

                                    {/* Info */}
                                    <div className="p-5 sm:p-6 -mt-12 relative z-10">
                                        <span className="px-2 py-1 bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-mono uppercase rounded border border-[#ec5b13]/20 tracking-wider">
                                            ARCH_001
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 mb-1 uppercase tracking-tight">{member.name}</h3>
                                        <p className="text-[#8b5cf6] font-mono text-xs sm:text-sm uppercase tracking-wider">{member.role}</p>

                                        {/* Links */}
                                        <div className="flex gap-3 mt-4 sm:mt-5">
                                            <a href="https://github.com/yashpsct010" target="_blank" rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors">
                                                <FaGithub className="text-sm" />
                                            </a>
                                            <a href="https://linkedin.com/in/y-sh" target="_blank" rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ec5b13] hover:bg-white/10 transition-colors">
                                                <FaLinkedin className="text-sm" />
                                            </a>
                                        </div>

                                        {/* Status bar */}
                                        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5 flex items-center gap-4 font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Online
                                            </span>
                                            <span>Auth_Level: Admin</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom Stats */}
            <section className="py-8 sm:py-10 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-[#121212] border border-white/10"
                    >
                        <div>
                            <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Core_Status</span>
                            <span className="text-base sm:text-lg md:text-xl font-black text-green-500 uppercase tracking-tighter italic">Operational</span>
                        </div>
                        <div>
                            <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Modules</span>
                            <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tighter">7 Active</span>
                        </div>
                        <div>
                            <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Architecture</span>
                            <span className="text-base sm:text-lg md:text-xl font-black text-[#ec5b13] tracking-tighter">Neural_V2</span>
                        </div>
                        <div>
                            <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Mission</span>
                            <span className="text-base sm:text-lg md:text-xl font-black text-[#8b5cf6] tracking-tighter italic">In Progress</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
};

export default About;