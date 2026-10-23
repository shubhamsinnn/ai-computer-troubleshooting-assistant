import React from 'react';
import { 
  Gauge, 
  Car, 
  Scan, 
  AlertOctagon, 
  TrafficCone, 
  BarChart3, 
  ShieldCheck, 
  Settings,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabSelect, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Gauge, badge: 'Live' },
    { id: 'simulator', label: 'Driving Simulator', icon: Car, badge: '2D HUD' },
    { id: 'detection', label: 'AI Object Detection', icon: Scan, badge: 'YOLOv8' },
    { id: 'collision', label: 'Collision Risk Analysis', icon: AlertOctagon, badge: 'Physics' },
    { id: 'traffic', label: 'Intelligent Traffic', icon: TrafficCone, badge: 'Leaflet' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, badge: 'CSV' },
    { id: 'responsible', label: 'Responsible AI & Safety', icon: ShieldCheck },
    { id: 'settings', label: 'Settings & Diagnostics', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-40
        w-64 bg-[#090E1A] border-r border-slate-800/80
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1 pt-14 lg:pt-3">
          
          <div className="px-3 py-2 text-[11px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
            Perception & Control
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabSelect(item.id);
                  onCloseMobile?.();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  text-xs font-medium transition-all group text-left
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/50 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070B14]">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Perception Core</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Edge FPS</span>
              <span className="text-slate-300">30.0 Hz</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>ISO 26262 Tier</span>
              <span className="text-cyan-400">Prototype L3</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
