import React from 'react';
import { 
  Gauge, 
  Wifi, 
  Volume2, 
  Snowflake, 
  MonitorX, 
  Printer, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';

const CATEGORY_CHIPS = [
  {
    id: "slow_computer",
    label: "Slow PC / Lag",
    icon: Gauge,
    color: "from-amber-600/20 to-amber-900/30 text-amber-300 border-amber-600/40",
    query: "My computer is running extremely slow and takes forever to boot up and open programs."
  },
  {
    id: "network_wifi",
    label: "Wi-Fi / Internet Down",
    icon: Wifi,
    color: "from-cyan-600/20 to-blue-900/30 text-cyan-300 border-cyan-600/40",
    query: "My Wi-Fi keeps disconnecting and web pages say server DNS address could not be found."
  },
  {
    id: "audio_sound",
    label: "No Sound / Audio",
    icon: Volume2,
    color: "from-blue-600/20 to-indigo-900/30 text-blue-300 border-blue-600/40",
    query: "There is no sound coming from my speakers or headphones even though volume is turned up."
  },
  {
    id: "app_freeze",
    label: "Apps Freezing",
    icon: Snowflake,
    color: "from-sky-600/20 to-cyan-900/30 text-sky-300 border-sky-600/40",
    query: "My applications keep freezing with a white screen and show Not Responding."
  },
  {
    id: "boot_black_screen",
    label: "Black Screen / Won't Boot",
    icon: MonitorX,
    color: "from-purple-600/20 to-purple-900/30 text-purple-300 border-purple-600/40",
    query: "When I turn on my computer, it shows a black screen with only the mouse cursor visible."
  },
  {
    id: "printer_issue",
    label: "Printer Not Detected",
    icon: Printer,
    color: "from-emerald-600/20 to-teal-900/30 text-emerald-300 border-emerald-600/40",
    query: "My printer says offline and print jobs are stuck in the print spooler queue."
  },
  {
    id: "resource_usage",
    label: "100% CPU / RAM",
    icon: Cpu,
    color: "from-red-600/20 to-rose-900/30 text-red-300 border-red-600/40",
    query: "Task Manager shows 100% CPU and disk usage and my laptop cooling fans are spinning very loud."
  },
  {
    id: "software_driver",
    label: "Driver / BSOD Error",
    icon: AlertTriangle,
    color: "from-orange-600/20 to-red-900/30 text-orange-300 border-orange-600/40",
    query: "Windows crashed with a blue screen (BSOD) stop code mentioning a driver error."
  }
];

export default function QuickCategorySelector({ onSelectQuery }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold">Quick-Select Common Computer Problems:</span>
        <span className="hidden sm:inline text-slate-500">Click any card for instant diagnosis</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CATEGORY_CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectQuery(chip.query)}
              className={`p-3 rounded-2xl bg-gradient-to-b border text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] flex items-center gap-2.5 group ${chip.color}`}
            >
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-mono font-semibold tracking-wide text-slate-200 group-hover:text-white line-clamp-1">
                {chip.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
