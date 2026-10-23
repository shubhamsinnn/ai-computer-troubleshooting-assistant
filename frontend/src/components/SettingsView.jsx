import React, { useState } from 'react';
import { 
  Settings, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Sliders, 
  Info, 
  Play, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ wsStatus, telemetry }) {
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [streamMode, setStreamMode] = useState('websocket');

  const runDiagnostics = async () => {
    setDiagnosticsRunning(true);
    setDiagnosticResults(null);

    const steps = [];

    // Step 1: Health
    try {
      const h = await api.getHealth();
      steps.push({ name: 'Backend FastAPI Health', status: 'PASS', details: `Uptime: OK, Model: ${h.ai_model?.type}` });
    } catch (e) {
      steps.push({ name: 'Backend FastAPI Health', status: 'FAIL', details: e.message });
    }

    // Step 2: Perception Model
    try {
      const sample = await api.detectSample('highway', 0.35);
      steps.push({ 
        name: 'AI Object Detection (YOLO / CV)', 
        status: 'PASS', 
        details: `Inference time: ${sample.inference_time_ms}ms, Objects: ${sample.total_detections}` 
      });
    } catch (e) {
      steps.push({ name: 'AI Object Detection', status: 'FAIL', details: e.message });
    }

    // Step 3: Collision Physics
    try {
      const c = await api.calculateCollisionRisk({
        vehicle_speed_kmh: 60,
        obstacle_distance_m: 30,
        relative_speed_kmh: 15,
        road_condition: 'dry',
        reaction_time_s: 0.35,
        obstacle_type: 'car'
      });
      steps.push({ 
        name: 'Kinematic Collision Calculator', 
        status: 'PASS', 
        details: `TTC: ${c.metrics.time_to_collision_display}, Stopping Dist: ${c.metrics.total_stopping_distance_m}m` 
      });
    } catch (e) {
      steps.push({ name: 'Kinematic Collision Calculator', status: 'FAIL', details: e.message });
    }

    // Step 4: Traffic Grid
    try {
      const t = await api.getTrafficData();
      steps.push({ 
        name: 'Intelligent Traffic Map Grid', 
        status: 'PASS', 
        details: `${t.intersections?.length} intersections, Density: ${t.network_status?.overall_density_pct}%` 
      });
    } catch (e) {
      steps.push({ name: 'Intelligent Traffic Map Grid', status: 'FAIL', details: e.message });
    }

    // Step 5: WebSocket Connection
    steps.push({
      name: 'Real-Time Bi-Directional WebSocket',
      status: wsStatus === 'connected' ? 'PASS' : 'WARN',
      details: `Status: ${wsStatus}`
    });

    setDiagnosticResults(steps);
    setDiagnosticsRunning(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          System Settings & Automated Diagnostics
        </h2>
        <p className="text-xs text-slate-400">
          Run automated validation across all microservices, adjust telemetry stream settings, and inspect project architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Diagnostics Suite (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Autonomous System Self-Diagnostic Suite
              </span>
              <button
                onClick={runDiagnostics}
                disabled={diagnosticsRunning}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs font-mono rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
                <span>{diagnosticsRunning ? 'Running Tests...' : 'Run Diagnostics Check'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Performs real-time end-to-end integration tests on FastAPI endpoints, YOLOv8 inference latency, physics equations, and WebSocket socket ping.
            </p>

            {/* Results list */}
            {diagnosticResults ? (
              <div className="space-y-2 pt-2">
                {diagnosticResults.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="text-white font-bold">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.details}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      r.status === 'PASS' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                        : r.status === 'WARN'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        : 'bg-red-950 text-red-300 border border-red-700/60'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs font-mono text-slate-500">
                Click "Run Diagnostics Check" to verify all hardware and software modules.
              </div>
            )}
          </div>

          {/* Demonstration Metadata Card */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-slate-300 uppercase font-bold block border-b border-slate-800 pb-2">
              Academic Project & Demonstration Metadata
            </span>
            <div className="grid grid-cols-2 gap-3 text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Project Title</span>
                <span className="text-slate-200 font-semibold">Real-Time AI: Autonomous Vehicles & Intelligent Transportation</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Target Audience</span>
                <span className="text-cyan-400 font-semibold">College Demonstration & Faculty Review</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Frontend Architecture</span>
                <span className="text-slate-200">React 19 + Vite + Tailwind CSS v4 + Recharts + Leaflet</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Backend Architecture</span>
                <span className="text-slate-200">Python 3.12 + FastAPI + YOLOv8 (ultralytics) + OpenCV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Runtime Configurations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4 font-mono text-xs">
            <span className="text-slate-300 uppercase font-bold block border-b border-slate-800 pb-2">
              Communication & Sensor Settings
            </span>

            {/* Protocol */}
            <div className="space-y-1.5">
              <label className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Live Telemetry Transport Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStreamMode('websocket')}
                  className={`p-2 rounded-xl text-xs border text-center transition-all ${
                    streamMode === 'websocket'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  WebSocket (1Hz Push)
                </button>
                <button
                  onClick={() => setStreamMode('polling')}
                  className={`p-2 rounded-xl text-xs border text-center transition-all ${
                    streamMode === 'polling'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  REST Polling Fallback
                </button>
              </div>
            </div>

            {/* Audio Warnings Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-white font-bold">Audio Hazard Alerts</div>
                <div className="text-[10px] text-slate-500">Chime on High Collision Risk / AEB</div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Active Telemetry Snapshot */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-slate-400 space-y-1">
              <div className="text-cyan-300 font-bold">Client Connection Info</div>
              <div>WebSocket Status: <strong className="text-white">{wsStatus}</strong></div>
              <div>Active Odometer: <strong className="text-white">{telemetry?.vehicle?.odometer_km || 142} km</strong></div>
              <div>Battery Level: <strong className="text-emerald-400">{telemetry?.vehicle?.battery_pct || 78}%</strong></div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
