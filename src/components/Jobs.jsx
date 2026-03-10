import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaBriefcase, FaSearch, FaUpload, FaRobot, FaShieldAlt, FaFlask, FaCogs, FaThLarge } from 'react-icons/fa';
import axios from 'axios';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

const Jobs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterType, setFilterType] = useState('All');

    // Live Jobs States
    const [jobs, setJobs] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Resume Upload States
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [matchedSkills, setMatchedSkills] = useState([]);

    const roles = [
        { id: 'All', name: 'All Units', icon: FaThLarge },
        { id: 'Frontend', name: 'Engineering', icon: FaCogs },
        { id: 'Machine Learning', name: 'AI & ML', icon: FaRobot },
        { id: 'Cybersecurity', name: 'Security', icon: FaShieldAlt },
        { id: 'Data Science', name: 'Research', icon: FaFlask },
        { id: 'Full Stack', name: 'Operations', icon: FaBriefcase }
    ];
    const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

    useEffect(() => {
        handleSearchJobs('Technology');
        // eslint-disable-next-line
    }, []);

    const handleSearchJobs = async (customQuery = null) => {
        const queryTerm = typeof customQuery === 'string' ? customQuery : searchTerm;
        let finalQuery = queryTerm.trim() === '' && filterRole === 'All' ? 'Technology' : queryTerm;

        setIsSearching(true);
        setSearchError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

            let queryStr = finalQuery;
            if (filterRole !== 'All' && !queryStr.includes(filterRole)) {
                queryStr += ` ${filterRole}`;
            }

            const params = { query: queryStr };
            if (filterType !== 'All') {
                const typeMap = {
                    'Full-time': 'FULLTIME',
                    'Part-time': 'PARTTIME',
                    'Contract': 'CONTRACTOR',
                    'Internship': 'INTERN'
                };
                params.employment_types = typeMap[filterType];
            }

            const response = await axios.get(`${apiUrl}/jobs/search`, { params });
            if (response.data.success && response.data.data) {
                setJobs(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setSearchError("Failed to fetch live jobs. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setUploadError("Please upload a valid PDF file.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setMatchedSkills([]);

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/jobs/extract-skills`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success && response.data.skills.length > 0) {
                const extractedSkills = response.data.skills;
                setMatchedSkills(extractedSkills);

                const searchKeywords = extractedSkills.slice(0, 3).join(" ");
                setSearchTerm(searchKeywords);
                handleSearchJobs(searchKeywords);
            }
        } catch (err) {
            console.error(err);
            setUploadError(err.response?.data?.error || "Failed to analyze resume. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        handleSearchJobs();
    };

    // Generate a pseudo-random department code from job data
    const getDeptCode = (job) => {
        const prefixes = ['ENG', 'ETH', 'RES', 'OPS', 'SEC', 'NET', 'SYS', 'DAT'];
        const hash = (job.job_id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return `${prefixes[hash % prefixes.length]}_${String(hash % 999).padStart(3, '0')}_${(job.job_employment_type || 'CORE').substring(0, 3).toUpperCase()}`;
    };

    // Random status text
    const getStatus = (job) => {
        const statuses = ['OPEN_AVAILABLE', 'INTERVIEWING_NOW', 'HIGH_DEMAND', 'ACTIVE_SCREENING'];
        const hash = (job.job_id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return statuses[hash % statuses.length];
    };

    const getPriority = (job) => {
        const priorities = ['HIGH_CRITICAL', 'MEDIUM_PRIORITY', 'HIGH_URGENCY', 'NORMAL_STANDARD'];
        const hash = (job.job_id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return priorities[(hash + 1) % priorities.length];
    };

    const getPriorityColor = (priority) => {
        if (priority.includes('HIGH')) return 'text-red-500';
        if (priority.includes('MEDIUM')) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] text-slate-100 pt-16 sm:pt-20 md:pt-24 selection:bg-[#ec5b13] selection:text-white"
        >
            {/* Hero Banner */}
            <section className="relative px-4 sm:px-6 py-10 sm:py-14 md:py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#ec5b13]/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-[#121212] border border-white/10 relative overflow-hidden">
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ec5b13]/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8b5cf6]/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8 relative z-10">
                            <div className="grow">
                                {/* System Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ec5b13] rounded-lg text-white font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-4 sm:mb-6"
                                >
                                    <span>⚡</span> System Active: V2.026.4
                                </motion.div>

                                {/* Title */}
                                <motion.h1
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.6 }}
                                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-[#ec5b13] mb-4 sm:mb-6 glitch-text"
                                >
                                    FUTURE_ROLES
                                </motion.h1>

                                {/* Subtitle */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed"
                                >
                                    Join the vanguard of cognitive architecture. We're building the infrastructure of 2026 — secure, autonomous, and ethically aligned.
                                </motion.p>
                            </div>

                            {/* Uptime Widget */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 shrink-0 self-start"
                            >
                                <FaBriefcase className="text-3xl sm:text-4xl text-[#ec5b13] mb-2" />
                                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Uptime: 99.99%</span>
                            </motion.div>
                        </div>

                        {/* Resume Upload */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                        >
                            <label className="cursor-pointer group">
                                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                <div className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all border ${isUploading
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border-white/5'
                                    : 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 group-hover:text-white'
                                    }`}>
                                    {isUploading ? (
                                        <><div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" /> Parsing_Resume...</>
                                    ) : (
                                        <><FaUpload className="text-xs" /> Upload_Resume.pdf</>
                                    )}
                                </div>
                            </label>
                            <span className="font-mono text-[10px] sm:text-xs text-slate-600">AI-powered skill extraction & job matching</span>
                        </motion.div>
                        {uploadError && <p className="text-red-400 text-xs mt-3 font-mono">{uploadError}</p>}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
                {/* Search Bar */}
                <motion.form
                    onSubmit={onSearchSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
                        <span className="text-[#ec5b13] font-mono text-lg pl-4 pr-2 hidden sm:block">›</span>
                        <input
                            type="text"
                            placeholder="Search_Roles ..."
                            className="grow bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base font-mono text-white placeholder:text-slate-600 focus:outline-none min-w-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="p-3 sm:p-4 text-slate-400 hover:text-[#ec5b13] transition-colors shrink-0 disabled:opacity-50"
                        >
                            <FaSearch />
                        </button>
                    </div>
                </motion.form>

                {/* Extracted Skills Display */}
                <AnimatePresence>
                    {matchedSkills.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 sm:mb-8 p-4 sm:p-5 bg-[#121212] border border-[#8b5cf6]/20 rounded-xl overflow-hidden"
                        >
                            <p className="text-xs sm:text-sm text-slate-400 mb-3 font-mono">// Skills extracted from resume — search updated:</p>
                            <div className="flex flex-wrap gap-2">
                                {matchedSkills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs sm:text-sm rounded-lg border border-[#8b5cf6]/20 font-mono">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Role + Type Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 sm:mb-8 space-y-4"
                >
                    {/* Role filter */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {roles.map((role, index) => {
                            const Icon = role.icon;
                            return (
                                <motion.button
                                    key={role.id}
                                    className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border flex items-center gap-2 ${filterRole === role.id
                                        ? 'bg-[#ec5b13] text-white border-[#ec5b13]'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    onClick={() => { setFilterRole(role.id); handleSearchJobs(searchTerm); }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                >
                                    <Icon className="text-xs" />
                                    {role.name}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Type filter */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {types.map((t) => (
                            <button
                                key={t}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border ${filterType === t
                                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                                onClick={() => { setFilterType(t); handleSearchJobs(searchTerm); }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Status Handling */}
                {searchError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-5 sm:p-6 rounded-xl border-l-4 border-red-500 mb-6 sm:mb-8"
                    >
                        <h3 className="font-bold text-sm mb-1 text-red-400 font-mono uppercase tracking-tight">
                            <span className="mr-2">⚠</span> Connection_Error
                        </h3>
                        <p className="text-slate-400 text-sm">{searchError}</p>
                    </motion.div>
                )}

                {/* Jobs Grid */}
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                        <motion.div className="relative">
                            <motion.div
                                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ec5b13] border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#8b5cf6]"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.2 }}
                            />
                        </motion.div>
                        <p className="mt-4 text-slate-500 text-sm font-mono uppercase tracking-wider">Scanning_Job_Network...</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
                    >
                        {jobs.length > 0 ? (
                            jobs.map((job) => {
                                const deptCode = getDeptCode(job);
                                const status = getStatus(job);
                                const priority = getPriority(job);

                                return (
                                    <motion.div
                                        key={job.job_id}
                                        variants={item}
                                        className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col h-full hover:border-[#ec5b13]/30 transition-all duration-500 group"
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="px-2 py-1 bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-mono uppercase rounded border border-[#ec5b13]/20 tracking-wider">
                                                {deptCode}
                                            </span>
                                            {job.employer_logo && (
                                                <img
                                                    src={job.employer_logo}
                                                    alt={job.employer_name}
                                                    className="w-8 h-8 object-contain bg-white rounded-md p-0.5"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 uppercase tracking-tight leading-snug group-hover:text-[#ec5b13] transition-colors">
                                            {job.job_title}
                                        </h2>

                                        {/* Description */}
                                        {job.job_description && (
                                            <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 line-clamp-2 leading-relaxed">
                                                {job.job_description.substring(0, 150)}...
                                            </p>
                                        )}

                                        {/* Terminal Status Indicators */}
                                        <div className="space-y-2 mb-5 sm:mb-6 mt-auto font-mono text-[10px] sm:text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                <span className="text-slate-500">STATUS:</span>
                                                <span className="text-white font-bold tracking-wider">{status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.includes('HIGH') ? 'bg-red-500' : priority.includes('MEDIUM') ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                <span className="text-slate-500">PRIORITY:</span>
                                                <span className={`font-bold tracking-wider ${getPriorityColor(priority)}`}>{priority}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shrink-0" />
                                                <span className="text-slate-500">LOCATION:</span>
                                                <span className="text-white font-bold tracking-wider">
                                                    {job.job_city ? `${job.job_city.toUpperCase().replace(/ /g, '_')}` : (job.job_is_remote ? 'REMOTE_NODE' : 'GLOBAL_FLEET')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Apply Button */}
                                        <a
                                            href={job.job_apply_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 bg-[#ec5b13] text-white rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:bg-[#ec5b13]/90 transition-all"
                                        >
                                            Execute APPLY_NOW <FaArrowRight className="text-xs" />
                                        </a>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 sm:py-24">
                                <h3 className="text-xl sm:text-2xl font-black mb-3 text-white uppercase tracking-tighter">No_Roles_Found</h3>
                                <p className="text-slate-500 font-mono text-xs sm:text-sm">Adjust search parameters or upload a resume to match nodes.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Jobs;
