import React from 'react';
import { History, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';

export default function SessionHistory({ history = [], onSelectEntry, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="hud-glass rounded-3xl p-5 border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Session Troubleshooting History ({history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] font-mono text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          title="Clear session history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectEntry(item)}
            className="w-full p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="space-y-1 overflow-hidden pr-2">
              <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                {item.title || item.query}
              </div>
              <div className="text-[11px] font-sans text-slate-400 truncate">
                "{item.query}"
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.time}
              </span>
              {item.solved ? (
                <span className="p-1 rounded-full bg-emerald-950 text-emerald-400" title="Resolved">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="p-1 rounded-full bg-slate-800 text-slate-400" title="In Progress">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
