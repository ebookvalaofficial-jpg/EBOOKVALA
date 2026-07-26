'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, FastForward, Info, Sparkles, RefreshCw } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';

interface VoiceNarratorPlayerProps {
  bookId: string;
  chapterId?: string;
  chapterText?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function VoiceNarratorPlayer({
  bookId,
  chapterId,
  chapterText = '',
  userPlan = 'FREE',
  isUnlocked = false,
}: VoiceNarratorPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMockFallback, setIsMockFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateAudio = async () => {
    if (!isUnlocked || !chapterText) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapterId,
          textSnippet: chapterText.slice(0, 1000),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.isGated) {
          setError(data.error);
        } else {
          setError(data.error || 'Failed to generate voice narration');
        }
        return;
      }

      setAudioUrl(data.audioUrl || null);
      setIsMockFallback(data.isMockFallback || false);
      setFallbackMessage(data.message || null);
    } catch (err) {
      setError('Error generating audio narration');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isMockFallback || !audioRef.current) {
      // If Web Speech API browser fallback is available, trigger speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
        } else {
          const utterance = new SpeechSynthesisUtterance(chapterText.slice(0, 500));
          utterance.rate = playbackSpeed;
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(!isPlaying);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  if (!isUnlocked) {
    return (
      <AIFeatureGate featureName="AI Voice Narrator" requiredPlan="PRO" userPlan={userPlan}>
        <div />
      </AIFeatureGate>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 text-theme-text shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">AI Voice Narrator</h3>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">
          Studio Audio
        </span>
      </div>

      {!audioUrl && !isMockFallback ? (
        <div className="p-6 text-center space-y-4 bg-theme-surface/40 rounded-2xl border border-theme/40">
          <Volume2 className="w-8 h-8 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-theme-heading">Generate Chapter Audio</h4>
            <p className="text-xs text-theme-muted">Listen to realistic neural voice narration for this chapter.</p>
          </div>

          <button
            onClick={handleGenerateAudio}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 mx-auto disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Synthesize Voice</span>
          </button>

          {error && (
            <p className="text-xs font-bold text-red-500 pt-2">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Graceful Fallback Message Notice */}
          {isMockFallback && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fallbackMessage || 'Coming soon — voice narration will be available once configured. Browser speech synthesis active.'}</span>
            </div>
          )}

          {/* HTML5 Audio Player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Audio Player Controls Bar */}
          <div className="p-4 rounded-2xl bg-theme-surface/80 border border-theme/60 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-xl hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Playback Speed Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    playbackSpeed === speed
                      ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                      : 'text-theme-muted hover:text-theme-heading'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
