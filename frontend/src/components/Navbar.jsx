import React from 'react';
import { ShieldAlert, Cpu, Radio, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Navbar({ 
  telemetry, 
  wsStatus, 
  onModeChange, 
  onEmergencyBrake, 
  onReset 
}) {
  const vehicle = telemetry?.vehicle || { speed_kmh: 0, mode: 'Autonomous', aeb_active: false };
  const safety = telemetry?.safety || { risk_level: 'LOW' };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090E1A]/95 backdrop-blur-md border-b border-cyan-950/40 px-4 lg:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Prototype Label */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Cpu className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wider uppercase font-mono">
                AutoTrans<span className="text-cyan-400">.AI</span>
              </h1>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Autonomous Vehicles & Intelligent Transportation</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline text-amber-400/90 font-medium">SIMULATION TESTBED</span>
            </p>
          </div>
        </div>

        {/* Center: Live Telemetry Mini HUD */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/80 border border-slate-800/80 rounded-xl px-4 py-1.5">
          {/* Speed */}
          <div className="text-center min-w-[70px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">Speed</span>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-mono font-bold text-white">
                {vehicle.speed_kmh?.toFixed(0) || 0}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">KM/H</span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          {/* Collision Risk */}
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider mb-0.5">Collision Risk</span>
            <StatusBadge status={safety.risk_level || 'LOW'} size="sm" />
          </div>

          <div className="w-px h-7 bg-slate-800" />

          {/* Obstacle Distance */}
          <div className="text-center min-w-[70px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">Clearance</span>
            <span className={`text-base font-mono font-bold ${
              (telemetry?.perception?.obstacle_distance_m || 99) < 20 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {telemetry?.perception?.obstacle_distance_m?.toFixed(1) || '--'}m
            </span>
          </div>
        </div>

        {/* Right Controls: Mode Toggle, Emergency AEB, Connection status */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Driving Mode Buttons */}
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {['Autonomous', 'Manual'].map((m) => {
              const active = vehicle.mode === m;
              return (
                <button
                  key={m}
                  onClick={() => onModeChange?.(m)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
                    active 
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Emergency Stop Button */}
          <button
            onClick={onEmergencyBrake}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              vehicle.aeb_active || vehicle.mode === 'Emergency'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-red-950/60 text-red-300 border border-red-700/60 hover:bg-red-900/60'
            }`}
            title="Trigger Immediate Autonomous Emergency Braking (AEB)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AEB Brake</span>
          </button>

          {/* Reset Simulation */}
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Reset Simulation Telemetry"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Live WS indicator */}
          <div className="flex items-center gap-1 text-[11px] font-mono pl-1" title={`WebSocket: ${wsStatus}`}>
            <Radio className={`w-3.5 h-3.5 ${
              wsStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
            }`} />
            <span className="hidden xl:inline text-slate-400 uppercase text-[10px]">
              {wsStatus === 'connected' ? 'Live Stream' : 'Connecting'}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}
