'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Sparkles, Layers, HelpCircle, Languages, Headphones, 
  Send, Check, ArrowRight, Play, RefreshCw 
} from 'lucide-react';

const aiFeatures = [
  {
    id: 'chat',
    icon: Bot,
    title: 'Chat with Book',
    description: 'Ask questions directly to any book page or chapter. Get instant, context-aware answers with page number citations.',
    badge: 'Contextual AI',
    demoType: 'chat'
  },
  {
    id: 'summary',
    icon: Sparkles,
    title: 'AI Summary Engine',
    description: 'Transform lengthy 300-page eBooks into 5-minute executive summaries, key takeaways, and action steps.',
    badge: 'Instant Digest',
    demoType: 'summary'
  },
  {
    id: 'flashcards',
    icon: Layers,
    title: 'Smart Flashcards',
    description: 'Auto-generate spaced repetition flashcard decks from highlighted quotes and technical terms in one click.',
    badge: 'Active Recall',
    demoType: 'flashcard'
  },
  {
    id: 'quiz',
    icon: HelpCircle,
    title: 'Quiz Generator',
    description: 'Test your comprehension after completing chapters with dynamic AI quizzes tailored to your knowledge level.',
    badge: 'Self Assessment',
    demoType: 'quiz'
  },
  {
    id: 'translator',
    icon: Languages,
    title: 'Real-Time Translator',
    description: 'Translate complex paragraphs into Hindi, English, Spanish, or 30+ languages without breaking reading flow.',
    badge: 'Multilingual',
    demoType: 'translator'
  },
  {
    id: 'audiobook',
    icon: Headphones,
    title: 'Human AI Audiobook',
    description: 'Convert any text eBook into a realistic, human-narrated audiobook with adjustable speed and accent controls.',
    badge: 'Neural Voice',
    demoType: 'audio'
  }
];

export default function AIShowcase() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Explain the core wealth principle in Chapter 4.' },
    { sender: 'ai', text: 'Chapter 4 emphasizes automating index fund investments monthly to leverage compound interest over 10+ years (Page 84).' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMsg = { sender: 'user', text: chatMessage };
    setMessages((prev) => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Analyzing eBook context... Here is the key insight for "${chatMessage}": Focus on daily 1% incremental improvements.` }
      ]);
    }, 600);
  };

  return (
    <section id="ai-showcase" className="py-24 bg-theme-bg relative overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary-purple bg-purple-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Powered by EbookVala AI
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Read 10x Faster with AI Intelligence
          </h2>
          <p className="text-base sm:text-lg text-theme-body">
            Unlock super-human retention, instant summaries, and interactive book conversations right inside your reader.
          </p>
        </div>

        {/* 6 Interactive AI Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {aiFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-lg flex flex-col justify-between group hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-secondary-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-secondary-purple bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-theme-heading font-montserrat mb-2 group-hover:text-secondary-purple transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-body leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Looping Micro-Animation Mockup Box */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 text-white border border-slate-800 text-xs font-mono">
                  {feat.demoType === 'chat' && (
                    <div className="flex items-center justify-between text-[11px] text-blue-400">
                      <span>&gt; AI: &quot;Page 42 summary ready&quot;</span>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    </div>
                  )}
                  {feat.demoType === 'summary' && (
                    <div className="space-y-1 text-[11px]">
                      <div className="text-purple-400 font-bold">Key Takeaway #1:</div>
                      <div className="text-slate-300 truncate">• Focus on system quality over raw goals.</div>
                    </div>
                  )}
                  {feat.demoType === 'flashcard' && (
                    <div className="flex items-center justify-between text-[11px] text-amber-400">
                      <span>Card 1/20: Cognitive Bias</span>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  )}
                  {feat.demoType === 'quiz' && (
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Q1 Correct! +10 XP
                    </div>
                  )}
                  {feat.demoType === 'translator' && (
                    <div className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span className="text-blue-400">EN</span> &rarr; <span className="text-emerald-400">HI</span>: Instant Translation
                    </div>
                  )}
                  {feat.demoType === 'audio' && (
                    <div className="flex items-center gap-2 text-[11px] text-yellow-400">
                      <Play className="w-3.5 h-3.5 fill-yellow-400" /> 1.25x Playing Chapter 2
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Interactive AI Playground Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-montserrat">Live AI Book Chat Playground</h4>
              <p className="text-xs text-slate-400">Test asking questions to our simulated eBook assistant</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-3 rounded-2xl text-xs sm:text-sm ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about the book..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
