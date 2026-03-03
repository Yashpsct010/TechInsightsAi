import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const GENRES = [
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒' },
    { id: 'coding', name: 'Coding & Dev', icon: '💻' },
    { id: 'emerging-tech', name: 'Emerging Tech', icon: '🚀' },
    { id: 'tech-news', name: 'Tech News', icon: '📰' }
];

const Profile = () => {
    const { user, updatePreferences } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedPreferences, setSelectedPreferences] = useState(user?.preferences || []);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

    const handleTogglePreference = (genreId) => {
        setSelectedPreferences(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        setSaveMessage({ text: '', type: '' });

        const success = await updatePreferences(selectedPreferences);

        if (success) {
            setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
            setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
        } else {
            setSaveMessage({ text: 'Failed to save preferences. Please try again.', type: 'error' });
        }
        setIsSaving(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 mt-20 sm:mt-24 min-h-[70vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">
                    Account Settings
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar / Nav */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 h-fit md:col-span-1">
                        <nav className="flex flex-col space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile'
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                General Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'preferences'
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                Preferences
                            </button>
                            <button className="text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed cursor-">
                                Saved Bookmarks
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                                        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-gray-200">
                                                    {user?.email}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Account Role</label>
                                                <div className="inline-flex items-center px-3 py-1 rounded-md bg-slate-700 text-gray-200 text-sm">
                                                    {user?.role === 'admin' ? (
                                                        <span className="text-fuchsia-400 font-medium">Administrator</span>
                                                    ) : (
                                                        'Standard User'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <h2 className="text-xl font-semibold text-cyan-400 mb-2">Welcome to TechInsightsAI!</h2>
                                        <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                                            Explore the new Preferences tab to customize your feed. By selecting your favorite topics, you ensure you see the most relevant tech news first.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'preferences' && (
                                <motion.div
                                    key="preferences"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-xl">
                                        <h2 className="text-xl font-semibold text-white mb-2">Your Tech Interests</h2>
                                        <p className="text-sm text-gray-400 mb-6">Select the genres you are most interested in. We'll prioritize these in your feed.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                            {GENRES.map((genre) => {
                                                const isSelected = selectedPreferences.includes(genre.id);
                                                return (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        key={genre.id}
                                                        onClick={() => handleTogglePreference(genre.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${isSelected
                                                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                                                : 'bg-slate-900/50 border-slate-700 text-gray-400 hover:bg-slate-700 hover:text-gray-200'
                                                            }`}
                                                    >
                                                        <span className="text-xl">{genre.icon}</span>
                                                        <span className="font-medium">{genre.name}</span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-700 pt-6">
                                            <div>
                                                {saveMessage.text && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className={`text-sm ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                                                    >
                                                        {saveMessage.text}
                                                    </motion.span>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleSavePreferences}
                                                disabled={isSaving}
                                                className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg ${isSaving
                                                        ? 'bg-slate-600 cursor-not-allowed text-gray-300'
                                                        : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50 hover:shadow-cyan-500/30'
                                                    }`}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Preferences'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
