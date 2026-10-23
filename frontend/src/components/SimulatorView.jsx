import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Footprints, 
  Car, 
  Truck, 
  Zap 
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SimulatorView({ telemetry, onControl, onEmergencyBrake, onReset }) {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [targetSpeed, setTargetSpeed] = useState(65);
  const [density, setDensity] = useState('Moderate');
  const [egoLane, setEgoLane] = useState(1); // 0: Left, 1: Center, 2: Right

  const v = telemetry?.vehicle || { speed_kmh: 62.0, aeb_active: false, mode: 'Autonomous' };
  const s = telemetry?.safety || { risk_level: 'LOW', time_to_collision_display: 'Clear' };
  const p = telemetry?.perception || { obstacle_distance_m: 48.0, obstacle_type: 'Car', road_condition: 'dry' };

  // Sync internal speed slider with incoming telemetry
  useEffect(() => {
    if (v.target_speed_kmh) setTargetSpeed(v.target_speed_kmh);
    if (v.lane !== undefined) setEgoLane(v.lane);
  }, [v.target_speed_kmh, v.lane]);

  // Road canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stripeOffset = 0;
    let egoX = 200; // Center lane
    let egoY = 400;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const laneWidth = width / 3;

      // Clear road background (dark asphalt)
      ctx.fillStyle = p.road_condition === 'icy' ? '#131e33' : '#0B111E';
      ctx.fillRect(0, 0, width, height);

      // Road shoulder lines
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(4, height);
      ctx.moveTo(width - 4, 0);
      ctx.lineTo(width - 4, height);
      ctx.stroke();

      // Lane dividers (dashed)
      const currentSpeed = v.speed_kmh || 0;
      if (isRunning && currentSpeed > 0) {
        stripeOffset = (stripeOffset + currentSpeed * 0.18) % 40;
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -stripeOffset;

      // Divider 1 (Left / Center)
      ctx.beginPath();
      ctx.moveTo(laneWidth, 0);
      ctx.lineTo(laneWidth, height);
      ctx.stroke();

      // Divider 2 (Center / Right)
      ctx.beginPath();
      ctx.moveTo(laneWidth * 2, 0);
      ctx.lineTo(laneWidth * 2, height);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash

      // Target Ego Car X position based on selected lane
      const targetX = laneWidth * egoLane + laneWidth / 2;
      egoX += (targetX - egoX) * 0.12; // Smooth lane change interpolation

      // 1. Radar / LiDAR Sensor Perception Cone Projection
      const radarColor = s.risk_level === 'HIGH' 
        ? 'rgba(239, 68, 68, 0.35)' 
        : s.risk_level === 'MEDIUM' 
        ? 'rgba(245, 158, 11, 0.25)' 
        : 'rgba(0, 240, 255, 0.18)';

      ctx.fillStyle = radarColor;
      ctx.beginPath();
      ctx.moveTo(egoX, egoY - 30);
      ctx.lineTo(egoX - 85, egoY - 240);
      ctx.lineTo(egoX + 85, egoY - 240);
      ctx.closePath();
      ctx.fill();

      // Radar sweep rings
      ctx.strokeStyle = s.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1.5;
      for (let r = 60; r <= 220; r += 50) {
        ctx.beginPath();
        ctx.arc(egoX, egoY - 30, r, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }

      // 2. Obstacle Vehicle or Pedestrian ahead
      const obsDistMeters = Math.max(2, p.obstacle_distance_m || 40);
      // Map meters (0 to 100m) to canvas pixels ahead of ego car
      const obsY = Math.max(50, egoY - (obsDistMeters * 3.8));
      const obsX = laneWidth * egoLane + laneWidth / 2;

      // Draw obstacle based on type
      if (p.obstacle_type === 'Pedestrian') {
        // Pedestrian silhouette
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(obsX, obsY, 8, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillRect(obsX - 7, obsY + 8, 14, 18); // Body
        // Distance label banner
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(obsX - 40, obsY - 32, 80, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`PEDESTRIAN ${obsDistMeters.toFixed(1)}m`, obsX, obsY - 21);
      } else if (p.obstacle_type === 'Truck') {
        // Large Truck
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(obsX - 22, obsY - 45, 44, 75);
        ctx.fillStyle = '#1D4ED8';
        ctx.fillRect(obsX - 20, obsY + 10, 40, 20); // Cab
        // Taillights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(obsX - 20, obsY + 26, 8, 4);
        ctx.fillRect(obsX + 12, obsY + 26, 8, 4);
        // Distance label
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(obsX - 35, obsY - 60, 70, 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`TRUCK ${obsDistMeters.toFixed(1)}m`, obsX, obsY - 49);
      } else {
        // Lead Car (Red/Amber Sedan)
        ctx.fillStyle = s.risk_level === 'HIGH' ? '#DC2626' : '#D97706';
        ctx.beginPath();
        ctx.roundRect(obsX - 18, obsY - 30, 36, 60, 6);
        ctx.fill();
        // Cabin
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(obsX - 14, obsY - 15, 28, 28);
        // Taillights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(obsX - 16, obsY + 26, 6, 4);
        ctx.fillRect(obsX + 10, obsY + 26, 6, 4);
        // Distance tag
        ctx.fillStyle = '#D97706';
        ctx.fillRect(obsX - 35, obsY - 46, 70, 14);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`LEAD CAR ${obsDistMeters.toFixed(1)}m`, obsX, obsY - 35);
      }

      // 3. Surrounding Traffic Vehicles in other lanes
      const leftTrafficY = (height * 0.25 + (stripeOffset * 1.5)) % height;
      const rightTrafficY = (height * 0.65 + (stripeOffset * 0.8)) % height;

      if (egoLane !== 0) {
        // Car in Left Lane
        const lx = laneWidth * 0 + laneWidth / 2;
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.roundRect(lx - 16, leftTrafficY - 25, 32, 50, 4);
        ctx.fill();
      }

      if (egoLane !== 2) {
        // Car in Right Lane
        const rx = laneWidth * 2 + laneWidth / 2;
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(rx - 16, rightTrafficY - 25, 32, 50, 4);
        ctx.fill();
      }

      // 4. Ego Autonomous Vehicle
      const isAEB = v.aeb_active || s.risk_level === 'HIGH';
      
      // Autonomous Vehicle Body (Cyan & Sleek)
      ctx.fillStyle = isAEB ? '#991B1B' : '#0891B2';
      ctx.beginPath();
      ctx.roundRect(egoX - 20, egoY - 35, 40, 70, 8);
      ctx.fill();

      // Vehicle Roof & Windshield
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(egoX - 15, egoY - 18, 30, 36, 4);
      ctx.fill();

      // Top LiDAR Dome (pulsing sensor)
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(egoX, egoY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Headlights beam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(egoX - 16, egoY - 36, 6, 3);
      ctx.fillRect(egoX + 10, egoY - 36, 6, 3);

      // Brake lights (Glows intense red when braking or AEB active)
      if (isAEB || v.acceleration_ms2 < -1.0) {
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        ctx.fillRect(egoX - 18, egoY + 33, 9, 5);
        ctx.fillRect(egoX + 9, egoY + 33, 9, 5);
        ctx.shadowBlur = 0; // reset
      } else {
        ctx.fillStyle = '#7F1D1D';
        ctx.fillRect(egoX - 18, egoY + 33, 8, 4);
        ctx.fillRect(egoX + 10, egoY + 33, 8, 4);
      }

      // Ego vehicle label
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EGO VEHICLE', egoX, egoY + 54);

      // 5. Emergency HUD Warning Overlay if AEB is triggered
      if (isAEB) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#EF4444';
        ctx.fillRect(width / 2 - 140, 20, 280, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ AUTONOMOUS EMERGENCY BRAKE (AEB)', width / 2, 42);
      }

      if (isRunning) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, egoLane, v.speed_kmh, v.aeb_active, v.acceleration_ms2, p.obstacle_distance_m, p.obstacle_type, p.road_condition, s.risk_level]);

  // Handle Lane Change
  const handleLaneChange = (newLane) => {
    if (newLane >= 0 && newLane <= 2) {
      setEgoLane(newLane);
      onControl?.({ mode: v.mode });
    }
  };

  // Speed slider change
  const handleSpeedChange = (val) => {
    setTargetSpeed(val);
    onControl?.({ target_speed_kmh: Number(val) });
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            2D Autonomous Vehicle Kinematics Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-lane road environment with sensor perception beam, dynamic obstacles, and automated emergency braking (AEB).
          </p>
        </div>

        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
              isRunning 
                ? 'bg-amber-950/60 text-amber-300 border border-amber-700/60 hover:bg-amber-900/60' 
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause Sim' : 'Resume Sim'}
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset State
          </button>
        </div>
      </div>

      {/* Simulator Layout: Canvas + Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Road Canvas (Left / Center) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="hud-glass rounded-2xl p-4 border-cyan-500/20 relative shadow-[0_0_30px_rgba(0,240,255,0.08)]">
            
            {/* Top Canvas HUD overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono z-10 pointer-events-none">
              <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-cyan-300">
                Speed: {v.speed_kmh?.toFixed(0)} KM/H
              </span>
              <StatusBadge status={s.risk_level} size="sm" />
              <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-slate-300">
                Obstacle: {p.obstacle_distance_m?.toFixed(1)}m
              </span>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={520}
              className="rounded-xl border border-slate-800 bg-[#070C16] mx-auto block"
            />

            {/* Bottom Lane Controls */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                onClick={() => handleLaneChange(egoLane - 1)}
                disabled={egoLane === 0}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Steer Left
              </button>
              <span className="text-xs font-mono text-slate-400">
                Current: <strong className="text-white">{['Left Lane', 'Center Lane', 'Right Lane'][egoLane]}</strong>
              </span>
              <button
                onClick={() => handleLaneChange(egoLane + 1)}
                disabled={egoLane === 2}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                Steer Right <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Interactive Control Deck */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Target Speed Slider */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 uppercase font-semibold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Cruising Target Speed
              </span>
              <span className="text-base font-bold text-cyan-400">{targetSpeed} KM/H</span>
            </div>

            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={targetSpeed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Stop)</span>
              <span>60 (City Cruise)</span>
              <span>120 (Expressway)</span>
            </div>
          </div>

          {/* Spawn Road Obstacles */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-300 uppercase font-semibold block">
              Inject Dynamic Road Obstacle
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onControl?.({ spawn_obstacle_type: 'Pedestrian', obstacle_distance_m: 22.0, relative_speed_kmh: 24.0 })}
                className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-700/50 text-red-300 text-xs font-mono text-center transition-all flex flex-col items-center gap-1"
              >
                <Footprints className="w-4 h-4 text-red-400" />
                <span>Pedestrian</span>
                <span className="text-[10px] text-red-400/80">Close (22m)</span>
              </button>

              <button
                onClick={() => onControl?.({ spawn_obstacle_type: 'Car', obstacle_distance_m: 32.0, relative_speed_kmh: 15.0 })}
                className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700/50 text-amber-300 text-xs font-mono text-center transition-all flex flex-col items-center gap-1"
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span>Lead Sedan</span>
                <span className="text-[10px] text-amber-400/80">Mid (32m)</span>
              </button>

              <button
                onClick={() => onControl?.({ spawn_obstacle_type: 'Truck', obstacle_distance_m: 45.0, relative_speed_kmh: 10.0 })}
                className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-mono text-center transition-all flex flex-col items-center gap-1"
              >
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Heavy Truck</span>
                <span className="text-[10px] text-blue-400/80">Far (45m)</span>
              </button>
            </div>
          </div>

          {/* Road Surface Traction Selector */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-300 uppercase font-semibold block">
              Road Traction & Weather Condition
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dry', label: 'Dry Asphalt', mu: 'μ = 0.82' },
                { id: 'wet', label: 'Wet Road', mu: 'μ = 0.52' },
                { id: 'icy', label: 'Black Ice', mu: 'μ = 0.14' },
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => onControl?.({ road_condition: cond.id })}
                  className={`p-2.5 rounded-xl text-xs font-mono text-center transition-all border ${
                    p.road_condition === cond.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{cond.label}</div>
                  <div className="text-[10px] opacity-75">{cond.mu}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Braking Override */}
          <div className="hud-glass rounded-2xl p-5 border-red-500/30 bg-red-950/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-300 font-bold uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Emergency Braking System (AEB)
              </span>
              <StatusBadge status={v.aeb_active ? 'EMERGENCY' : 'NOMINAL'} size="sm" />
            </div>
            <p className="text-xs text-slate-300">
              When TTC falls below 2.2 seconds in Autonomous Mode, AEB executes automatically at -8.5 m/s² deceleration.
            </p>
            <button
              onClick={onEmergencyBrake}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
            >
              Engage Manual AEB Hard Stop
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
