"""
Autonomous Vehicle Telemetry & Physics Simulation Engine
Maintains vehicle state, kinematics, sensor simulation, and automated emergency braking (AEB).
"""
import time
import random
from typing import Dict, Any, List
from collision import calculate_collision_risk, ROAD_FRICTION

class TelemetryEngine:
    def __init__(self):
        # Operational Mode: 'Autonomous' | 'Manual' | 'Emergency'
        self.mode: str = "Autonomous"
        self.speed_kmh: float = 62.0
        self.target_speed_kmh: float = 65.0
        self.acceleration_ms2: float = 0.4
        
        # Lane & Guidance
        self.current_lane: int = 1 # 0: Left, 1: Center, 2: Right
        self.lane_offset_m: float = 0.02
        self.steering_angle_deg: float = 0.5
        
        # Road environment
        self.road_condition: str = "dry"
        
        # Sensor & Obstacle Tracking
        self.obstacle_distance_m: float = 48.0
        self.obstacle_type: str = "Car"
        self.relative_speed_kmh: float = 4.0
        self.traffic_density: str = "Moderate" # Low, Moderate, High
        
        # Emergency & Safety State
        self.aeb_active: bool = False
        self.emergency_stop_triggered: bool = False
        
        # Telemetry metrics
        self.odometer_km: float = 142.6
        self.battery_pct: float = 78.4
        self.energy_draw_kw: float = 18.2
        self.perception_confidence: float = 97.2
        
        # Event audit log (in-memory circular buffer)
        self.events: List[Dict[str, Any]] = [
            {"timestamp": time.time() - 30, "type": "SYS_INIT", "severity": "info", "message": "Autonomous Perception Pipeline Initialized."},
            {"timestamp": time.time() - 15, "type": "LANE_KEEP", "severity": "info", "message": "Lane Centering locked on Highway Corridor A4."},
        ]

    def log_event(self, event_type: str, severity: str, message: str):
        evt = {
            "timestamp": round(time.time(), 2),
            "type": event_type,
            "severity": severity, # info, warning, danger
            "message": message
        }
        self.events.append(evt)
        if len(self.events) > 60:
            self.events.pop(0)

    def set_mode(self, mode: str):
        if mode in ["Autonomous", "Manual", "Emergency"]:
            prev = self.mode
            self.mode = mode
            self.log_event("MODE_CHANGE", "info" if mode == "Autonomous" else "warning", f"Driving mode changed from {prev} to {mode}.")

    def set_target_speed(self, speed: float):
        self.target_speed_kmh = max(0.0, min(140.0, float(speed)))

    def set_road_condition(self, condition: str):
        if condition in ROAD_FRICTION:
            self.road_condition = condition
            self.log_event("ROAD_COND", "warning" if condition in ["icy", "snowy"] else "info", f"Road condition updated to {ROAD_FRICTION[condition]['label']}.")

    def spawn_obstacle(self, obstacle_type: str = "Pedestrian", distance: float = 24.0, rel_speed: float = 18.0):
        self.obstacle_type = obstacle_type
        self.obstacle_distance_m = distance
        self.relative_speed_kmh = rel_speed
        self.log_event("OBSTACLE_DETECTED", "warning" if distance > 25 else "danger", f"Perception flagged {obstacle_type} at {distance:.1f}m closing at {rel_speed:.1f} km/h.")

    def trigger_emergency_brake(self):
        self.mode = "Emergency"
        self.aeb_active = True
        self.target_speed_kmh = 0.0
        self.log_event("MANUAL_EMERGENCY_STOP", "danger", "Manual Emergency Override activated by operator! Full braking applied.")

    def reset_simulation(self):
        self.mode = "Autonomous"
        self.speed_kmh = 55.0
        self.target_speed_kmh = 65.0
        self.obstacle_distance_m = 65.0
        self.obstacle_type = "Car"
        self.relative_speed_kmh = 2.0
        self.aeb_active = False
        self.emergency_stop_triggered = False
        self.log_event("SIM_RESET", "info", "Simulation and telemetry parameters restored to nominal baseline.")

    def step(self, dt: float = 1.0):
        """
        Calculates one simulation physics time step (default dt = 1.0s).
        """
        # Calculate dynamic collision risk
        risk_data = calculate_collision_risk(
            vehicle_speed_kmh=self.speed_kmh,
            obstacle_distance_m=self.obstacle_distance_m,
            relative_speed_kmh=self.relative_speed_kmh,
            road_condition=self.road_condition,
            reaction_time_s=0.25 if self.mode == "Autonomous" else 1.1,
            obstacle_type=self.obstacle_type
        )
        risk_level = risk_data["metrics"]["risk_level"]

        # Autonomous Emergency Braking (AEB) Logic
        if self.mode == "Autonomous":
            if risk_level == "HIGH":
                if not self.aeb_active:
                    self.aeb_active = True
                    self.log_event("AEB_ENGAGED", "danger", f"HIGH COLLISION RISK! Autonomous Emergency Braking (AEB) triggered. TTC: {risk_data['metrics']['time_to_collision_display']}")
                # Harsh deceleration
                decel = 8.5 * dt * 3.6 # km/h per second
                self.speed_kmh = max(0.0, self.speed_kmh - decel)
                self.acceleration_ms2 = -8.5
                self.target_speed_kmh = 0.0
            elif risk_level == "MEDIUM":
                self.aeb_active = False
                # Modulated slowdown
                decel = 3.2 * dt * 3.6
                self.speed_kmh = max(20.0, self.speed_kmh - decel)
                self.acceleration_ms2 = -3.2
            else: # LOW risk
                self.aeb_active = False
                # Normal adaptive cruise acceleration / deceleration toward target
                speed_diff = self.target_speed_kmh - self.speed_kmh
                if abs(speed_diff) < 0.5:
                    self.acceleration_ms2 = 0.0
                elif speed_diff > 0:
                    self.acceleration_ms2 = min(2.5, speed_diff * 0.4)
                    self.speed_kmh += self.acceleration_ms2 * dt * 3.6
                else:
                    self.acceleration_ms2 = max(-3.0, speed_diff * 0.4)
                    self.speed_kmh += self.acceleration_ms2 * dt * 3.6
        elif self.mode == "Emergency":
            self.aeb_active = True
            self.speed_kmh = max(0.0, self.speed_kmh - (9.5 * dt * 3.6))
            self.acceleration_ms2 = -9.5
        else: # Manual mode
            speed_diff = self.target_speed_kmh - self.speed_kmh
            self.speed_kmh = max(0.0, self.speed_kmh + max(-6.0, min(4.0, speed_diff * 0.5)))
            self.acceleration_ms2 = (speed_diff * 0.5) / 3.6

        # Update obstacle distance dynamically based on relative speed
        # rel_speed is v_ego - v_obstacle
        v_rel_ms = self.relative_speed_kmh / 3.6
        self.obstacle_distance_m -= v_rel_ms * dt
        
        # If obstacle is cleared or overtaken, cycle next obstacle in simulation
        if self.obstacle_distance_m < 2.0 or self.speed_kmh < 1.0:
            if self.speed_kmh < 1.0 and self.obstacle_distance_m <= 4.0:
                # Car came to complete safe stop before hitting obstacle!
                if self.aeb_active and not self.emergency_stop_triggered:
                    self.emergency_stop_triggered = True
                    self.log_event("SAFE_STOP_ACHIEVED", "info", f"AEB brought vehicle to safe standstill at {self.obstacle_distance_m:.1f}m from {self.obstacle_type}.")
            elif self.obstacle_distance_m < 2.0:
                # Reset obstacle ahead after passing
                self.obstacle_distance_m = random.uniform(60.0, 95.0)
                self.obstacle_type = random.choice(["Car", "Truck", "SUV", "Motorcycle", "Bicycle"])
                self.relative_speed_kmh = random.uniform(-2.0, 5.0)
                self.aeb_active = False
                self.emergency_stop_triggered = False
                if self.mode == "Autonomous" and self.target_speed_kmh < 20:
                    self.target_speed_kmh = 60.0
        
        # Subtle sensor oscillations (realistic autonomous vehicle micro-adjustments)
        self.lane_offset_m = round(math_clamp(self.lane_offset_m + random.uniform(-0.02, 0.02), -0.35, 0.35), 3)
        self.steering_angle_deg = round(self.lane_offset_m * 12.0 + random.uniform(-0.3, 0.3), 1)
        self.perception_confidence = round(max(91.0, min(99.4, 96.5 + random.uniform(-1.5, 1.5))), 1)
        
        # Energy and distance
        dist_traveled_km = (self.speed_kmh / 3600.0) * dt
        self.odometer_km = round(self.odometer_km + dist_traveled_km, 3)
        self.battery_pct = round(max(5.0, self.battery_pct - (dist_traveled_km * 0.15)), 2)
        self.energy_draw_kw = round(max(2.0, self.speed_kmh * 0.28 + abs(self.acceleration_ms2) * 5.2), 1)

        # AI status determination
        if self.aeb_active:
            ai_status = "AEB_ACTIVE"
        elif self.mode == "Emergency":
            ai_status = "EMERGENCY_OVERRIDE"
        elif self.mode == "Manual":
            ai_status = "MANUAL_STANDBY"
        else:
            ai_status = "AUTONOMOUS_CRUISE" if risk_level == "LOW" else "ADAPTIVE_COLLISION_AVOIDANCE"

        return self.get_telemetry_snapshot(risk_data, ai_status)

    def get_telemetry_snapshot(self, risk_data: Dict[str, Any] = None, ai_status: str = None) -> Dict[str, Any]:
        if risk_data is None:
            risk_data = calculate_collision_risk(
                vehicle_speed_kmh=self.speed_kmh,
                obstacle_distance_m=self.obstacle_distance_m,
                relative_speed_kmh=self.relative_speed_kmh,
                road_condition=self.road_condition,
                reaction_time_s=0.25 if self.mode == "Autonomous" else 1.1,
                obstacle_type=self.obstacle_type
            )
        
        if ai_status is None:
            if self.aeb_active:
                ai_status = "AEB_ACTIVE"
            elif self.mode == "Manual":
                ai_status = "MANUAL_STANDBY"
            else:
                ai_status = "AUTONOMOUS_CRUISE"

        return {
            "timestamp": time.time(),
            "simulation_label": "SIMULATED TELEMETRY (Prototype Testbed)",
            "vehicle": {
                "speed_kmh": round(self.speed_kmh, 1),
                "target_speed_kmh": round(self.target_speed_kmh, 1),
                "acceleration_ms2": round(self.acceleration_ms2, 2),
                "mode": self.mode,
                "lane": self.current_lane,
                "lane_name": ["Left Express", "Center Cruising", "Right Exit/Slow"][self.current_lane],
                "lane_offset_m": self.lane_offset_m,
                "steering_angle_deg": self.steering_angle_deg,
                "battery_pct": self.battery_pct,
                "energy_draw_kw": self.energy_draw_kw,
                "odometer_km": round(self.odometer_km, 2),
                "aeb_active": self.aeb_active
            },
            "perception": {
                "ai_status": ai_status,
                "confidence_pct": self.perception_confidence,
                "road_condition": self.road_condition,
                "obstacle_type": self.obstacle_type,
                "obstacle_distance_m": round(self.obstacle_distance_m, 1),
                "relative_speed_kmh": round(self.relative_speed_kmh, 1),
                "sensor_health": {
                    "lidar": "OPTIMAL",
                    "radar_forward": "OPTIMAL",
                    "vision_cameras": "OPTIMAL",
                    "imu_localization": "CALIBRATED"
                }
            },
            "safety": {
                "risk_level": risk_data["metrics"]["risk_level"],
                "risk_score": risk_data["metrics"]["risk_score"],
                "risk_color": risk_data["metrics"]["risk_color"],
                "time_to_collision_s": risk_data["metrics"]["time_to_collision_s"],
                "time_to_collision_display": risk_data["metrics"]["time_to_collision_display"],
                "stopping_distance_m": risk_data["metrics"]["total_stopping_distance_m"],
                "safety_margin_m": risk_data["metrics"]["safety_margin_m"],
                "safe_action": risk_data["recommendation"]["action"],
                "risk_explanation": risk_data["recommendation"]["explanation"]
            },
            "events": self.events[-12:]
        }

def math_clamp(val, low, high):
    return max(low, min(high, val))

telemetry_engine = TelemetryEngine()
