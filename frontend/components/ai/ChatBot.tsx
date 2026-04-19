'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { aiAPI } from '@/lib/api';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

const QUICK_REPLIES = ['Find a plumber near me', 'Emergency service', 'Best tutors', 'Cleaning services'];

const ChatBot: React.FC = () => {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome', role: 'assistant', content: 'Hi! I\'m your AI assistant. I can help you find services, compare providers, or answer any questions. What do you need today?', timestamp: new Date(),
  }]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res     = await aiAPI.chat({ message: text, history });
      const reply   = res.data.data?.reply || 'I couldn\'t process that. Please try again.';
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again shortly.', timestamp: new Date() }]);
    } finally { setTyping(false); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] text-[#0A0A0F] shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_40px_rgba(212,175,55,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
        aria-label="Open AI chat"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A0A0F]" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden animate-[scaleIn_0.2s_ease_forwards] origin-bottom-right">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#A8892B]">
            <div className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.2)] flex items-center justify-center">
              <Bot size={18} className="text-[#0A0A0F]" />
            </div>
            <div>
              <p className="text-[#0A0A0F] font-bold text-sm">Smart Service AI</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                <span className="text-[#0A0A0F]/70 text-[10px]">Online · Powered by Gemini</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-[#0A0A0F]/60 hover:text-[#0A0A0F] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 max-h-72 min-h-[200px]">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-2 max-w-[85%]', m.role === 'user' ? 'ml-auto flex-row-reverse' : '')}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[rgba(212,175,55,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={11} className="text-[#D4AF37]" />
                  </div>
                )}
                <div className={cn(
                  'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-medium rounded-br-sm'
                    : 'bg-[#12121A] text-[#C8C8D8] rounded-bl-sm border border-[rgba(212,175,55,0.08)]',
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-[rgba(212,175,55,0.15)] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={11} className="text-[#D4AF37]" />
                </div>
                <div className="bg-[#12121A] border border-[rgba(212,175,55,0.08)] px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#9090A0] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((r) => (
                <button key={r} onClick={() => send(r)}
                  className="px-2.5 py-1 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-xs rounded-full hover:bg-[rgba(212,175,55,0.15)] transition-colors">
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-[rgba(212,175,55,0.08)]">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask me anything..."
              className="flex-1 bg-[#12121A] border border-[rgba(212,175,55,0.15)] text-[#F5F5F5] text-sm placeholder-[#55556A] rounded-xl px-3 py-2 outline-none focus:border-[rgba(212,175,55,0.4)] transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-9 h-9 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-[0_4px_12px_rgba(212,175,55,0.4)] transition-all"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
