import React, { useState, useEffect, useRef } from 'react';
import { 
  TrafficCone, 
  MapPin, 
  Navigation, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Route, 
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

export default function TrafficView() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);

  const [trafficData, setTrafficData] = useState(null);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [activeRouteTab, setActiveRouteTab] = useState('all');

  // Load initial traffic data
  useEffect(() => {
    loadTrafficOverview();
  }, []);

  const loadTrafficOverview = async () => {
    try {
      const data = await api.getTrafficData();
      setTrafficData(data);
      if (data.intersections?.length > 0 && !selectedIntersection) {
        setSelectedIntersection(data.intersections[0]);
      }
    } catch (err) {
      console.error('Failed to load traffic data', err);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Metro Innovation District (SF sample coordinates)
    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // Dark Matter tile layer for automotive HUD aesthetics
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers & routes whenever trafficData changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !trafficData) return;

    // 1. Clear previous layers
    markersLayerRef.current?.clearLayers();
    routesLayerRef.current?.clearLayers();

    // 2. Add Intersection Markers
    trafficData.intersections?.forEach((item) => {
      const isCongested = item.density_pct >= 70;
      const isModerate = item.density_pct >= 40 && item.density_pct < 70;
      const color = isCongested ? '#EF4444' : (isModerate ? '#F59E0B' : '#10B981');

      // Custom circular SVG pulse icon
      const customIcon = L.divIcon({
        className: 'custom-traffic-pin',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${color};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px ${color};
            color: #000;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
            cursor: pointer;
          ">
            ${item.density_pct}%
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #0f172a; min-width: 170px;">
            <strong style="color: #0284c7; font-size: 13px;">${item.name}</strong><br/>
            <span>Status: <strong>${item.status}</strong></span><br/>
            <span>Traffic Density: <strong>${item.density_pct}%</strong></span><br/>
            <span>Queue: <strong>${item.queue_vehicles} vehicles</strong></span><br/>
            <span>Signal Cycle: <strong>${item.signal.ns_green_s}s NS / ${item.signal.ew_green_s}s EW</strong></span>
          </div>
        `);

      marker.on('click', () => {
        setSelectedIntersection(item);
      });
    });

    // 3. Draw Route Polylines
    trafficData.routes?.forEach((route) => {
      const polyline = L.polyline(route.waypoints, {
        color: route.color || '#3B82F6',
        weight: route.recommended ? 5 : 3.5,
        opacity: route.recommended ? 0.95 : 0.65,
        dashArray: route.recommended ? null : '6, 6'
      }).addTo(routesLayerRef.current);

      polyline.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
          <strong>${route.name}</strong><br/>
          <span>ETA: <strong>${route.current_eta_min} min</strong> (${route.distance_km} km)</span><br/>
          <span>Condition: ${route.congestion_level}</span>
        </div>
      `);
    });

  }, [trafficData]);

  // Handle Signal Optimization trigger
  const handleOptimizeSignals = async () => {
    setOptimizing(true);
    try {
      const res = await api.optimizeTrafficSignals();
      setOptResult(res);
      await loadTrafficOverview();
    } catch (err) {
      console.error('Optimization error', err);
    } finally {
      setOptimizing(false);
    }
  };

  const net = trafficData?.network_status || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <TrafficCone className="w-5 h-5 text-cyan-400" />
            Intelligent Transportation & Traffic Management System
          </h2>
          <p className="text-xs text-slate-400">
            Real-time urban corridor monitoring, congestion heatmaps, dynamic detour routing, and AI signal cycle optimization.
          </p>
        </div>

        {/* Optimize button */}
        <button
          onClick={handleOptimizeSignals}
          disabled={optimizing}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-semibold text-xs font-mono rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{optimizing ? 'Calculating Splits...' : 'Optimize Traffic Signals'}</span>
        </button>
      </div>

      {/* Sample Data Disclaimer Alert */}
      <div className="hud-glass rounded-xl p-3 border-cyan-800/40 bg-cyan-950/20 text-xs font-mono flex items-center justify-between text-cyan-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>SIMULATED TRAFFIC GRID:</strong> Data reflects simulated smart city sensor loop detectors and probe vehicles. Demonstrates adaptive split algorithms.
          </span>
        </div>
        <span className="hidden md:inline text-[10px] bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-700/60 text-cyan-300">
          5 CORRIDOR NODES
        </span>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Grid Average Density</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-white">
              {net.overall_density_pct || 58}%
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Normal Range (45-65%)</span>
        </div>

        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Queued Vehicles</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              {net.total_queued_vehicles || 94}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Across 5 monitored junctions</span>
        </div>

        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Congested Nodes</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-extrabold font-mono ${
              (net.congested_intersections || 0) > 1 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {net.congested_intersections || 1} / {net.total_intersections || 5}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Density ≥ 70%</span>
        </div>

        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">AI Adaptive Control</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold font-mono text-emerald-400">
              {net.ai_optimization_active ? 'ACTIVE' : 'READY'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Webster split algorithm</span>
        </div>

      </div>

      {/* Main Grid: Interactive Map (8 cols) + Corridor Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leaflet Map Container (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="hud-glass rounded-2xl p-3 border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono px-2 py-1.5 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-cyan-400" />
                Metro Arterial Network & Smart Signal Hubs
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Free Flow
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Congested
                </span>
              </div>
            </div>

            {/* Map Element */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[460px] rounded-xl overflow-hidden z-10 border border-slate-800/80" 
            />
          </div>

          {/* AI Signal Optimization Result Banner if applied */}
          {optResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs font-mono text-emerald-200 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white uppercase">
                    Signal Re-timing Successful: {optResult.overall_delay_reduction_pct}% Delay Reduction
                  </div>
                  <div className="text-[11px] text-emerald-300/90 mt-0.5">
                    Average vehicle corridor queue wait reduced from {optResult.avg_wait_time_before_s}s to {optResult.avg_wait_time_after_s}s.
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">
                APPLIED TO ALL JUNCTIONS
              </span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Selected Junction Details & Detour Routes (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Intersection Card */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">
                Intersection Telemetry
              </span>
              <StatusBadge status={selectedIntersection?.status || 'Active'} size="sm" />
            </div>

            {selectedIntersection ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-white font-bold text-sm">
                    {selectedIntersection.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ID: {selectedIntersection.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Density</span>
                    <span className="text-lg font-bold text-cyan-400">
                      {selectedIntersection.density_pct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Queue Length</span>
                    <span className="text-lg font-bold text-white">
                      {selectedIntersection.queue_vehicles} cars
                    </span>
                  </div>
                </div>

                {/* Signal Timing Details */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase">
                    Signal Cycle Timing
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>North-South Green:</span>
                    <span className="text-emerald-400 font-bold">{selectedIntersection.signal.ns_green_s}s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>East-West Green:</span>
                    <span className="text-emerald-400 font-bold">{selectedIntersection.signal.ew_green_s}s</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                    <span>Total Cycle:</span>
                    <span>{selectedIntersection.signal.cycle_time_s} seconds</span>
                  </div>
                </div>

                {selectedIntersection.incident && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/50 text-[11px] text-red-200">
                    <strong>Incident Flag:</strong> {selectedIntersection.incident}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 font-mono text-xs py-6 text-center">
                Click any intersection marker on the map to inspect live signal and queue data.
              </div>
            )}
          </div>

          {/* AI Recommended Route Comparison */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Route className="w-4 h-4 text-cyan-400" />
              Dynamic Route Guidance
            </span>

            <div className="space-y-2.5">
              {trafficData?.routes?.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    r.recommended
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{r.name}</span>
                    {r.recommended && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-black px-1.5 py-0.5 rounded">
                        AI BEST
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300 my-1">
                    <span>ETA: <strong className={r.recommended ? 'text-emerald-400' : 'text-white'}>{r.current_eta_min} mins</strong></span>
                    <span className="text-slate-400">{r.distance_km} km</span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {r.congestion_level}
                  </div>

                  {r.time_saved_min && (
                    <div className="mt-2 pt-1.5 border-t border-emerald-800/40 text-[10px] text-emerald-300 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Saves {r.time_saved_min} mins & -{r.emissions_saved_pct}% idle carbon
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
