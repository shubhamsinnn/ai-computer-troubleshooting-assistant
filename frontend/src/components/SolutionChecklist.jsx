import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Terminal, 
  ListOrdered, 
  ShieldCheck,
  Wrench
} from 'lucide-react';

export default function SolutionChecklist({ steps = [], onStepToggle, completedSteps = [] }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (command, index) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="hud-glass rounded-3xl p-5 sm:p-6 border-slate-800 space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Step-by-Step Troubleshooting Checklist
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Ordered by Safety & Simplicity (Progress: {completedSteps.length}/{steps.length})
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isTier1 = step.tier?.toLowerCase().includes('tier 1') || step.tier?.toLowerCase().includes('safe');
          const isTier3 = step.tier?.toLowerCase().includes('tier 3') || step.tier?.toLowerCase().includes('advanced');

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDone 
                  ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80' 
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                
                {/* Interactive Checkbox */}
                <button
                  type="button"
                  onClick={() => onStepToggle(idx)}
                  className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                  aria-label={isDone ? `Mark step ${idx + 1} incomplete` : `Mark step ${idx + 1} complete`}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                {/* Step Details */}
                <div className="space-y-2 flex-1">
                  
                  {/* Tier Badge & Step Number */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className={`text-sm font-bold font-mono ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                      isTier1 
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' 
                        : isTier3 
                        ? 'bg-purple-950/70 text-purple-300 border-purple-500/40' 
                        : 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                    }`}>
                      {step.tier || 'Recommended Action'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-8">
                    {step.description}
                  </p>

                  {/* CLI Command snippet if available */}
                  {step.command && (
                    <div className="pl-8 pt-1">
                      <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs">
                        <div className="flex items-center gap-2 text-cyan-300 overflow-x-auto">
                          <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <code className="text-[11px] select-all whitespace-nowrap">{step.command}</code>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(step.command, idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors shrink-0"
                          title="Copy command to clipboard"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
