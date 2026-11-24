'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaCheck, FaPaperPlane, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export const InArticleNewsletter: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage('');

    if (user) {
      // Authenticated toggle
      setLoading(true);
      try {
        await updatePreferences(undefined, true);
        setSuccess(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to update newsletter status');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Anonymous email submission via /api/newsletter/subscribe
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid terminal/email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Subscription transmission failed');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network node sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#111116] via-[#14141c] to-[#0a0a0e] border border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Visual Accent Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#ec5b13]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8b5cf6]/10 blur-[90px] pointer-events-none" />

      {/* Terminal Title Pill */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#ec5b13] animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#ec5b13] font-bold">
          TERMINAL_SYNC // DISPATCH PROTOCOL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* Copy Column */}
        <div className="md:col-span-3">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
            Sync Deep Intel Straight to Your Terminal
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Autonomous agentic code analysis, developer productivity breakthroughs, and architectural synthesis delivered directly to your inbox every Friday.
          </p>
        </div>

        {/* Input / Action Column */}
        <div className="md:col-span-2">
          {success || (user && user.newsletterSubscribed) ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-[#ec5b13]/10 border border-[#ec5b13]/40 flex items-center gap-3 text-white"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ec5b13] flex items-center justify-center text-white shrink-0">
                <FaCheck className="text-sm" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-[#ec5b13] uppercase tracking-wider">
                  Node Synchronized
                </p>
                <p className="text-xs text-slate-300">
                  {user?.email || 'Transmission link active for your node.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || email}
                  readOnly={!!user}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@matrix.io"
                  className={`w-full bg-black/60 border ${
                    errorMessage ? 'border-red-500' : 'border-white/15 focus:border-[#ec5b13]'
                  } rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ec5b13] transition-all`}
                  required
                />
              </div>

              {errorMessage && (
                <p className="font-mono text-xs text-red-400 mt-1">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ec5b13] hover:bg-[#ff6e26] active:scale-[0.98] text-white font-mono text-xs uppercase tracking-wider font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ec5b13]/25 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" />
                    <span>Initialize Sync Protocol</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InArticleNewsletter;
