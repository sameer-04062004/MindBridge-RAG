import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CrisisBanner from './components/CrisisBanner';
import ChatArea from './components/ChatArea';
import CompareArena from './components/CompareArena';
import BreathingWidget from './components/BreathingWidget';
import CorpusDrawer from './components/CorpusDrawer';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [mode, setMode] = useState('S2'); // S2 (Safety-Aware RAG) by default
  const [view, setView] = useState('chat'); // 'chat' | 'compare'
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [corpusOpen, setCorpusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backendInfo, setBackendInfo] = useState(null);

  const fetchBackendInfo = () => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendInfo(data))
      .catch(err => {
        console.warn("Backend health check:", err);
        setBackendInfo({ status: 'Local Mode', llm_backend: 'MockLLM / Gemini' });
      });
  };

  useEffect(() => {
    fetchBackendInfo();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Ambient background gradients */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-subtle-glow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-subtle-glow" />

      {/* Top Crisis Helpline Bar */}
      <CrisisBanner />

      {/* Main App Bar */}
      <Navbar
        mode={mode}
        setMode={setMode}
        view={view}
        setView={setView}
        onOpenBreathing={() => setBreathingOpen(true)}
        onOpenCorpus={() => setCorpusOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        backendInfo={backendInfo}
      />

      {/* View Switcher */}
      <main className="flex-1 flex flex-col relative">
        {view === 'chat' ? (
          <ChatArea
            mode={mode}
            setMode={setMode}
            onOpenBreathing={() => setBreathingOpen(true)}
          />
        ) : (
          <CompareArena />
        )}
      </main>

      {/* Overlays / Modals */}
      <BreathingWidget
        isOpen={breathingOpen}
        onClose={() => setBreathingOpen(false)}
      />

      <CorpusDrawer
        isOpen={corpusOpen}
        onClose={() => setCorpusOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        backendInfo={backendInfo}
        onKeyUpdated={() => fetchBackendInfo()}
      />
    </div>
  );
}
