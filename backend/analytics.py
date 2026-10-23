"""
Analytics and Demonstration Report Engine
Maintains time-series data for vehicle speed, traffic density, risk incidents, and generates downloadable CSV reports.
"""
import io
import csv
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

class AnalyticsEngine:
    def __init__(self):
        self.start_time = time.time()
        
        # Time series data for charts (last 20 data points)
        self.time_series_data: List[Dict[str, Any]] = []
        self._init_history()

        # Cumulative counters
        self.total_frames_processed = 342
        self.total_objects_detected = 1289
        self.total_aeb_activations = 4
        self.total_collision_warnings = 17

        # Object detection class distribution stats
        self.class_counts = {
            "car": 684,
            "truck": 192,
            "bus": 88,
            "pedestrian": 142,
            "bicycle": 98,
            "motorcycle": 65,
            "traffic_light": 20
        }

    def _init_history(self):
        base_time = int(time.time()) - 100
        for i in range(20):
            t = base_time + (i * 5)
            dt_str = datetime.fromtimestamp(t, timezone.utc).strftime("%H:%M:%S")
            self.time_series_data.append({
                "time": dt_str,
                "timestamp": t,
                "speed_kmh": round(58 + (i % 6) * 2.5 - (i % 3) * 1.5, 1),
                "traffic_density_pct": round(52 + (i % 5) * 4.8 - (i % 2) * 3.0, 1),
                "collision_risk_score": 15 if i % 7 != 0 else (75 if i == 14 else 45),
                "safety_margin_m": round(35 - (i % 4) * 3.5, 1),
                "detected_objects_count": 5 + (i % 8)
            })

    def record_tick(self, speed: float, density: float, risk_score: int, objects_count: int, safety_margin: float):
        t = int(time.time())
        dt_str = datetime.fromtimestamp(t, timezone.utc).strftime("%H:%M:%S")
        self.time_series_data.append({
            "time": dt_str,
            "timestamp": t,
            "speed_kmh": round(speed, 1),
            "traffic_density_pct": round(density, 1),
            "collision_risk_score": risk_score,
            "safety_margin_m": round(safety_margin, 1),
            "detected_objects_count": objects_count
        })
        if len(self.time_series_data) > 30:
            self.time_series_data.pop(0)

    def record_detection(self, class_name: str):
        c = class_name.lower()
        if c in self.class_counts:
            self.class_counts[c] += 1
        else:
            self.class_counts[c] = 1
        self.total_objects_detected += 1
        self.total_frames_processed += 1

    def get_summary_metrics(self) -> Dict[str, Any]:
        speeds = [p["speed_kmh"] for p in self.time_series_data]
        avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else 60.0
        densities = [p["traffic_density_pct"] for p in self.time_series_data]
        avg_density = round(sum(densities) / len(densities), 1) if densities else 55.0

        return {
            "uptime_seconds": round(time.time() - self.start_time, 1),
            "total_frames_processed": self.total_frames_processed,
            "total_objects_detected": self.total_objects_detected,
            "average_simulated_speed_kmh": avg_speed,
            "average_traffic_density_pct": avg_density,
            "emergency_braking_events_count": self.total_aeb_activations,
            "collision_risk_warnings_count": self.total_collision_warnings,
            "object_class_breakdown": [
                {"name": "Cars", "count": self.class_counts.get("car", 0), "color": "#38bdf8"},
                {"name": "Trucks", "count": self.class_counts.get("truck", 0), "color": "#818cf8"},
                {"name": "Pedestrians", "count": self.class_counts.get("pedestrian", 0), "color": "#f87171"},
                {"name": "Buses", "count": self.class_counts.get("bus", 0), "color": "#fbbf24"},
                {"name": "Bicycles", "count": self.class_counts.get("bicycle", 0), "color": "#34d399"},
                {"name": "Motorcycles", "count": self.class_counts.get("motorcycle", 0), "color": "#c084fc"},
            ],
            "time_series": self.time_series_data
        }

    def generate_csv_report(self, events: List[Dict[str, Any]]) -> str:
        """
        Builds a comprehensive CSV string report for autonomous vehicle demonstration.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header info
        writer.writerow(["================================================================"])
        writer.writerow(["AUTONOMOUS VEHICLE & INTELLIGENT TRANSPORTATION AI DEMO REPORT"])
        writer.writerow(["Export Timestamp", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["System Status", "Operational (Demonstration Prototype)"])
        writer.writerow(["================================================================"])
        writer.writerow([])

        # Section 1: Summary Metrics
        summary = self.get_summary_metrics()
        writer.writerow(["--- EXECUTIVE SUMMARY METRICS ---"])
        writer.writerow(["Metric", "Value", "Unit / Notes"])
        writer.writerow(["Average Simulated Speed", summary["average_simulated_speed_kmh"], "km/h"])
        writer.writerow(["Average Traffic Density", summary["average_traffic_density_pct"], "%"])
        writer.writerow(["Total Objects Detected", summary["total_objects_detected"], "Perception detections"])
        writer.writerow(["Emergency Braking Activations (AEB)", summary["emergency_braking_events_count"], "Safety triggers"])
        writer.writerow(["Collision Risk Warnings", summary["collision_risk_warnings_count"], "Pre-collision alerts"])
        writer.writerow([])

        # Section 2: Object Classification Breakdown
        writer.writerow(["--- AI OBJECT DETECTION SUMMARY ---"])
        writer.writerow(["Class Name", "Count Detected", "Share of Total (%)"])
        total_objs = max(1, summary["total_objects_detected"])
        for item in summary["object_class_breakdown"]:
            pct = round((item["count"] / total_objs) * 100, 1)
            writer.writerow([item["name"], item["count"], f"{pct}%"])
        writer.writerow([])

        # Section 3: Telemetry History Time Series
        writer.writerow(["--- TIME SERIES TELEMETRY DATA ---"])
        writer.writerow(["Time (UTC)", "Speed (km/h)", "Traffic Density (%)", "Collision Risk Score", "Safety Margin (m)", "Detected Objects"])
        for row in self.time_series_data:
            writer.writerow([
                row["time"],
                row["speed_kmh"],
                row["traffic_density_pct"],
                row["collision_risk_score"],
                row["safety_margin_m"],
                row["detected_objects_count"]
            ])
        writer.writerow([])

        # Section 4: System Event Audit Log
        writer.writerow(["--- RECENT SYSTEM SAFETY EVENTS ---"])
        writer.writerow(["Timestamp", "Event Type", "Severity", "Message"])
        for ev in events:
            ev_time = datetime.fromtimestamp(ev.get("timestamp", time.time()), timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([ev_time, ev.get("type", "EVENT"), ev.get("severity", "info"), ev.get("message", "")])

        writer.writerow([])
        writer.writerow(["NOTICE: Academic / Prototype demonstration export. Not certified for road vehicle deployment."])
        
        return output.getvalue()

analytics_engine = AnalyticsEngine()
