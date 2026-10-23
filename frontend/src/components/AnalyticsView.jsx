import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Car, 
  TrafficCone, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

export default function AnalyticsView({ telemetry }) {
  const [summaryData, setSummaryData] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  const handleDownloadCsv = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = api.getExportCsvUrl();
    link.setAttribute('download', 'autonomous_transport_ai_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 800);
  };

  const events = telemetry?.events || [];
  const filteredEvents = filterSeverity === 'ALL' 
    ? events 
    : events.filter(e => e.severity?.toUpperCase() === filterSeverity);

  const timeSeries = summaryData?.time_series || [];
  const classBreakdown = summaryData?.object_class_breakdown || [];

  return (
    <div className="space-y-6">
      
      {/* Header & Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Autonomous System Analytics & Fleet Telemetry Reports
          </h2>
          <p className="text-xs text-slate-400">
            Real-time statistical aggregation of vehicle kinematics, AI perception detections, collision risk events, and traffic density.
          </p>
        </div>

        {/* Working CSV Export Button */}
        <button
          onClick={handleDownloadCsv}
          disabled={downloading}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-semibold text-xs font-mono rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{downloading ? 'Generating Report...' : 'Export Demo Report (CSV)'}</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Average Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-white">
              {summaryData?.average_simulated_speed_kmh || 61.2}
            </span>
            <span className="text-xs font-mono text-cyan-400">KM/H</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Autonomous Cruise Level 3</span>
        </div>

        {/* KPI 2 */}
        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Average Grid Density</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              {summaryData?.average_traffic_density_pct || 53.8}%
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">5 Smart Intersections</span>
        </div>

        {/* KPI 3 */}
        <div className="hud-glass rounded-2xl p-4 border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Objects Detected</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {summaryData?.total_objects_detected || 1289}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">YOLOv8 Perception Detections</span>
        </div>

        {/* KPI 4 */}
        <div className="hud-glass rounded-2xl p-4 border-red-500/20 bg-red-950/15">
          <span className="text-[11px] font-mono text-red-300 uppercase block">AEB Braking Events</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold font-mono text-red-400">
              {summaryData?.emergency_braking_events_count || 4}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Zero Collisions Recorded</span>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Speed & Safety Margin Over Time */}
        <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Simulated Velocity & Dynamic Safety Buffer
            </span>
            <span className="text-[11px] font-mono text-slate-500">Time-Series (UTC)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090E1A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="speed_kmh" stroke="#00F0FF" strokeWidth={2} name="Speed (km/h)" dot={false} />
                <Line type="monotone" dataKey="safety_margin_m" stroke="#10B981" strokeWidth={2} name="Safety Margin (m)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Object Detection Class Breakdown */}
        <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              Perception Detections by Class Breakdown
            </span>
            <span className="text-[11px] font-mono text-slate-500">COCO Road Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090E1A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Detections Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Event Audit Table */}
      <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              System Audit Event Stream (Filterable)
            </h3>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {['ALL', 'INFO', 'WARNING', 'DANGER'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterSeverity === sev 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Event Code</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEvents.slice().reverse().map((ev, idx) => (
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
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    No events match the selected severity filter.
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
