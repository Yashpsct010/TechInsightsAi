import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const roles = ['All', 'Frontend', 'Backend', 'Full Stack', 'Machine Learning', 'Cybersecurity', 'Data Science'];
    const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

    useEffect(() => {
        // Initial fetch on mount
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

            // Build the string combined with roles if it's not "All"
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

            const response = await axios.get(`${apiUrl}/api/jobs/search`, { params });
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
            const response = await axios.post(`${apiUrl}/api/jobs/extract-skills`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success && response.data.skills.length > 0) {
                const extractedSkills = response.data.skills;
                setMatchedSkills(extractedSkills);

                const searchKeywords = extractedSkills.slice(0, 3).join(" "); // use top 3 for cleaner queries
                setSearchTerm(searchKeywords);
                handleSearchJobs(searchKeywords);
            }
        } catch (err) {
            console.error(err);
            setUploadError(err.response?.data?.error || "Failed to analyze resume. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input so same file can trigger again
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        handleSearchJobs();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 max-w-6xl pt-20 md:pt-28"
        >
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl py-2 sm:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                            Latest Tech Jobs
                        </h1>
                        <p className="text-gray-400">Discover top opportunities or let AI match you based on your resume.</p>
                    </div>

                    {/* AI Resume Matcher */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] w-full md:w-auto">
                        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            AI Resume Matcher
                        </h3>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer relative overflow-hidden group">
                                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                ${isUploading ? 'bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-500 hover:text-white'}`}>
                                    {isUploading ? (
                                        <><div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div> Parsing...</>
                                    ) : (
                                        <>Upload PDF Resume</>
                                    )}
                                </div>
                            </label>
                        </div>
                        {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
                    </div>
                </div>

                {/* Extracted Skills Display */}
                <AnimatePresence>
                    {matchedSkills.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 bg-slate-800/50 border border-fuchsia-500/20 rounded-lg overflow-hidden"
                        >
                            <p className="text-sm text-gray-300 mb-2">Based on your resume, we extracted these key skills and updated your live search:</p>
                            <div className="flex flex-wrap gap-2">
                                {matchedSkills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-fuchsia-900/40 text-fuchsia-300 text-sm rounded-full border border-fuchsia-500/30">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters Section */}
                <div className="bg-slate-800 shadow-md rounded-lg p-4 mb-8 border border-slate-700">
                    <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by keyword, skill, or location..."
                            className="grow px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" disabled={isSearching} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors border border-cyan-400/30 disabled:opacity-50">
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Role Preset</label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => { setFilterRole(r); handleSearchJobs(searchTerm); }}
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${filterRole === r ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Job Type</label>
                            <div className="flex flex-wrap gap-2">
                                {types.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setFilterType(t); handleSearchJobs(searchTerm); }}
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === t ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Handling */}
                {searchError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8 text-center">
                        {searchError}
                    </div>
                )}

                {/* Jobs Grid */}
                {isSearching ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <motion.div
                                    key={job.job_id}
                                    variants={item}
                                    className="bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-all border border-slate-700 relative flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {job.employer_logo && (
                                                <img src={job.employer_logo} alt={job.employer_name} className="w-10 h-10 object-contain bg-white rounded-md p-1" />
                                            )}
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-1 line-clamp-1">{job.job_title}</h2>
                                                <p className="text-cyan-400 font-medium">{job.employer_name}</p>
                                            </div>
                                        </div>
                                        {job.job_employment_type && (
                                            <span className="bg-fuchsia-900/30 text-fuchsia-300 px-3 py-1 text-xs rounded-full border border-fuchsia-500/30 ml-2 whitespace-nowrap">
                                                {job.job_employment_type.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 mb-6 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">
                                                {job.job_city ? `${job.job_city}, ${job.job_state}` : (job.job_is_remote ? 'Remote' : 'Location Not Provided')}
                                                {job.job_country && ` (${job.job_country})`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {job.job_min_salary ? `${job.job_salary_currency === 'USD' ? '$' : job.job_salary_currency}${job.job_min_salary.toLocaleString()} - ${job.job_max_salary.toLocaleString()}` : "Salary Undisclosed"}
                                        </div>
                                    </div>

                                    {job.job_description && (
                                        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                            {job.job_description.substring(0, 150)}...
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-auto">
                                        <span className="text-gray-500 text-xs">
                                            Posted: {new Date(job.job_posted_at_datetime_utc || Date.now()).toLocaleDateString()}
                                        </span>
                                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg text-sm font-medium transition-colors border border-cyan-500/50">
                                            Apply Now
                                        </a>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-slate-800 border border-slate-700 rounded-lg shadow-inner">
                                <p className="text-gray-400 text-lg">No live jobs found matching your criteria.</p>
                                <p className="text-sm text-gray-500 mt-2">Try removing some filters, adjusting your search term, or uploading a resume.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Jobs;
