import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Activity, 
  Sliders, 
  Zap, 
  HelpCircle, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

export default function CollisionRiskView() {
  const [speed, setSpeed] = useState(70);
  const [distance, setDistance] = useState(35);
  const [relSpeed, setRelSpeed] = useState(25);
  const [roadCondition, setRoadCondition] = useState('dry');
  const [reactionTime, setReactionTime] = useState(0.35); // AI perception
  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recalculate collision risk whenever inputs change
  useEffect(() => {
    let isCurrent = true;
    const calculate = async () => {
      setLoading(true);
      try {
        const res = await api.calculateCollisionRisk({
          vehicle_speed_kmh: Number(speed),
          obstacle_distance_m: Number(distance),
          relative_speed_kmh: Number(relSpeed),
          road_condition: roadCondition,
          reaction_time_s: Number(reactionTime),
          obstacle_type: 'car'
        });
        if (isCurrent) setCalcResult(res);
      } catch (err) {
        console.error('Calculation failed', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    calculate();
    return () => { isCurrent = false; };
  }, [speed, distance, relSpeed, roadCondition, reactionTime]);

  const metrics = calcResult?.metrics || {};
  const rec = calcResult?.recommendation || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-cyan-400" />
          Kinematic Collision Risk Prediction & Stopping Distance Engine
        </h2>
        <p className="text-xs text-slate-400">
          Mathematical model calculating Time-To-Collision (TTC), Newtonian braking distances, and safety margin buffers.
        </p>
      </div>

      {/* Main Grid: Interactive Controls vs Calculated Risk Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Kinematic Input Parameters
              </span>
              <button
                onClick={() => {
                  setSpeed(65);
                  setDistance(45);
                  setRelSpeed(15);
                  setRoadCondition('dry');
                  setReactionTime(0.35);
                }}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                Reset Default
              </button>
            </div>

            {/* Vehicle Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Ego Vehicle Speed (v_ego):</span>
                <span className="text-cyan-400 font-bold">{speed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 km/h</span>
                <span>80 km/h</span>
                <span>160 km/h</span>
              </div>
            </div>

            {/* Obstacle Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Obstacle Distance (d):</span>
                <span className="text-cyan-400 font-bold">{distance} meters</span>
              </div>
              <input
                type="range"
                min="2"
                max="120"
                step="1"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>2m (Bumper)</span>
                <span>50m (Safe)</span>
                <span>120m (Long range)</span>
              </div>
            </div>

            {/* Relative Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Relative Closing Speed (v_rel):</span>
                <span className={`font-bold ${relSpeed > 20 ? 'text-red-400' : 'text-slate-200'}`}>
                  {relSpeed > 0 ? `+${relSpeed}` : relSpeed} km/h
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="80"
                step="2"
                value={relSpeed}
                onChange={(e) => setRelSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-20 (Pulling away)</span>
                <span>0 (Equal)</span>
                <span>+80 (Rapid close)</span>
              </div>
            </div>

            {/* Road Surface Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-400 block">
                Road Surface Friction (μ coefficient):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dry', name: 'Dry Asphalt', mu: 'μ = 0.82' },
                  { id: 'wet', name: 'Wet Rain', mu: 'μ = 0.52' },
                  { id: 'snowy', name: 'Snow Packed', mu: 'μ = 0.28' },
                  { id: 'icy', name: 'Black Ice', mu: 'μ = 0.14' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRoadCondition(item.id)}
                    className={`p-2 rounded-xl text-xs font-mono text-left transition-all border ${
                      roadCondition === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.mu}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reaction Time: Autonomous vs Human Driver */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Reaction Time Benchmark:</span>
                <span className="text-cyan-400 font-bold">{reactionTime}s</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReactionTime(0.25)}
                  className={`p-2 rounded-xl text-xs font-mono transition-all border text-center ${
                    reactionTime < 0.5
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="font-bold">AI Autonomous (0.25s)</div>
                  <div className="text-[10px] text-slate-400">Computer Vision & CAN</div>
                </button>

                <button
                  onClick={() => setReactionTime(1.20)}
                  className={`p-2 rounded-xl text-xs font-mono transition-all border text-center ${
                    reactionTime >= 0.5
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="font-bold">Human Driver (1.20s)</div>
                  <div className="text-[10px] text-slate-400">Perception & Foot travel</div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Calculated Results Deck (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Risk Card */}
          <div className={`hud-glass rounded-2xl p-6 border transition-all ${
            metrics.risk_level === 'HIGH' 
              ? 'border-red-500/50 bg-red-950/25 shadow-[0_0_25px_rgba(239,68,68,0.25)]' 
              : metrics.risk_level === 'MEDIUM' 
              ? 'border-amber-500/40 bg-amber-950/20' 
              : 'border-emerald-500/40 bg-emerald-950/15'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Calculated Risk Assessment
              </span>
              <StatusBadge status={metrics.risk_level || 'LOW'} size="md" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-5">
              
              {/* TTC */}
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-1">Time-To-Collision</span>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {metrics.time_to_collision_display || '--'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                  TTC = Distance / v_rel
                </span>
              </div>

              {/* Total Stopping Distance */}
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-1">Stopping Distance</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-300">
                  {metrics.total_stopping_distance_m || '--'}m
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                  Reaction + Braking
                </span>
              </div>

              {/* Safety Margin */}
              <div className="col-span-2 md:col-span-1">
                <span className="text-xs font-mono text-slate-400 block mb-1">Safety Clearance Buffer</span>
                <span className={`text-3xl font-extrabold font-mono ${
                  (metrics.safety_margin_m || 0) < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {(metrics.safety_margin_m || 0) > 0 ? `+${metrics.safety_margin_m}` : metrics.safety_margin_m}m
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                  Distance - Stopping Dist
                </span>
              </div>

            </div>

            {/* Visual Stopping Distance Breakdown Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Stopping Distance Physics Breakdown:</span>
                <span>Total: <strong className="text-white">{metrics.total_stopping_distance_m}m</strong> vs Gap: <strong className="text-cyan-400">{distance}m</strong></span>
              </div>

              <div className="w-full bg-slate-900 rounded-lg h-3 overflow-hidden flex border border-slate-800">
                <div 
                  className="bg-blue-500 h-full"
                  title={`Reaction Distance: ${metrics.reaction_distance_m}m`}
                  style={{ width: `${Math.min(50, ((metrics.reaction_distance_m || 0) / Math.max(1, distance)) * 100)}%` }}
                />
                <div 
                  className="bg-amber-500 h-full"
                  title={`Braking Distance: ${metrics.braking_distance_m}m`}
                  style={{ width: `${Math.min(100, ((metrics.braking_distance_m || 0) / Math.max(1, distance)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  Reaction Distance: {metrics.reaction_distance_m}m
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  Newtonian Braking Distance: {metrics.braking_distance_m}m
                </span>
              </div>
            </div>

            {/* Action Advisory Box */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Recommended Automated Action
              </div>
              <div className="text-cyan-300 font-bold">
                {rec.action}
              </div>
              <div className="text-slate-300 text-[11px]">
                {rec.explanation}
              </div>
            </div>

          </div>

          {/* Prototype Safety Notice Alert */}
          <div className="hud-glass rounded-xl p-4 border-slate-800 bg-slate-900/40 text-xs font-mono space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Model Transparency & Safety Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This module computes ideal Newtonian deceleration curves based on friction coefficient ($\mu$) and gravitational constant ($g = 9.81\text{ m/s}^2$). Designed strictly as an educational interactive prototype. Real production vehicles require ASIL-D certified redundant brake actuators, tire slip ratios, and slope grade compensations.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
