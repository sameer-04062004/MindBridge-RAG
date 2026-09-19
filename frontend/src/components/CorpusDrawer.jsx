import React, { useState, useEffect } from 'react';
import { X, BookOpen, Search, ExternalLink, ShieldCheck, Tag } from 'lucide-react';

export default function CorpusDrawer({ isOpen, onClose }) {
  const [corpus, setCorpus] = useState({ sources: {}, chunks: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/corpus')
        .then(res => res.json())
        .then(data => {
          setCorpus(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load corpus:", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const topics = ['All', ...Array.from(new Set(corpus.chunks.map(c => c.topic).filter(Boolean)))];

  const filteredChunks = corpus.chunks.filter(c => {
    const matchesTopic = selectedTopic === 'All' || c.topic === selectedTopic;
    const matchesSearch = 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chunk_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Vetted Knowledge Corpus</h2>
              <p className="text-xs text-slate-400">
                {corpus.chunks.length} Ground-truth passages from WHO & University Guides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, anxiety techniques, active recall..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  selectedTopic === topic
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Chunks List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading corpus chunks...</p>
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No matching passages found for "{searchTerm}".
            </div>
          ) : (
            filteredChunks.map(chunk => {
              const src = corpus.sources[chunk.source_id] || {};
              return (
                <div
                  key={chunk.chunk_id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                          {chunk.chunk_id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {chunk.topic}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{chunk.title}</h3>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {chunk.risk_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-sans">
                    {chunk.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{src.title || 'Official Student Wellbeing Guidance'}</span>
                    </div>
                    {src.reference && (
                      <span className="text-[10px] text-slate-500 italic shrink-0">
                        {src.type}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

