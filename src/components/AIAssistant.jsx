import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const suggestions = [
  'How much does house construction cost?',
  'How long does waterproofing take?',
  'Best flooring for living room?',
  'Vastu tips for new home?',
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m MBC AI — your construction assistant. Ask me about costs, timelines, materials, or Vastu tips! 🏠' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const res = await api.post('/api/ai/chat', {
      prompt: `You are MBC AI, the helpful assistant for Mahathi Building Contractors — a premium construction company in Andhra Pradesh, India. Answer construction-related questions concisely and helpfully. Focus on house construction, interiors, waterproofing, electrical, plumbing, flooring, painting, and smart home topics. If asked about pricing, explain that pricing depends on the project and they should book a free consultation. Keep responses under 80 words.

Conversation so far:
${history}

User: ${q}
Assistant:`
    });

    setMessages(prev => [...prev, { role: 'assistant', content: res.data?.result || 'I\'m here to help! Please contact us at +91 86880 74469 for detailed assistance.' }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        className="fixed bottom-36 right-5 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-105 transition-transform"
        title="MBC AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A0E1A]" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-4 z-50 w-80 md:w-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">MBC AI</p>
                  <p className="text-[10px] text-green-400">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600/80 text-white'
                      : 'bg-white/5 text-white/80'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/8 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about construction..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/40"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-blue-600/80 hover:bg-blue-600 disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}