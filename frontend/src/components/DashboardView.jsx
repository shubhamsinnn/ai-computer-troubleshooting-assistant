import React from 'react';
import { 
  Gauge, 
  Compass, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Zap, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Eye,
  Crosshair,
  Footprints,
  Car
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DashboardView({ telemetry, onControl, onEmergencyBrake, onNavigateToSimulator }) {
  const v = telemetry?.vehicle || {
    speed_kmh: 62.0,
    target_speed_kmh: 65.0,
    acceleration_ms2: 0.2,
    mode: 'Autonomous',
    lane_name: 'Center Cruising',
    lane: 1,
    lane_offset_m: 0.02,
    steering_angle_deg: 0.4,
    battery_pct: 78.4,
    energy_draw_kw: 18.2,
    odometer_km: 142.6,
    aeb_active: false
  };

  const p = telemetry?.perception || {
    ai_status: 'AUTONOMOUS_CRUISE',
    confidence_pct: 97.4,
    road_condition: 'dry',
    obstacle_type: 'Car',
    obstacle_distance_m: 48.0,
    relative_speed_kmh: 4.0,
    sensor_health: {
      lidar: 'OPTIMAL',
      radar_forward: 'OPTIMAL',
      vision_cameras: 'OPTIMAL',
      imu_localization: 'CALIBRATED'
    }
  };

  const s = telemetry?.safety || {
    risk_level: 'LOW',
    risk_score: 18,
    risk_color: '#10b981',
    time_to_collision_display: 'Clear (>10s)',
    stopping_distance_m: 24.8,
    safety_margin_m: 23.2,
    safe_action: 'NOMINAL: Safe following distance maintained. Trajectory clear.',
    risk_explanation: 'Traction coefficient optimal. No hazard detected in ego lane corridor.'
  };

  const events = telemetry?.events || [];

  return (
    <div className="space-y-6">
      
      {/* Simulation Disclaimer Banner */}
      <div className="hud-glass rounded-xl p-3 border-amber-500/30 flex items-center justify-between gap-3 bg-amber-950/20">
        <div className="flex items-center gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-300">SIMULATED TELEMETRY:</strong> Active academic demonstration testbed. Telemetry values are procedurally generated in real time at 1.0 Hz and synchronized via WebSocket.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
          SYNCHRONIZED (1Hz)
        </span>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Speedometer Gauge */}
        <div className="hud-glass rounded-2xl p-5 border-cyan-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Vehicle Speed
            </span>
            <span className="font-mono text-[11px] text-cyan-400">Target: {v.target_speed_kmh} KM/H</span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold font-mono text-white tracking-tight">
              {v.speed_kmh?.toFixed(0)}
            </span>
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-cyan-400 block">KM/H</span>
              <span className="text-[11px] font-mono text-slate-400 block">
                {((v.speed_kmh || 0) * 0.621371).toFixed(0)} MPH
              </span>
            </div>
          </div>

          {/* Speed progress meter */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (v.speed_kmh / 120) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0</span>
              <span className="text-cyan-400">ACCEL: {v.acceleration_ms2 > 0 ? `+${v.acceleration_ms2}` : v.acceleration_ms2} m/s²</span>
              <span>120 KM/H</span>
            </div>
          </div>
        </div>

        {/* Card 2: Collision Risk & Safety Margin */}
        <div className={`hud-glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
          s.risk_level === 'HIGH' ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Collision Risk
            </span>
            <StatusBadge status={s.risk_level} size="sm" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-white">
                {s.time_to_collision_display}
              </span>
              <span className="text-xs font-mono text-slate-400">TTC</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex justify-between">
              <span>Stopping Dist: <strong className="text-slate-200">{s.stopping_distance_m}m</strong></span>
              <span>Margin: <strong className={s.safety_margin_m > 10 ? 'text-emerald-400' : 'text-amber-400'}>{s.safety_margin_m}m</strong></span>
            </div>
          </div>

          {/* Risk severity indicator bar */}
          <div className="space-y-1 pt-2">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${s.risk_score}%`, 
                  backgroundColor: s.risk_color 
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Low (0)</span>
              <span>Score: {s.risk_score}/100</span>
              <span>High (100)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Leading Obstacle & Proximity */}
        <div className="hud-glass rounded-2xl p-5 border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              Leading Obstacle
            </span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              {p.obstacle_type}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${
              p.obstacle_distance_m < 25 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              {p.obstacle_distance_m?.toFixed(1)}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">METERS</span>
          </div>

          <div className="space-y-1 text-xs text-slate-400 pt-2 font-mono border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Closing Speed:</span>
              <span className="text-slate-200">{p.relative_speed_kmh} km/h</span>
            </div>
            <div className="flex justify-between">
              <span>Perception Conf:</span>
              <span className="text-cyan-400">{p.confidence_pct}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Lane & Road Conditions */}
        <div className="hud-glass rounded-2xl p-5 border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Compass className="w-4 h-4 text-emerald-400" />
              Lane Guidance
            </span>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded uppercase">
              {p.road_condition}
            </span>
          </div>

          <div className="my-2">
            <div className="text-lg font-bold text-white font-mono">
              {v.lane_name}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between mt-1 font-mono">
              <span>Offset: {v.lane_offset_m > 0 ? `+${v.lane_offset_m}` : v.lane_offset_m}m</span>
              <span>Steering: {v.steering_angle_deg}°</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-400 pt-2 font-mono border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Battery Level:</span>
              <span className="text-emerald-400">{v.battery_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span>Odometer:</span>
              <span className="text-slate-200">{v.odometer_km} km</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: AI Recommendation & Sensor Health Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Safe Action & AI Decision Advisory */}
        <div className="lg:col-span-2 hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Autonomous Vehicle Safety Advisory & Decision
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              State: <strong className="text-cyan-300">{p.ai_status}</strong>
            </span>
          </div>

          {/* Action alert box */}
          <div className={`p-4 rounded-xl border ${
            s.risk_level === 'HIGH' 
              ? 'bg-red-950/40 border-red-500/50 text-red-200' 
              : s.risk_level === 'MEDIUM' 
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              {s.risk_level === 'HIGH' ? (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : s.risk_level === 'MEDIUM' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider font-mono">
                  {s.safe_action}
                </div>
                <div className="text-xs text-slate-300">
                  {s.risk_explanation}
                </div>
              </div>
            </div>
          </div>

          {/* Quick interactive test controls */}
          <div className="pt-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Live Test Scenarios (Instant Demonstration Injections)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onControl?.({ spawn_obstacle_type: 'Pedestrian', obstacle_distance_m: 18.0, relative_speed_kmh: 22.0 })}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-700/50 hover:bg-red-900/60 text-red-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Footprints className="w-3.5 h-3.5 text-red-400" />
                Inject Pedestrian Hazard (18m)
              </button>

              <button
                onClick={() => onControl?.({ spawn_obstacle_type: 'Car', obstacle_distance_m: 28.0, relative_speed_kmh: 18.0 })}
                className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 hover:bg-amber-900/60 text-amber-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Inject Lead Vehicle Braking
              </button>

              <button
                onClick={() => onControl?.({ road_condition: p.road_condition === 'icy' ? 'dry' : 'icy' })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
              >
                Toggle Road: {p.road_condition === 'icy' ? 'Dry Asphalt' : 'Black Ice'}
              </button>

              <button
                onClick={onNavigateToSimulator}
                className="ml-auto px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all"
              >
                Launch 2D Visual Road Simulator →
              </button>
            </div>
          </div>
        </div>

        {/* Sensor Suite Health Status */}
        <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Sensor Array Status
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              ALL NOMINAL
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {Object.entries(p.sensor_health || {}).map(([sensor, status]) => (
              <div key={sensor} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-300 capitalize">{sensor.replace('_', ' ')}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-slate-400 font-mono">
            Redundant sensor fusion active: Forward Radar, solid-state LiDAR, stereo optical cameras, and RTK GNSS/IMU.
          </div>
        </div>

      </div>

      {/* Bottom Row: Live Telemetry Event Stream */}
      <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Real-Time Autonomous System Event Audit Log
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Streaming via WebSocket (Last {events.length} events)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Event Code</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Telemetry Log Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.slice().reverse().map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(ev.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                    {ev.type}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={ev.severity} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {ev.message}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    Awaiting telemetry events...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
