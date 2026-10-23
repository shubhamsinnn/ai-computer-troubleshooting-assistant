import React from 'react';
import { 
  X, 
  BrainCircuit, 
  Layers, 
  GitFork, 
  Cpu, 
  Database, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function EngineExplainerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const concepts = [
    {
      title: "1. Knowledge Representation (Production Rules)",
      icon: Database,
      color: "text-cyan-400",
      description: "Domain knowledge is structured into modular Production Rules formatted as: IF (Symptoms A, B, C present) AND NOT (Disqualifier D) THEN (Fault = X with Tiered Solution Steps). Each rule contains base confidence weights, reasoning traces, and safety guidelines."
    },
    {
      title: "2. Natural Language Symptom Extraction",
      icon: BrainCircuit,
      color: "text-indigo-400",
      description: "When a user inputs text, the system normalizes vocabulary, scans n-gram phrases against an IT symptom lexicon, and handles contextual negation (e.g., distinguishing 'sound not working' from 'sound is not an issue')."
    },
    {
      title: "3. Forward-Chaining Inference Engine",
      icon: GitFork,
      color: "text-emerald-400",
      description: "The inference engine applies data-driven forward chaining: it matches extracted facts (observed symptoms) against the antecedent of all rules, filters out conflicting hypotheses, and deduces the most probable root cause."
    },
    {
      title: "4. Match Strength & Certainty Factors",
      icon: Cpu,
      color: "text-amber-400",
      description: "Match strength represents symptom coverage and heuristic confidence—not an uncalibrated arbitrary score. Required symptoms carry 60% weight, optional symptoms up to 25%, and answered follow-up questions dynamically adjust the confidence score."
    },
    {
      title: "5. Interactive Clarification & Escalation",
      icon: Layers,
      color: "text-purple-400",
      description: "When confidence is borderline (50-75%), the system prompts targeted follow-up questions to distinguish between competing hypotheses. If steps fail, it offers secondary alternative rules or a certified technician escalation checklist."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B111E] border border-cyan-500/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                How the AI Inference Engine Works
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                AI Laboratory Architecture & Rule-Based Expert System Concepts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-slate-300 space-y-2">
            <span className="text-indigo-300 font-bold uppercase text-xs block">
              College Laboratory Project Abstract:
            </span>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              This system is an applied artificial intelligence project demonstrating a <strong>Rule-Based Expert System</strong> for automated computer technical diagnostics. Rather than using an unexplainable generative black box, it utilizes a verified symbolic knowledge base, forward chaining, and transparent reasoning paths suitable for critical systems.
            </p>
          </div>

          {/* Concepts Grid */}
          <div className="space-y-3">
            {concepts.map((concept, idx) => {
              const Icon = concept.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${concept.color}`} />
                    <h4 className="font-bold text-white text-xs uppercase">{concept.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed pl-6">
                    {concept.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tiered Safety Architecture */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 uppercase text-xs block">
              Tiered Troubleshooting Strategy:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <strong className="text-emerald-300 block mb-0.5">Tier 1: Safe & Non-Destructive</strong>
                <span>Restarts, cache flushing, UI settings, volume mixer checks.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                <strong className="text-blue-300 block mb-0.5">Tier 2: Configuration & CLI</strong>
                <span>Command line tools (ipconfig, chkdsk, sfc, services.msc).</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                <strong className="text-purple-300 block mb-0.5">Tier 3: Advanced & Recovery</strong>
                <span>DISM repair, Safe Mode, DDU driver wipes, memory diagnostics.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl"
          >
            Close Explainer
          </button>
        </div>

      </div>
    </div>
  );
}
