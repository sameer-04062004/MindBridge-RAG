import React from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Scale, 
  Wind, 
  BookOpen, 
  Settings, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ 
  mode, 
  setMode, 
  view, 
  setView, 
  onOpenBreathing, 
  onOpenCorpus, 
  onOpenSettings,
  backendInfo 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('chat')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                MindBridge<span className="text-teal-400">-RAG</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Safety Guarded
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Exam-Stress & Wellbeing Support Architecture</p>
          </div>
        </div>

        {/* System Mode Switcher */}
        {view === 'chat' && (
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setMode('S2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'S2'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Retrieval-Augmented + Rule-Based Safety Escalation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              S2: Safety-Aware RAG
            </button>

            <button
              onClick={() => setMode('S1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'S1'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard RAG without Safety Guardrails"
            >
              S1: Basic RAG
            </button>

            <button
              onClick={() => setMode('S0')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'S0'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw LLM without Knowledge Retrieval"
            >
              S0: Raw LLM
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Compare Arena Toggle */}
          <button
            onClick={() => setView(view === 'compare' ? 'chat' : 'compare')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              view === 'compare'
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Compare Arena</span>
          </button>

          {/* Calming Breathing Tool */}
          <button
            onClick={onOpenBreathing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-teal-950/40 border border-teal-800/40 text-teal-300 hover:bg-teal-900/40 transition-all flex items-center gap-1.5"
            title="4-7-8 Calming Breathing Visualizer"
          >
            <Wind className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="hidden sm:inline">Breathing</span>
          </button>

          {/* Vetted Corpus Browse */}
          <button
            onClick={onOpenCorpus}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            title="Inspect 30 Vetted Chunks & Knowledge Sources"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Corpus</span>
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title="API Key & Model Backend"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}

