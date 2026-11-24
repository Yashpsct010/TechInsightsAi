'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaBolt, FaMicrophoneAlt } from 'react-icons/fa';

interface AudioBriefingPlayerProps {
  title: string;
  body: string;
  readingTime?: number;
}

export const AudioBriefingPlayer: React.FC<AudioBriefingPlayerProps> = ({
  title,
  body,
  readingTime = 3,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [engine, setEngine] = useState<'VoiceStudio' | 'Neural Web Speech'>('Neural Web Speech');
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(readingTime * 60);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Strip HTML and synthesize briefing text
  const getBriefingText = () => {
    const cleanBody = body
      ? body
          .replace(/<pre[\s\S]*?<\/pre>/gi, '') // Skip heavy code blocks in audio briefing
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : '';
    // Extract first ~1200 characters for an executive audio briefing (~2-3 minutes)
    const summary = cleanBody.length > 1200 ? cleanBody.slice(0, 1200) + '...' : cleanBody;
    return `Technical Intelligence Briefing: ${title}. ${summary}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handlePlayVoiceStudio = async (textToSpeak: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          speed: playbackSpeed,
          voice: 'default',
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('audio')) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;

        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current?.duration) {
            setDuration(Math.ceil(audioRef.current.duration));
          }
        };

        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration || 1;
            setCurrentTime(Math.floor(current));
            setProgress((current / dur) * 100);
          }
        };

        audioRef.current.onended = () => {
          stopAudio();
        };

        await audioRef.current.play();
        setEngine('VoiceStudio');
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('VoiceStudio audio request failed, falling back to Web Speech:', err);
    }

    setIsLoading(false);
    return false;
  };

  const handlePlayWebSpeech = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Neural Speech Synthesis is not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Pick best English voice available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Estimate duration based on word count (~150 words per minute / speed)
    const wordCount = textToSpeak.split(/\s+/).length;
    const estimatedSeconds = Math.ceil((wordCount / (150 * playbackSpeed)) * 60);
    setDuration(estimatedSeconds);

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setEngine('Neural Web Speech');

      // Start elapsed timer for progress bar
      let elapsed = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setCurrentTime(elapsed);
        setProgress(Math.min(100, (elapsed / estimatedSeconds) * 100));
      }, 1000);
    };

    utterance.onend = () => {
      stopAudio();
    };

    utterance.onerror = (e) => {
      console.error('Web Speech error:', e);
      stopAudio();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      if (isPaused) {
        // Resume
        if (engine === 'VoiceStudio' && audioRef.current) {
          audioRef.current.play();
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        setIsPaused(false);
      } else {
        // Pause
        if (engine === 'VoiceStudio' && audioRef.current) {
          audioRef.current.pause();
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
        setIsPaused(true);
      }
      return;
    }

    // Start playing
    const textToSpeak = getBriefingText();
    // Try VoiceStudio API first; if unconfigured/offline, fall back smoothly to Web Speech
    const playedViaStudio = await handlePlayVoiceStudio(textToSpeak);
    if (!playedViaStudio) {
      handlePlayWebSpeech(textToSpeak);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (isPlaying && engine === 'Neural Web Speech') {
      // Re-trigger with new rate
      const textToSpeak = getBriefingText();
      handlePlayWebSpeech(textToSpeak);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 sm:mb-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d0d12] via-[#121218] to-[#0d0d12] border border-white/10 shadow-xl relative overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-[#ec5b13]/10 blur-[80px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ec5b13]/20 border border-[#ec5b13]/40 flex items-center justify-center text-[#ec5b13]">
            <FaVolumeUp className="text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">
              <span>AI Audio Briefing</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ec5b13]/15 text-[#ec5b13] border border-[#ec5b13]/30">
                {engine}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              VoiceStudio & Neural Speech Engine ~ {readingTime} min listen
            </p>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          {[1.0, 1.25, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                playbackSpeed === speed
                  ? 'bg-[#ec5b13] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls & Waveform */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/50 p-3 sm:p-4 rounded-xl border border-white/5">
        {/* Play / Pause / Stop Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="w-11 h-11 rounded-full bg-[#ec5b13] hover:bg-[#ff6e26] active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-[#ec5b13]/25 cursor-pointer disabled:opacity-50"
            aria-label={isPlaying && !isPaused ? 'Pause Briefing' : 'Play Briefing'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying && !isPaused ? (
              <FaPause className="text-sm" />
            ) : (
              <FaPlay className="text-sm ml-0.5" />
            )}
          </button>

          {isPlaying && (
            <button
              onClick={stopAudio}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Stop Briefing"
            >
              <FaStop className="text-xs" />
            </button>
          )}
        </div>

        {/* Equalizer Frequency Waveform Animation */}
        <div className="flex items-center gap-1 h-6 px-2">
          {[0.3, 0.7, 1.0, 0.5, 0.8, 0.4].map((scale, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#ec5b13] to-[#8b5cf6]"
              animate={{
                height: isPlaying && !isPaused ? [`${scale * 6}px`, `${scale * 24}px`, `${scale * 10}px`] : '4px',
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Scrubber & Time */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="font-mono text-xs text-slate-400 min-w-[36px] text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#ec5b13] to-[#8b5cf6] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          <span className="font-mono text-xs text-slate-400 min-w-[36px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioBriefingPlayer;
