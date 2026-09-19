import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, backendInfo, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `Connected to ${data.llm_backend || 'Gemini API'}` });
        if (onKeyUpdated) onKeyUpdated(data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus({ type: 'error', message: data.detail || 'Failed to update API key' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not connect to backend' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Backend & API Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Engine Status */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs font-medium text-white">Active LLM Model</p>
              <p className="text-[11px] text-slate-400">
                {backendInfo?.llm_backend || 'Checking engine...'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
            {backendInfo?.status || 'Online'}
          </span>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Gemini API Key (Optional)
            </label>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              If omitted, MindBridge uses the built-in offline reproducible <strong>MockLLM</strong>. Add your key for live Gemini 2.5 Flash responses.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          {status && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-95 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20"
            >
              {loading ? 'Validating...' : 'Save & Connect'}
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Corpus Chunks: {backendInfo?.total_chunks || 30}</span>
          <span>Sources: {backendInfo?.total_sources || 3}</span>
        </div>

      </div>
    </div>
  );
}

