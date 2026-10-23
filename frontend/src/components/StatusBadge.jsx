import React from 'react';

export default function StatusBadge({ status, text, size = 'md' }) {
  const norm = (status || '').toLowerCase();
  
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let glowClass = '';

  if (norm.includes('high') || norm.includes('critical') || norm.includes('emergency') || norm.includes('danger') || norm.includes('gridlock')) {
    color = 'bg-red-950/70 text-red-300 border-red-500/40';
    dotColor = 'bg-red-500';
    glowClass = 'shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  } else if (norm.includes('medium') || norm.includes('warning') || norm.includes('moderate') || norm.includes('caution')) {
    color = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
    glowClass = 'shadow-[0_0_10px_rgba(245,158,11,0.5)]';
  } else if (norm.includes('low') || norm.includes('nominal') || norm.includes('optimal') || norm.includes('success') || norm.includes('autonomous') || norm.includes('clear')) {
    color = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
    glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  } else if (norm.includes('manual') || norm.includes('info') || norm.includes('cyan')) {
    color = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
    dotColor = 'bg-cyan-400';
    glowClass = 'shadow-[0_0_10px_rgba(6,182,212,0.5)]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${color} ${glowClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      <span className="uppercase tracking-wider font-semibold">{text || status}</span>
    </span>
  );
}
