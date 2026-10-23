import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Wrench, 
  ShieldAlert,
  ClipboardList
} from 'lucide-react';

export default function FeedbackEscalation({ 
  diagnosisId, 
  onFeedback, 
  feedbackResult, 
  onSelectAlternative 
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleFeedbackClick = async (solved) => {
    setSubmitting(true);
    await onFeedback(solved);
    setSubmitting(false);
  };

  return (
    <div className="hud-glass rounded-3xl p-5 sm:p-6 border-slate-800 space-y-4">
      
      {/* Question Header */}
      {!feedbackResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Resolution Verification: Did this resolve your issue?
            </h3>
            <span className="text-xs font-mono text-slate-500">Provide feedback to improve accuracy</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleFeedbackClick(true)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 font-mono text-xs font-bold uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50"
            >
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
              <span>Yes, Issue Resolved</span>
            </button>

            <button
              onClick={() => handleFeedbackClick(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 font-mono text-xs font-bold uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all disabled:opacity-50"
            >
              <ThumbsDown className="w-4 h-4 text-amber-400" />
              <span>No, Issue Persists (Escalate)</span>
            </button>
          </div>
        </div>
      )}

      {/* Resolved State */}
      {feedbackResult && feedbackResult.status === 'resolved' && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Success: Problem marked as resolved!</span>
          </div>
          <p className="text-xs text-slate-300">
            {feedbackResult.message}
          </p>
          <div className="pt-2 border-t border-emerald-800/40 space-y-1.5 font-mono text-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Post-Resolution System Stability Tips:</span>
            {feedbackResult.post_resolution_tips?.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unresolved / Escalation State */}
      {feedbackResult && feedbackResult.status === 'unresolved' && (
        <div className="p-5 rounded-2xl bg-amber-950/25 border border-amber-500/50 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Escalation Phase: Alternative Diagnoses & Technician Guidance</span>
          </div>

          <p className="text-xs text-slate-300">
            {feedbackResult.message}
          </p>

          {/* Secondary Alternative Diagnoses */}
          {feedbackResult.secondary_alternatives?.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono text-cyan-300 uppercase font-semibold block">
                Try Secondary Rule Hypotheses:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {feedbackResult.secondary_alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative(alt.id)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-left text-xs font-mono transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-300">{alt.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{alt.cause}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Technician Readiness Checklist */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-slate-800 space-y-2 text-xs font-mono">
            <span className="text-amber-300 font-bold uppercase flex items-center gap-1.5 text-[11px]">
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              Qualified Technician Escalation Checklist:
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              {feedbackResult.technician_readiness_checklist?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
