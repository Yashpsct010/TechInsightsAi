import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaUser, FaSlidersH, FaBookmark, FaFingerprint, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const GENRES = [
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', code: 'AI_ML' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', code: 'SEC' },
    { id: 'coding', name: 'Coding & Dev', icon: '💻', code: 'DEV' },
    { id: 'emerging-tech', name: 'Emerging Tech', icon: '🚀', code: 'EMR' },
    { id: 'tech-news', name: 'Tech News', icon: '📰', code: 'NEWS' }
];

const Profile = () => {
    const { user, updatePreferences } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedPreferences, setSelectedPreferences] = useState(user?.preferences || []);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(user?.newsletterSubscribed || false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    React.useEffect(() => {
        if (activeTab === 'saved') {
            const fetchSaved = async () => {
                setIsLoadingSaved(true);
                try {
                    const data = await authService.getBookmarks();
                    setSavedBlogs(data || []);
                } catch (err) {
                    console.error("Failed to fetch bookmarks:", err);
                } finally {
                    setIsLoadingSaved(false);
                }
            };
            fetchSaved();
        }
    }, [activeTab]);

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

        const success = await updatePreferences(selectedPreferences, newsletterSubscribed);

        if (success) {
            setSaveMessage({ text: 'Preferences synced successfully!', type: 'success' });
            setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
        } else {
            setSaveMessage({ text: 'Sync failed. Please retry.', type: 'error' });
        }
        setIsSaving(false);
    };

    const tabs = [
        { id: 'profile', label: 'Node_Profile', icon: FaUser },
        { id: 'preferences', label: 'Config_Prefs', icon: FaSlidersH },
        { id: 'saved', label: 'Saved_Data', icon: FaBookmark }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 pb-12 selection:bg-[#ec5b13] selection:text-white"
        >
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 sm:mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-[2px] bg-[#ec5b13]" />
                        <span className="font-mono text-[10px] sm:text-xs text-[#ec5b13] uppercase tracking-widest">// System_Settings</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                        Account <span className="text-[#ec5b13]">Terminal</span>
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
                    {/* Sidebar Nav */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel rounded-2xl p-4 h-fit md:col-span-1"
                    >
                        <nav className="flex flex-col space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`text-left px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab.id
                                            ? 'bg-[#ec5b13]/10 text-[#ec5b13] border border-[#ec5b13]/20 font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="text-xs shrink-0" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* User badge */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Node: Online
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    {/* Profile Info Card */}
                                    <div className="p-5 sm:p-6 bg-[#121212] border border-white/10 rounded-2xl">
                                        <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-5 uppercase tracking-tight flex items-center gap-2">
                                            <FaFingerprint className="text-[#8b5cf6]" /> Identity_Data
                                        </h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Email_Address</label>
                                                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono">
                                                    {user?.email}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Auth_Level</label>
                                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs sm:text-sm">
                                                    {user?.role === 'admin' ? (
                                                        <span className="text-[#ec5b13] font-bold uppercase tracking-wider">Administrator</span>
                                                    ) : (
                                                        <span className="text-slate-300 uppercase tracking-wider">Standard_User</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Welcome Card */}
                                    <div className="p-5 sm:p-6 bg-[#121212] border border-white/10 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-[80px] pointer-events-none" />
                                        <h2 className="text-base sm:text-lg font-bold text-[#ec5b13] mb-2 uppercase tracking-tight flex items-center gap-2">
                                            <FaTerminal /> System_Welcome
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed relative z-10">
                                            Navigate to the <span className="text-[#8b5cf6] font-bold">Config_Prefs</span> tab to customize your data feed. Select your preferred protocols to filter the most relevant tech intel.
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
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div className="p-5 sm:p-6 bg-[#121212] border border-white/10 rounded-2xl">
                                        <h2 className="text-base sm:text-lg font-bold text-white mb-1 uppercase tracking-tight flex items-center gap-2">
                                            <FaSlidersH className="text-[#8b5cf6]" /> Data_Protocols
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 font-mono mb-6">// Select preferred intel channels for your feed</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
                                            {GENRES.map((genre) => {
                                                const isSelected = selectedPreferences.includes(genre.id);
                                                return (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        key={genre.id}
                                                        onClick={() => handleTogglePreference(genre.id)}
                                                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all ${isSelected
                                                            ? 'bg-[#ec5b13]/10 border-[#ec5b13]/30 text-white'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        <span className="text-xl">{genre.icon}</span>
                                                        <div>
                                                            <span className="font-bold text-sm block">{genre.name}</span>
                                                            <span className="font-mono text-[10px] text-slate-600 uppercase">{genre.code}_PROTOCOL</span>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="ml-auto w-2 h-2 rounded-full bg-[#ec5b13]" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                                            <div>
                                                <h3 className="font-bold text-sm text-white uppercase tracking-tight">Neural_Feed_Newsletter</h3>
                                                <p className="text-xs text-slate-500 font-mono mt-1">Receive weekly intel summaries.</p>
                                            </div>
                                            <button
                                                onClick={() => setNewsletterSubscribed(!newsletterSubscribed)}
                                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${newsletterSubscribed ? 'bg-[#ec5b13]' : 'bg-slate-700'}`}
                                            >
                                                <motion.div
                                                    className="w-4 h-4 rounded-full bg-white absolute"
                                                    animate={{ left: newsletterSubscribed ? 'calc(100% - 20px)' : '4px' }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/5 pt-5 sm:pt-6 gap-3">
                                            <div>
                                                {saveMessage.text && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className={`text-xs sm:text-sm font-mono ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                                                    >
                                                        {saveMessage.type === 'success' ? '✓' : '⚠'} {saveMessage.text}
                                                    </motion.span>
                                                )}
                                            </div>
                                            <motion.button
                                                onClick={handleSavePreferences}
                                                disabled={isSaving}
                                                className={`px-5 sm:px-6 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${isSaving
                                                    ? 'bg-white/5 cursor-not-allowed text-slate-600 border border-white/5'
                                                    : 'bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white'
                                                    }`}
                                                whileHover={!isSaving ? { scale: 1.03 } : {}}
                                                whileTap={!isSaving ? { scale: 0.97 } : {}}
                                            >
                                                {isSaving ? (
                                                    <><div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" /> Syncing...</>
                                                ) : (
                                                    'Sync_Preferences'
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'saved' && (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div className="p-5 sm:p-6 bg-[#121212] border border-white/10 rounded-2xl">
                                        <h2 className="text-base sm:text-lg font-bold text-white mb-1 uppercase tracking-tight flex items-center gap-2">
                                            <FaBookmark className="text-[#8b5cf6]" /> Saved_Intel
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 font-mono mb-6">// Your archived data packets</p>

                                        {isLoadingSaved ? (
                                            <div className="flex justify-center py-8">
                                                <div className="w-8 h-8 border-2 border-[#ec5b13] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : savedBlogs.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {savedBlogs.map(blog => (
                                                    <div key={blog._id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                                        <h3 className="font-bold text-sm text-white mb-2">{blog.title}</h3>
                                                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{blog.summary || blog.content?.substring(0, 100)}</p>
                                                        <Link to={`/blog/${blog._id}`} className="text-[#ec5b13] text-xs font-mono uppercase tracking-widest font-bold">Initialize_Read &rarr;</Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500 font-mono text-sm">
                                                No data archived. Browse the Neural_Feed to save Intel.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
