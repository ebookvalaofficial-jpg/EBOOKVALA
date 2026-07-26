'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';
import AIUsageIndicator from './AIUsageIndicator';

interface Message {
  id?: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

interface AIChatPanelProps {
  bookId: string;
  bookTitle: string;
  chapterId?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function AIChatPanel({
  bookId,
  bookTitle,
  chapterId,
  userPlan = 'FREE',
  isUnlocked = false,
}: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ limit: number; currentUsage: number }>({ limit: 100, currentUsage: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/ai/chat?bookId=${bookId}`);
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, bookId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userPrompt = inputPrompt.trim();
    setInputPrompt('');
    setErrorMsg(null);

    // Optimistic UI update
    setMessages((prev) => [...prev, { role: 'USER', content: userPrompt }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapterId,
          prompt: userPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isGated) {
          setErrorMsg(data.error || 'AI Chat limit reached or plan upgrade required');
        } else {
          setErrorMsg(data.error || 'Failed to get AI response');
        }
        return;
      }

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err: any) {
      setErrorMsg('Network error communicating with AI server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-40 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl hover:scale-110 transition-all group flex items-center gap-2 font-bold text-xs"
        title="Ask Book AI Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
        <span className="hidden sm:inline">Ask AI Assistant</span>
      </button>

      {/* Slide-in Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md h-full bg-theme-card border-l border-theme glass-card flex flex-col shadow-2xl animate-slide-left text-theme-text">
            {/* Header */}
            <div className="p-4 border-b border-theme/60 flex items-center justify-between bg-theme-surface/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-theme-heading font-montserrat truncate max-w-[200px]">
                    AI Companion
                  </h3>
                  <p className="text-[10px] text-theme-muted truncate">{bookTitle}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full border border-theme/60 hover:bg-slate-500/10 text-theme-muted hover:text-theme-heading transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {!isUnlocked ? (
                <AIFeatureGate featureName="AI Chat Assistant" requiredPlan="PLUS" userPlan={userPlan}>
                  <div />
                </AIFeatureGate>
              ) : (
                <>
                  <div className="flex justify-center pb-2">
                    <AIUsageIndicator featureName="AI Chat" limit={100} currentUsage={messages.length / 2} userPlan={userPlan} />
                  </div>

                  {messages.length === 0 && (
                    <div className="p-6 rounded-3xl bg-theme-surface/50 border border-theme/40 text-center space-y-2 text-xs">
                      <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="font-bold text-theme-heading">Ask anything about this chapter!</p>
                      <p className="text-theme-muted text-[11px]">
                        Try: &quot;What are the 3 main takeaways?&quot; or &quot;Explain the core concepts simply.&quot;
                      </p>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        msg.role === 'USER' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'ASSISTANT' && (
                        <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm mt-0.5">
                          AI
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] font-semibold shadow-sm ${
                          msg.role === 'USER'
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-theme-surface/80 border border-theme/60 text-theme-text rounded-tl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.role === 'USER' && (
                        <div className="w-7 h-7 rounded-xl bg-slate-500/20 text-theme-muted font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-3 text-xs font-bold text-theme-muted p-3 bg-theme-surface/50 rounded-2xl border border-theme/40 w-max">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Claude AI is thinking...</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form */}
            {isUnlocked && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-theme/60 bg-theme-surface/40 flex items-center gap-2">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask a question about this chapter..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputPrompt.trim()}
                  className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
