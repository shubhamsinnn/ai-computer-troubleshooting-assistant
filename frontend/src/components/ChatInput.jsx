import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, AlertCircle } from 'lucide-react';

export default function ChatInput({ query, setQuery, onDiagnose, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2 && !loading) {
      onDiagnose(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="hud-glass rounded-3xl p-4 sm:p-5 border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <label htmlFor="problem-input" className="font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Describe Your Computer Problem (Natural Language):
          </label>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Press Enter to Diagnose</span>
        </div>

        <div className="relative">
          <textarea
            id="problem-input"
            rows="3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., My Wi-Fi keeps disconnecting and websites return DNS probe failed... OR My laptop fans are loud and games are lagging badly..."
            className="w-full bg-[#070D18]/90 text-slate-100 placeholder-slate-500 rounded-2xl p-4 pr-12 text-sm border border-slate-700/80 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none font-sans"
          />

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-3 right-3 text-xs text-slate-500 hover:text-slate-300 bg-slate-800/80 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI extracts symptom signatures and executes forward-chaining rules.</span>
          </div>

          <button
            type="submit"
            disabled={query.trim().length < 2 || loading}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all ml-auto"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <span>Diagnose Problem</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
