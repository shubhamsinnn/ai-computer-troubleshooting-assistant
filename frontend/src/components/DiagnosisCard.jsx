import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function DiagnosisCard({ diagnosis }) {
  const [showReasoning, setShowReasoning] = useState(true);

  if (!diagnosis || diagnosis.status === 'ambiguous') {
    return null;
  }

  const {
    diagnosis_id,
    category_label,
    title,
    cause,
    match_strength = 85,
    matched_symptoms = [],
    reasoning_chain = [],
    safety_warning
  } = diagnosis;

  const strengthColor = match_strength >= 85 
    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' 
    : match_strength >= 70 
    ? 'text-amber-400 bg-amber-950/80 border-amber-500/40' 
    : 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40';

  const barColor = match_strength >= 85 ? '#10B981' : (match_strength >= 70 ? '#F59E0B' : '#00F0FF');

  return (
    <div className="hud-glass rounded-3xl p-5 sm:p-6 border-cyan-500/30 space-y-5 shadow-[0_0_25px_rgba(0,240,255,0.06)]">
      
      {/* Top Banner: Category & Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              {category_label}
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              Rule: {diagnosis_id}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight pt-1">
            {title}
          </h2>
        </div>

        {/* Match Strength Meter */}
        <div className="text-right min-w-[120px]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
            Rule Match Strength
          </span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-extrabold font-mono text-white">
              {match_strength}%
            </span>
            <span className="text-[10px] font-mono text-slate-400">Certainty</span>
          </div>
          <div className="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${match_strength}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      </div>

      {/* Probable Root Cause Description */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5" />
          Probable Root Cause:
        </span>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {cause}
        </p>
      </div>

      {/* Matched Symptoms Tags */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Identified Symptom Signatures:
        </span>
        <div className="flex flex-wrap gap-2">
          {matched_symptoms.map((sym, idx) => (
            <span 
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sym.replace(/_/g, ' ')}</span>
            </span>
          ))}
          {matched_symptoms.length === 0 && (
            <span className="text-xs font-mono text-slate-500">General performance degradation signature matched</span>
          )}
        </div>
      </div>

      {/* Inference Reasoning Chain Accordion */}
      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>AI Inference Reasoning Chain (Knowledge Rationale)</span>
          </span>
          {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showReasoning && (
          <div className="p-4 pt-1 border-t border-slate-800/80 space-y-2 text-xs font-mono text-slate-300">
            {reasoning_chain.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <span className="text-cyan-400 font-bold">›</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Warning if applicable */}
      {safety_warning && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs font-mono flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider block text-amber-300">Safety & Hardware Warning</span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">{safety_warning}</p>
          </div>
        </div>
      )}

    </div>
  );
}
