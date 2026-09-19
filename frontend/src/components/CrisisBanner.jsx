import React, { useState } from 'react';
import { ShieldAlert, Phone, ExternalLink, ChevronDown, ChevronUp, Heart } from 'lucide-react';

export default function CrisisBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-slate-900/90 border-b border-rose-500/20 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium text-slate-200">
            Student Wellbeing Notice:
          </span>
          <span className="hidden md:inline text-slate-400">
            MindBridge is an academic AI research tool. If you or someone you know is in distress, please seek human support.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 font-semibold transition-all shrink-0"
        >
          <Phone className="w-3 h-3" />
          <span>Emergency Helplines</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="font-semibold text-white text-xs mb-1">UK & Europe</p>
            <p className="text-[11px] text-slate-400">Emergency: <span className="text-white font-bold">999</span> / <span className="text-white font-bold">112</span></p>
            <p className="text-[11px] text-slate-400">Samaritans: <span className="text-teal-400 font-bold">116 123</span> (free 24/7)</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="font-semibold text-white text-xs mb-1">US & Canada</p>
            <p className="text-[11px] text-slate-400">Suicide & Crisis Lifeline: <span className="text-teal-400 font-bold">988</span></p>
            <p className="text-[11px] text-slate-400">Crisis Text Line: Text <span className="text-white font-bold">HOME to 741741</span></p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="font-semibold text-white text-xs mb-1">Pakistan</p>
            <p className="text-[11px] text-slate-400">Emergency Rescue: <span className="text-white font-bold">1122</span></p>
            <p className="text-[11px] text-slate-400">Umang Mental Health: <span className="text-teal-400 font-bold">0311-7786264</span></p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="font-semibold text-white text-xs mb-1">University Campus</p>
            <p className="text-[11px] text-slate-400">Contact your campus Wellbeing / Counselling center or personal tutor.</p>
          </div>
        </div>
      )}
    </div>
  );
}

