import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaTerminal, FaFingerprint, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 selection:bg-[#ec5b13] selection:text-white"
        >
            {/* Background glows */}
            <div className="fixed top-20 right-20 w-72 h-72 bg-[#ec5b13]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-20 left-20 w-56 h-56 bg-[#8b5cf6]/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Card */}
                <div className="p-6 sm:p-8 bg-[#121212] border border-white/10 rounded-2xl relative overflow-hidden">
                    {/* Accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ec5b13] via-[#8b5cf6] to-[#06b6d4]" />

                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <motion.div
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ec5b13]/10 rounded-lg text-[#ec5b13] font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <FaTerminal className="text-xs" /> Auth_Protocol
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Access_Terminal</h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-mono mt-2">// Enter credentials to authenticate</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs sm:text-sm font-mono"
                        >
                            <span className="mr-2">⚠</span> {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                                <FaFingerprint className="text-[#8b5cf6] text-xs" /> Identity_Key
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-[#ec5b13] focus:border-[#ec5b13] transition-all outline-none placeholder:text-slate-600"
                                placeholder="user@network.io"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                                <FaLock className="text-[#8b5cf6] text-xs" /> Access_Key
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-[#ec5b13] focus:border-[#ec5b13] transition-all outline-none placeholder:text-slate-600"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 sm:py-3.5 rounded-xl text-white font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${loading
                                ? 'bg-[#ec5b13]/50 cursor-not-allowed'
                                : 'bg-[#ec5b13] hover:bg-[#ec5b13]/90 active:scale-[0.98]'
                                }`}
                            whileHover={!loading ? { scale: 1.01 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                            ) : (
                                'Execute Login'
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs sm:text-sm font-mono">
                            No account registered?{' '}
                            <Link to="/register" className="text-[#ec5b13] hover:text-[#ec5b13]/80 transition-colors font-bold">
                                Create_Node →
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom status */}
                <div className="mt-4 flex justify-center gap-4 font-mono text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-widest">
                    <span>Encryption: AES-256</span>
                    <span className="text-slate-800">|</span>
                    <span>Protocol: TLS_1.3</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Login;
