import React from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Lock, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Scale, 
  HelpCircle,
  Cpu
} from 'lucide-react';

export default function ResponsibleAiView() {
  const principles = [
    {
      icon: Eye,
      title: '1. AI Decision Transparency & Explainability',
      color: 'text-cyan-400',
      description: 'Every autonomous steering, throttle override, and automated emergency brake (AEB) command must be backed by transparent mathematical kinematics rather than an opaque black box. In this prototype, Time-To-Collision (TTC) and Newtonian stopping distance formulas dictate risk triggers, ensuring human operators and safety regulators can trace the exact rationale for every action.'
    },
    {
      icon: Lock,
      title: '2. Edge Perception Privacy & Data Minimization',
      color: 'text-emerald-400',
      description: 'Road camera streams and sensor data are processed strictly at the vehicle edge (locally in RAM). Bounding boxes and numerical coordinates are extracted without persisting facial identities, license plate PII, or driver biometrics. In accordance with GDPR and ISO/SAE 21434 automotive cybersecurity principles, telemetry logs are anonymized.'
    },
    {
      icon: Scale,
      title: '3. Confidence Calibration & Model Limitations',
      color: 'text-amber-400',
      description: 'Deep neural networks (such as YOLOv8) generate probabilistic inferences. Under adversarial weather (dense fog, blizzard, heavy glare), optical sensor confidence degrades. Our pipeline incorporates multi-modal sensor fusion rules (Radar + Vision cross-verification) and sets conservative thresholds (default 0.35) below which unverified objects prompt driver vigilance alerts.'
    },
    {
      icon: AlertTriangle,
      title: '4. False Positives vs. False Negatives Governance',
      color: 'text-red-400',
      description: 'In autonomous transportation safety, a False Negative (failing to recognize a crossing pedestrian) is catastrophic, while an unnecessary phantom brake (False Positive) can cause rear-end collisions. The architecture uses temporal persistence filters (requiring detection over consecutive frames) and graduated braking profiles to mitigate both failure modes.'
    },
    {
      icon: UserCheck,
      title: '5. Human-in-the-Loop (HITL) & Seamless Takeover',
      color: 'text-blue-400',
      description: 'Under SAE Level 3 autonomous operation, human operators retain ultimate supervisory authority. Steering wheel torque sensors and brake pedal depression immediately disengage autonomous cruise, reverting full authority to the human driver within 150 milliseconds.'
    },
    {
      icon: ShieldCheck,
      title: '6. Academic & Prototype Boundaries (Why Real Control is Restricted)',
      color: 'text-purple-400',
      description: 'Production autonomous systems require ASIL-D (Automotive Safety Integrity Level D) hardware redundancy, lockstep microcontrollers, dual-redundant power busses, and millions of real-world validation miles. This software is an educational prototype and research testbed; it must never be connected to real motor vehicle CAN-bus actuators.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Responsible AI, Safety Governance & Ethics Framework
        </h2>
        <p className="text-xs text-slate-400">
          Core principles for ethical deployment, sensor transparency, and human oversight in intelligent transportation systems.
        </p>
      </div>

      {/* Critical Prototype Safety Banner */}
      <div className="hud-glass rounded-2xl p-5 border-amber-500/40 bg-amber-950/20 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold font-mono text-sm uppercase">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>PROTOTYPE BOUNDARY & LEGAL NOTICE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          This application is strictly an educational testbed designed for university coursework and research demonstrations. It simulates autonomous vehicle kinematics, computer vision perception, and adaptive traffic signal logic in a controlled software environment. Under no circumstances should this software be connected to, or claimed to control, real motor vehicles or municipal traffic light networks.
        </p>
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {principles.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Compliance Benchmark</span>
                <span className="text-cyan-400">ISO 26262 / SAE J3016</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Fusion & Failure Mode Matrix */}
      <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Autonomous Sensor Degraded Modes & Redundancy Protocol
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
            FAIL-OPERATIONAL MATRIX
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-white font-bold">1. Optical Camera Occlusion</div>
            <div className="text-[11px] text-slate-400">
              Sun glare or mud on optical lens triggers primary reliance on 77 GHz millimeter-wave Radar. Target speed capped at 50 km/h.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-white font-bold">2. GNSS Multipath / Tunnel</div>
            <div className="text-[11px] text-slate-400">
              Loss of satellite fix switches vehicle to wheel odometry dead-reckoning and LiDAR point-cloud lane feature matching.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-white font-bold">3. Dual Sensor Disagreement</div>
            <div className="text-[11px] text-slate-400">
              When Camera detects obstacle but Radar reads open space, conservative safety protocol initiates controlled deceleration and alerts operator.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
