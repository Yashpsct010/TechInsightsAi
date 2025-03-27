import React from 'react';
import { motion } from 'framer-motion';
import { FaPuzzlePiece, FaLightbulb, FaRocket, FaUsers } from 'react-icons/fa';

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
            name: "AI Writer",
            role: "Content Generation",
            image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        },
        {
            name: "Human Editor",
            role: "Content Curation",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        },
        {
            name: "Tech Analyst",
            role: "Technology Research",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        },
        {
            name: "Product Designer",
            role: "UI/UX Design",
            image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
        }
    ];

    const values = [
        {
            icon: <FaPuzzlePiece className="text-3xl text-blue-600" />,
            title: "Innovation",
            description: "We embrace cutting-edge AI technology to create unique, informative content for our readers."
        },
        {
            icon: <FaLightbulb className="text-3xl text-blue-600" />,
            title: "Insight",
            description: "We strive to provide valuable insights that help our readers understand complex tech concepts."
        },
        {
            icon: <FaRocket className="text-3xl text-blue-600" />,
            title: "Quality",
            description: "We maintain high standards in our content, ensuring accuracy and relevance."
        },
        {
            icon: <FaUsers className="text-3xl text-blue-600" />,
            title: "Community",
            description: "We aim to build a community of tech enthusiasts who share knowledge and ideas."
        },
    ];

    return (
        <motion.div
            className="min-h-screen bg-slate-50 pt-24 md:pt-28" // Added padding top for header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12 md:py-20 relative overflow-hidden">
                {/* Enhanced Decorative elements */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    <motion.div
                        className="absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 bg-blue-400 rounded-full filter blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-32 -left-32 w-72 md:w-96 h-72 md:h-96 bg-indigo-400 rounded-full filter blur-3xl"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 1
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div
                        className="max-w-3xl mx-auto text-center"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                            >
                                About TechInsights AI
                            </motion.span>
                        </h1>
                        <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                            We're on a mission to make technology insights accessible to everyone through the power of artificial intelligence.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="max-w-3xl mx-auto"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Our Story</h2>
                        <div className="space-y-5 text-gray-700">
                            <p>
                                TechInsights AI began with a simple idea: use artificial intelligence to create high-quality content about technology trends and innovations. We recognized that keeping up with the rapidly evolving tech landscape is challenging, and many people struggle to find clear, accessible information.
                            </p>
                            <p>
                                Our platform leverages advanced AI models to generate insightful articles on various technology topics. These articles are then reviewed by our human editors to ensure accuracy, relevance, and readability.
                            </p>
                            <p>
                                What sets us apart is our commitment to bridging the gap between complex technology concepts and general understanding. We believe that everyone should have access to clear, informative content about the technologies shaping our future.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Our Values Section */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.h2
                        className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Our Values
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        {value.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-center">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.h2
                        className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Our Team
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <motion.div
                                    className="relative h-64 mb-4 rounded-2xl overflow-hidden shadow-md"
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                                <h3 className="text-xl font-semibold">{member.name}</h3>
                                <p className="text-blue-600">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default About;