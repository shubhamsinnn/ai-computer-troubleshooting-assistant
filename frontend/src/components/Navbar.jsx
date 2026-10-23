import React from 'react';
import { 
  Wrench, 
  Cpu, 
  Activity, 
  BookOpen, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Navbar({ onOpenDiagnostics, onOpenExplainer, onOpenSafety, onResetSession }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B111E]/95 backdrop-blur-md border-b border-cyan-900/40 px-4 lg:px-8 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)]">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wider uppercase font-mono">
                Fixit<span className="text-cyan-400">.AI</span>
              </h1>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-semibold">
                Expert System v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>AI-Based Computer Troubleshooting Assistant</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono">AI Lab Project</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* System Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            title="Inspect read-only CPU, Memory, Disk, and Network diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">System Diagnostics</span>
          </button>

          {/* AI Inference Explainer Button */}
          <button
            onClick={onOpenExplainer}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Learn how the forward-chaining rule inference engine works"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">How AI Works</span>
          </button>

          {/* Safety & Responsible AI Button */}
          <button
            onClick={onOpenSafety}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="View safety disclaimers and hardware precautions"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Safety & Privacy</span>
          </button>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            title="Start New Diagnosis"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
