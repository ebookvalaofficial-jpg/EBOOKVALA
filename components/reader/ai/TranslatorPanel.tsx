'use client';

import React, { useState } from 'react';
import { Languages, RefreshCw, Copy, Check, ArrowRightLeft } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';

interface TranslatorPanelProps {
  bookId: string;
  chapterId?: string;
  chapterText?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'Hindi', label: 'Hindi (हिंदी)' },
  { code: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { code: 'Spanish', label: 'Spanish (Español)' },
  { code: 'French', label: 'French (Français)' },
  { code: 'English', label: 'English' },
];

export default function TranslatorPanel({
  bookId,
  chapterId,
  chapterText = '',
  userPlan = 'FREE',
  isUnlocked = false,
}: TranslatorPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'TOGGLE'>('SIDE_BY_SIDE');
  const [activeToggle, setActiveToggle] = useState<'ORIGINAL' | 'TRANSLATED'>('TRANSLATED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!isUnlocked || !chapterText) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapterId,
          textSnippet: chapterText.slice(0, 3000),
          targetLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to translate');
        return;
      }

      setTranslatedText(data.translatedText);
    } catch (err) {
      setError('Error connecting to translation engine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isUnlocked) {
    return (
      <AIFeatureGate featureName="AI Multilingual Translator" requiredPlan="PLUS" userPlan={userPlan}>
        <div />
      </AIFeatureGate>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">AI Multilingual Translator</h3>
        </div>

        {/* View Mode Switch */}
        <div className="flex items-center p-1 rounded-2xl bg-theme-surface border border-theme/60 text-[11px] font-bold">
          <button
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            className={`px-3 py-1 rounded-xl transition-all ${
              viewMode === 'SIDE_BY_SIDE' ? 'bg-blue-600 text-white shadow-sm' : 'text-theme-muted hover:text-theme-heading'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('TOGGLE')}
            className={`px-3 py-1 rounded-xl transition-all ${
              viewMode === 'TOGGLE' ? 'bg-blue-600 text-white shadow-sm' : 'text-theme-muted hover:text-theme-heading'
            }`}
          >
            Toggle View
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-theme-surface/40 p-4 rounded-2xl border border-theme/40">
        <label className="text-xs font-bold text-theme-heading">Target Language:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="px-4 py-2 rounded-xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
          <span>Translate</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Output Display */}
      {translatedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-theme-muted">
              {viewMode === 'TOGGLE' && (
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => setActiveToggle('ORIGINAL')}
                    className={`px-3 py-1 rounded-xl text-xs ${activeToggle === 'ORIGINAL' ? 'bg-blue-600 text-white font-bold' : 'text-theme-muted'}`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setActiveToggle('TRANSLATED')}
                    className={`px-3 py-1 rounded-xl text-xs ${activeToggle === 'TRANSLATED' ? 'bg-blue-600 text-white font-bold' : 'text-theme-muted'}`}
                  >
                    {targetLanguage}
                  </button>
                </div>
              )}
            </span>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl border border-theme/60 text-theme-muted hover:text-theme-heading text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {viewMode === 'SIDE_BY_SIDE' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme/40 space-y-2">
                <span className="text-[10px] font-black uppercase text-theme-muted">Original English</span>
                <p className="text-xs text-theme-text font-semibold leading-relaxed max-h-60 overflow-y-auto">
                  {chapterText.slice(0, 1000)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-500">{targetLanguage} AI Translation</span>
                <p className="text-xs text-theme-heading font-semibold leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                  {translatedText}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-theme-surface/60 border border-theme/40 text-xs font-semibold text-theme-heading leading-relaxed">
              {activeToggle === 'ORIGINAL' ? chapterText.slice(0, 1000) : translatedText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
