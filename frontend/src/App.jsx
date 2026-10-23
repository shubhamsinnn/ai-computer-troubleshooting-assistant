import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, AlertTriangle } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SimulatorView from './components/SimulatorView';
import ObjectDetectionView from './components/ObjectDetectionView';
import CollisionRiskView from './components/CollisionRiskView';
import TrafficView from './components/TrafficView';
import AnalyticsView from './components/AnalyticsView';
import ResponsibleAiView from './components/ResponsibleAiView';
import SettingsView from './components/SettingsView';
import { api, TelemetrySocket } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [backendError, setBackendError] = useState(null);

  const socketRef = useRef(null);

  // Initialize live WebSocket stream and fallback polling
  useEffect(() => {
    // 1. Initial REST fetch for immediate render
    api.getCurrentTelemetry()
      .then((data) => {
        setTelemetry(data);
        setBackendError(null);
      })
      .catch((err) => {
        console.warn('Initial REST telemetry fetch failed:', err.message);
        setBackendError('Backend connection establishing... (Run backend on port 8000)');
      });

    // 2. Open WebSocket
    socketRef.current = new TelemetrySocket(
      (msg) => {
        if (msg.type === 'TELEMETRY_UPDATE' || msg.type === 'INITIAL_STATE') {
          setTelemetry(msg.data);
          setBackendError(null);
        }
      },
      (status) => {
        setWsStatus(status);
      }
    );

    // 3. Fallback Polling (in case WS fails or is in reconnect loop)
    const pollInterval = setInterval(() => {
      if (wsStatus !== 'connected') {
        api.getCurrentTelemetry()
          .then((data) => {
            setTelemetry(data);
            setBackendError(null);
          })
          .catch((e) => {
            // Keep error visible if persistent
          });
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      socketRef.current?.close();
    };
  }, [wsStatus]);

  // Mode Change handler
  const handleModeChange = async (mode) => {
    try {
      const res = await api.controlTelemetry({ mode });
      if (res.telemetry) setTelemetry(res.telemetry);
    } catch (err) {
      console.error('Mode change error:', err);
    }
  };

  // Generic Control handler
  const handleControl = async (payload) => {
    try {
      const res = await api.controlTelemetry(payload);
      if (res.telemetry) setTelemetry(res.telemetry);
    } catch (err) {
      console.error('Control error:', err);
    }
  };

  // Emergency Brake handler
  const handleEmergencyBrake = async () => {
    try {
      await api.triggerEmergencyBrake();
      const updated = await api.getCurrentTelemetry();
      setTelemetry(updated);
    } catch (err) {
      console.error('Brake error:', err);
    }
  };

  // Reset Simulation handler
  const handleReset = async () => {
    try {
      await api.resetSimulation();
      const updated = await api.getCurrentTelemetry();
      setTelemetry(updated);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        telemetry={telemetry}
        wsStatus={wsStatus}
        onModeChange={handleModeChange}
        onEmergencyBrake={handleEmergencyBrake}
        onReset={handleReset}
      />

      {/* Backend connection notice if offline */}
      {backendError && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs font-mono text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{backendError}</span>
          </div>
          <button 
            onClick={() => setBackendError(null)}
            className="text-amber-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + View Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Mobile menu toggle bar */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabSelect={setActiveTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Primary Content Container */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-7 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              telemetry={telemetry}
              onControl={handleControl}
              onEmergencyBrake={handleEmergencyBrake}
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView
              telemetry={telemetry}
              onControl={handleControl}
              onEmergencyBrake={handleEmergencyBrake}
              onReset={handleReset}
            />
          )}

          {activeTab === 'detection' && (
            <ObjectDetectionView />
          )}

          {activeTab === 'collision' && (
            <CollisionRiskView />
          )}

          {activeTab === 'traffic' && (
            <TrafficView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              telemetry={telemetry}
            />
          )}

          {activeTab === 'responsible' && (
            <ResponsibleAiView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              wsStatus={wsStatus}
              telemetry={telemetry}
            />
          )}
        </main>

      </div>

    </div>
  );
}
