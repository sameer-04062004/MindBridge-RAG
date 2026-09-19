import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BreathingWidget({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // Inhale (4s) -> Hold (7s) -> Exhale (8s)
  const [timeLeft, setTimeLeft] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const audioCtxRef = useRef(null);

  const playTone = (freq = 440, type = 'sine', duration = 0.4) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio tone failed:", e);
    }
  };

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'Inhale') {
              playTone(520, 'sine', 0.5); // Calm tone for hold
              setPhase('Hold');
              return 7;
            } else if (phase === 'Hold') {
              playTone(390, 'sine', 0.6); // Deeper tone for exhale
              setPhase('Exhale');
              return 8;
            } else {
              playTone(440, 'sine', 0.5); // Rising tone for next cycle
              setCyclesCompleted(c => c + 1);
              setPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, soundEnabled]);

  const toggleStart = () => {
    if (!isActive) {
      setPhase('Inhale');
      setTimeLeft(4);
      playTone(440, 'sine', 0.5);
    }
    setIsActive(!isActive);
  };

  const getScaleAndColor = () => {
    if (phase === 'Inhale') {
      return {
        scale: 'scale-125 duration-[4000ms]',
        glow: 'from-teal-500/40 via-emerald-500/30 to-teal-800/20',
        ring: 'border-teal-400/60',
        instruction: 'Inhale deeply through your nose...',
        color: 'text-teal-300'
      };
    } else if (phase === 'Hold') {
      return {
        scale: 'scale-125 duration-[7000ms] animate-pulse',
        glow: 'from-indigo-500/40 via-purple-500/30 to-indigo-800/20',
        ring: 'border-indigo-400/60',
        instruction: 'Gently hold your breath...',
        color: 'text-indigo-300'
      };
    } else {
      return {
        scale: 'scale-90 duration-[8000ms]',
        glow: 'from-blue-500/30 via-slate-700/20 to-teal-900/10',
        ring: 'border-blue-400/50',
        instruction: 'Exhale slowly through your mouth...',
        color: 'text-blue-300'
      };
    }
  };

  if (!isOpen) return null;

  const visual = getScaleAndColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-8 border border-teal-500/20 shadow-2xl flex flex-col items-center text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            4-7-8 Parasympathetic Reset
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Exam Panic Relief</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Proven to lower heart rate and reduce stress hormones by activating your vagus nerve.
          </p>
        </div>

        {/* Animated Breathing Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Ambient Glow Aura */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${visual.glow} blur-2xl transition-all ease-in-out ${visual.scale}`}
          />
          
          {/* Main Breathing Orb */}
          <div
            className={`w-48 h-48 rounded-full border-2 ${visual.ring} bg-slate-900/90 shadow-2xl flex flex-col items-center justify-center transition-all ease-in-out ${visual.scale}`}
          >
            <span className={`text-4xl font-extrabold ${visual.color} tracking-tight`}>
              {timeLeft}s
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold mt-1">
              {phase}
            </span>
          </div>
        </div>

        {/* Phase Guidance Instruction */}
        <p className={`text-base font-medium ${visual.color} transition-colors min-h-[1.5rem] mt-2`}>
          {isActive ? visual.instruction : 'Click start when you are ready to begin.'}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleStart}
            className={`px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg ${
              isActive
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-95 shadow-teal-500/25'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start Breathing'}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title={soundEnabled ? 'Mute soothing tones' : 'Enable soothing tones'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Cycle Counter */}
        {cyclesCompleted > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-teal-400/90 mt-6 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{cyclesCompleted} calm cycles completed</span>
          </div>
        )}

      </div>
    </div>
  );
}

