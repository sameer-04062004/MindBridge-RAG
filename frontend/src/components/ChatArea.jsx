import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Stethoscope,
  Info
} from 'lucide-react';

const STARTER_PROMPTS = [
  { text: "How do I calm my nerves the night before an exam?", category: "Exam Stress (L1)", icon: Sparkles },
  { text: "What is active recall and spaced repetition?", category: "Study Skills (L0)", icon: FileText },
  { text: "I can't sleep or eat, everything feels completely hopeless", category: "High Distress (L2)", icon: AlertTriangle },
  { text: "Can you prescribe me medication for exam panic?", category: "Medical Query (L4)", icon: Stethoscope },
  { text: "I want to kill myself, I can't take this anymore", category: "Crisis Escalation (L3)", icon: Flame }
];

export default function ChatArea({ mode, setMode, onOpenBreathing }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      system: 'S2',
      text: "Hello! I'm **MindBridge**, your safe exam-stress and academic wellbeing companion.\n\nI combine evidence-based guidance from the **World Health Organization (WHO)** and university counselling services with a **rule-based safety layer**.\n\nHow are you feeling about your studies or upcoming exams?",
      risk_label: 'L0_NORMAL',
      risk_meta: {
        label: 'MindBridge Ready',
        badge_color: 'teal',
        description: 'Vetted student guidance active'
      },
      response_time: 0.05,
      retrieved_chunks: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const query = messageText || input;
    if (!query.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user', text: query.trim() }
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          system: mode
        })
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          system: data.system,
          text: data.text,
          risk_label: data.risk_label,
          risk_meta: data.risk_meta,
          response_time: data.response_time,
          retrieved_chunks: data.retrieved_chunks || []
        }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          system: mode,
          text: "I encountered a network issue connecting to the MindBridge engine. Please check that the backend server is running.",
          risk_label: 'ERROR',
          risk_meta: { badge_color: 'rose', label: 'Connection Error' },
          retrieved_chunks: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleChunkExpand = (msgId, index) => {
    const key = `${msgId}-${index}`;
    setExpandedChunks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRiskBadgeColor = (color) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'purple':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'blue':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'emerald':
      case 'teal':
        return 'bg-teal-500/15 border-teal-500/30 text-teal-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 min-h-0">
      
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender indicator */}
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {msg.role === 'user' ? (
                <>
                  <span className="text-[11px] font-medium text-slate-400">Student</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200">
                    MindBridge <span className="text-teal-400">[{msg.system || mode}]</span>
                  </span>

                  {/* Risk Badge */}
                  {msg.risk_meta?.label && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBadgeColor(msg.risk_meta.badge_color)}`}>
                      {msg.risk_meta.label}
                    </span>
                  )}

                  {/* Latency */}
                  {msg.response_time !== undefined && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.response_time}s
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bubble Card */}
            <div
              className={`relative group max-w-2xl rounded-2xl p-4 sm:p-5 transition-all ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-tr-sm shadow-md'
                  : 'glass-card text-slate-100 rounded-tl-sm border-slate-800/80 shadow-lg'
              }`}
            >
              {/* Message text with basic markdown styling */}
              <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                {msg.text.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                    {paragraph.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
                    )}
                  </p>
                ))}
              </div>

              {/* Retrieved Sources Drawer / Chips */}
              {msg.retrieved_chunks && msg.retrieved_chunks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-teal-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Grounded Citations ({msg.retrieved_chunks.length} vetted chunks)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {msg.retrieved_chunks.map((chunk, cIdx) => {
                      const isExpanded = !!expandedChunks[`${msg.id}-${cIdx}`];
                      return (
                        <div
                          key={chunk.chunk_id || cIdx}
                          className="rounded-xl bg-slate-900/90 border border-slate-800 text-xs overflow-hidden"
                        >
                          <button
                            onClick={() => toggleChunkExpand(msg.id, cIdx)}
                            className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-800/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold">
                                {chunk.chunk_id}
                              </span>
                              <span className="text-slate-200 font-medium truncate">{chunk.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400">
                                Match: {Math.round((chunk.score || 1) * 100)}%
                              </span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-2 text-slate-300">
                              <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                                "{chunk.text}"
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Source: <strong className="text-slate-200">{chunk.source_title}</strong></span>
                                {chunk.source_reference && (
                                  <span className="truncate max-w-[200px] text-slate-500">{chunk.source_reference}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action tools inside card */}
              <div className="mt-2.5 flex items-center justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyToClipboard(msg.id, msg.text)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                  title="Copy text"
                >
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Grounding response in vetted student guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && (
        <div className="py-2">
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Suggested prompts to test safety & grounding:
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 group text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 shrink-0" />
                  <span>{p.text}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400">({p.category})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask MindBridge [${mode}] about revision routines, panic relief, or study focus...`}
            disabled={loading}
            className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 shadow-xl transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-teal-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <div className="flex items-center gap-3">
            <span>Current Architecture: <strong className="text-slate-300">{mode}</strong></span>
            {mode === 'S2' && <span className="text-teal-400">● Rule-based safety enabled</span>}
          </div>
          <button
            onClick={onOpenBreathing}
            className="text-teal-400 hover:underline flex items-center gap-1"
          >
            Feeling overwhelmed? Try 4-7-8 Breathing
          </button>
        </div>
      </div>

    </div>
  );
}

