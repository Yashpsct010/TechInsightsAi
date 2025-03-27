import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaRocket, FaLayerGroup } from 'react-icons/fa';

const Home = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.4
            }
        }
    };

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pt-20 md:pt-28"
        >
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Elements - Enhanced with more responsive animations */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 0.6,
                            scale: [1, 1.1, 1],
                            x: [0, 10, 0]
                        }}
                        transition={{
                            delay: 0.5,
                            duration: 8,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="absolute top-20 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 0.6,
                            scale: [1, 1.15, 1],
                            x: [0, -15, 0]
                        }}
                        transition={{
                            delay: 0.8,
                            duration: 10,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="absolute -bottom-32 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20"
                    />
                </div>

                {/* Hero Content - Enhanced with more responsive design */}
                <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-4"
                        >
                            <span className="inline-block py-1 px-3 bg-blue-100 text-blue-700 rounded-full text-sm font-medium tracking-wide">
                                AI-Powered Insights
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text"
                        >
                            Welcome to TechInsights AI
                        </motion.h1>

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
                        >
                            Discover the latest insights in technology, generated by AI and curated for tech enthusiasts and forward-thinkers.
                        </motion.p>

                        <motion.div
                            className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto"
                            >
                                <Link
                                    to="/blog"
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-blue-200/50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <span className="text-white">Read Latest Blog</span>
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >→</motion.span>
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto"
                            >
                                <Link
                                    to="/about"
                                    className="w-full sm:w-auto bg-white text-gray-800 font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Learn More
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Section - Enhanced for better responsiveness */}
            <div className="container mx-auto px-4 py-16 md:py-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="py-2 text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Why TechInsights AI?</h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Our platform leverages the power of artificial intelligence to bring you the most relevant and cutting-edge tech content.</p>
                </motion.div>

                {/* Enhanced feature cards with better responsiveness */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12"
                >
                    {[
                        {
                            icon: <FaBrain className="text-4xl text-blue-500" />,
                            title: "AI-Generated Content",
                            description: "Our blogs are created using cutting-edge AI technology, producing fresh and insightful content that stays ahead of tech trends."
                        },
                        {
                            icon: <FaRocket className="text-4xl text-indigo-500" />,
                            title: "Updated Regularly",
                            description: "New content is generated every few hours to keep you updated with the latest tech trends and breakthroughs in the industry."
                        },
                        {
                            icon: <FaLayerGroup className="text-4xl text-purple-500" />,
                            title: "Topic Variety",
                            description: "Browse blogs on AI, cybersecurity, programming, emerging tech, and the latest tech news from around the globe."
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
                            whileHover={{
                                y: -10,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                            />
                            <div className="relative z-10">
                                <motion.div
                                    className="mb-5 inline-block"
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Call to Action - Enhanced with responsive design */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 sm:py-16 mt-16 sm:mt-20"
            >
                <div className="container mx-auto px-4 text-center">
                    <motion.h3
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl font-bold text-white mb-6"
                    >
                        Ready to explore the future of tech?
                    </motion.h3>
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            to="/blog"
                            className="inline-block bg-white text-blue-700 font-medium py-3 px-6 sm:py-3 sm:px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Start Reading Now
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Home;