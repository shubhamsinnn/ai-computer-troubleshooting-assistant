import React from 'react';
import { HelpCircle, ChevronRight, Sparkles } from 'lucide-react';

export default function FollowUpQuestions({ questions = [], onAnswer }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="hud-glass rounded-3xl p-5 border-amber-500/40 bg-amber-950/15 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
      <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider border-b border-amber-800/40 pb-2.5">
        <HelpCircle className="w-4 h-4 text-amber-400" />
        <span>Clarifying Follow-Up Questions (Refine Diagnosis Certainty)</span>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-xs font-mono font-semibold text-slate-200">
              {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnswer(q.id, idx)}
                  className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-left text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>{opt}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
