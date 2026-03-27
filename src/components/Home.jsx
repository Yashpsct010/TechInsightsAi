import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaRocket, FaLayerGroup, FaArrowRight, FaDatabase } from 'react-icons/fa';
import WhatsNewCard from './WhatsNewCard';

const Home = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const item = {
        hidden: { y: 40, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 20
            }
        }
    };

    const fadeInUp = {
        hidden: { y: 60, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const features = [
        {
            icon: <FaBrain className="text-3xl text-[#8b5cf6]" />,
            title: "AI-Generated Content",
            description: "Deep-learning synthesis of global tech trends, extracting signals from noise across distributed data networks.",
            hoverBorder: "hover:border-[#8b5cf6]/50",
            iconBg: "bg-[#8b5cf6]/10 border-[#8b5cf6]/20",
            stats: [
                { label: "ACCURACY", value: "99.8%" },
                { label: "MODEL", value: "GEN-X_2026" }
            ]
        },
        {
            icon: <FaRocket className="text-3xl text-[#ec5b13]" />,
            title: "Updated Regularly",
            description: "Real-time ingestion of emerging data shards. System latency minimized to sub-millisecond propagation.",
            hoverBorder: "hover:border-[#ec5b13]/50",
            iconBg: "bg-[#ec5b13]/10 border-[#ec5b13]/20",
            stats: [
                { label: "REFRESH", value: "120s" },
                { label: "STATUS", value: "SYNCED" }
            ]
        },
        {
            icon: <FaLayerGroup className="text-3xl text-white" />,
            title: "Topic Variety",
            description: "Cross-spectrum analysis of tech domains ranging from bio-hacking to quantum computing architecture.",
            hoverBorder: "hover:border-white/40",
            iconBg: "bg-white/5 border-white/10",
            stats: [
                { label: "CATEGORIES", value: "242" },
                { label: "TAGS", value: "DYNAMIC" }
            ]
        }
    ];

    const metrics = [
        { label: "Active_Nodes", value: "1,024", suffix: "", change: "+12%_LATENCY_GAIN", changeColor: "text-green-500" },
        { label: "Data_Shards", value: "84.2", suffix: "TB", change: "+5%_VOLUME_IN", changeColor: "text-green-500" },
        { label: "Uptime", value: "99.99", suffix: "%", change: "STABLE", changeColor: "text-green-500" },
        { label: "Network_Load", value: "0.42", suffix: "MS", change: "PEAK_DEMAND", changeColor: "text-[#ec5b13]" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-16 sm:pt-20 md:pt-28 selection:bg-[#ec5b13] selection:text-white overflow-x-hidden"
        >
            <WhatsNewCard />
            
            {/* Hero Section */}
            <section className="relative pt-6 sm:pt-12 md:pt-8 pb-12 sm:pb-20 md:pb-32 px-4 sm:px-6 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/30 to-transparent blur-[120px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* System Status */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-2 mb-4 sm:mb-6 md:mb-8"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#8b5cf6]">
                            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#8b5cf6] animate-pulse shrink-0" />
                            <span className="truncate">System Status: Live_Sync_Active</span>
                        </div>
                    </motion.div>

                    {/* Kinetic Typography */}
                    <motion.h1
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                        className="text-[11vw] xs:text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[8rem] font-black uppercase mb-6 sm:mb-8 md:mb-12 flex flex-col leading-[0.85] tracking-[-0.04em] sm:tracking-[-0.05em]"
                    >
                        <span>Welcome</span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20"
                        >
                            To TechInsights
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex items-center gap-3 sm:gap-6 md:gap-8"
                        >
                            AI
                            <motion.span
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                                className="h-1 sm:h-2 lg:h-4 flex-1 bg-[#ec5b13]/40 rounded-full origin-left"
                            />
                        </motion.span>
                    </motion.h1>

                    {/* Description + Buttons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-end">
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 leading-relaxed font-light max-w-xl"
                        >
                            Discover the latest insights in technology, generated by{' '}
                            <span className="text-white font-bold italic underline decoration-[#ec5b13]">
                                neural synthetic intelligence
                            </span>{' '}
                            and curated for tech enthusiasts and forward-thinkers.
                        </motion.p>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.7 }}
                            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 font-mono md:justify-end"
                        >
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                                <Link
                                    to="/blog"
                                    className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white px-5 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-3.5 md:py-3.5 lg:py-4 rounded-xl flex items-center justify-center sm:justify-start gap-3 transition-all group font-bold uppercase tracking-tighter text-sm sm:text-base"
                                >
                                    Read_Latest_Blog
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                                <Link
                                    to="/blogs"
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-3.5 md:py-3.5 lg:py-4 rounded-xl flex items-center justify-center sm:justify-start gap-3 transition-all font-bold uppercase tracking-tighter text-sm sm:text-base"
                                >
                                    Browse_Archive
                                    <FaDatabase className="text-sm" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 md:mb-16 gap-3 sm:gap-4"
                    >
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter">
                                System_Features_v2.6
                            </h2>
                            <p className="font-mono text-[10px] sm:text-xs md:text-sm text-slate-500 uppercase tracking-widest">
                                Core Capabilities / Module Synthesis
                            </p>
                        </div>
                        <div className="hidden md:block font-mono text-[10px] text-slate-600 text-right leading-relaxed">
                            [CORE_TEMP: 32C]<br />
                            [LOAD_BALANCING: OPTIMAL]<br />
                            [ACTIVE_THREADS: 4096]
                        </div>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={item}
                                className={`glass-shard p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group ${feature.hoverBorder} transition-all duration-500 ${index === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
                                whileHover={{
                                    y: -8,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                            >
                                <motion.div
                                    className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl ${feature.iconBg} border flex items-center justify-center mb-4 sm:mb-6 md:mb-8`}
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 uppercase tracking-tight text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6 md:mb-8">
                                    {feature.description}
                                </p>
                                <div className="font-mono text-[9px] sm:text-[10px] text-slate-500 flex justify-between items-center border-t border-white/5 pt-3 sm:pt-4 gap-2">
                                    <span className="truncate">{feature.stats[0].label}: {feature.stats[0].value}</span>
                                    <span className="truncate text-right">{feature.stats[1].label}: {feature.stats[1].value}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={container}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
                    >
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                variants={item}
                                className="flex flex-col gap-0.5 sm:gap-1"
                            >
                                <span className="font-mono text-[8px] sm:text-[10px] uppercase text-slate-500 tracking-widest truncate">
                                    {metric.label}
                                </span>
                                <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
                                    {metric.value}
                                    {metric.suffix && (
                                        <span className="text-lg sm:text-xl md:text-2xl font-normal text-slate-500">{metric.suffix}</span>
                                    )}
                                </span>
                                <span className={`font-mono text-[10px] sm:text-xs ${metric.changeColor} truncate`}>
                                    {metric.change}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="border-t border-white/10 bg-white/[0.02] py-12 sm:py-16 md:py-24 px-4 sm:px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                        <div className="text-center md:text-left">
                            <motion.h3
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-3 sm:mb-4"
                            >
                                Ready to Execute?
                            </motion.h3>
                            <motion.p
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                viewport={{ once: true }}
                                className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed mx-auto md:mx-0"
                            >
                                Initialize your connection to the neural feed. Explore the future of tech through AI-synthesized intelligence.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 font-mono justify-center md:justify-end"
                        >
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                                <Link
                                    to="/blog"
                                    className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl flex items-center justify-center sm:justify-start gap-3 transition-all group font-bold uppercase tracking-tighter text-sm sm:text-base"
                                >
                                    Read_Latest_Blog
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                                <Link
                                    to="/blogs"
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl flex items-center justify-center sm:justify-start gap-3 transition-all font-bold uppercase tracking-tighter text-sm sm:text-base"
                                >
                                    Browse_Archive
                                    <FaDatabase className="text-sm" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default Home;