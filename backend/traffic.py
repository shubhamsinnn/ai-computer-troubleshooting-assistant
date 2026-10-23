"""
Intelligent Traffic Management Engine
Simulates smart city intersections, density heatmaps, dynamic routing, and adaptive signal timing optimization.
"""
import time
import random
from typing import Dict, Any, List

class TrafficManager:
    def __init__(self):
        self.intersections = [
            {
                "id": "INT-101",
                "name": "Innovation Blvd & Grand Parkway",
                "lat": 37.7749,
                "lng": -122.4194,
                "density_pct": 78,
                "queue_vehicles": 31,
                "status": "Congested",
                "incident": None,
                "signal": {
                    "ns_green_s": 40,
                    "ew_green_s": 30,
                    "cycle_time_s": 75,
                    "active_phase": "NS_GREEN",
                    "time_remaining_s": 14,
                    "ai_optimized": False
                }
            },
            {
                "id": "INT-102",
                "name": "Tech Hub Expressway & 4th Avenue",
                "lat": 37.7833,
                "lng": -122.4167,
                "density_pct": 46,
                "queue_vehicles": 12,
                "status": "Moderate",
                "incident": None,
                "signal": {
                    "ns_green_s": 35,
                    "ew_green_s": 35,
                    "cycle_time_s": 75,
                    "active_phase": "EW_GREEN",
                    "time_remaining_s": 22,
                    "ai_optimized": False
                }
            },
            {
                "id": "INT-103",
                "name": "Autonomous Corridor & Silicon Way",
                "lat": 37.7690,
                "lng": -122.4280,
                "density_pct": 92,
                "queue_vehicles": 46,
                "status": "Severe Gridlock",
                "incident": "Stalled delivery van blocking Right Transit Lane",
                "signal": {
                    "ns_green_s": 30,
                    "ew_green_s": 30,
                    "cycle_time_s": 65,
                    "active_phase": "NS_GREEN",
                    "time_remaining_s": 8,
                    "ai_optimized": False
                }
            },
            {
                "id": "INT-104",
                "name": "Harbor Ring Road & Marina Blvd",
                "lat": 37.7885,
                "lng": -122.4050,
                "density_pct": 24,
                "queue_vehicles": 5,
                "status": "Free Flow",
                "incident": None,
                "signal": {
                    "ns_green_s": 45,
                    "ew_green_s": 20,
                    "cycle_time_s": 70,
                    "active_phase": "NS_GREEN",
                    "time_remaining_s": 31,
                    "ai_optimized": True
                }
            },
            {
                "id": "INT-105",
                "name": "University Way & Metro Circle",
                "lat": 37.7620,
                "lng": -122.4110,
                "density_pct": 63,
                "queue_vehicles": 19,
                "status": "Moderate Flow",
                "incident": None,
                "signal": {
                    "ns_green_s": 35,
                    "ew_green_s": 30,
                    "cycle_time_s": 70,
                    "active_phase": "EW_GREEN",
                    "time_remaining_s": 17,
                    "ai_optimized": False
                }
            }
        ]

        self.routes = [
            {
                "id": "route-primary",
                "name": "Corridor Alpha (Direct Arterial)",
                "distance_km": 8.4,
                "current_eta_min": 29,
                "free_flow_eta_min": 14,
                "delay_min": 15,
                "congestion_level": "Heavy (Bottleneck at INT-103)",
                "recommended": False,
                "color": "#ef4444",
                "waypoints": [
                    [37.7620, -122.4110],
                    [37.7690, -122.4280],
                    [37.7749, -122.4194],
                    [37.7833, -122.4167]
                ]
            },
            {
                "id": "route-alt-ai",
                "name": "AI Smart Bypass (Harbor Expressway)",
                "distance_km": 10.2,
                "current_eta_min": 16,
                "free_flow_eta_min": 13,
                "delay_min": 3,
                "congestion_level": "Optimal / Clear Flow",
                "recommended": True,
                "time_saved_min": 13,
                "emissions_saved_pct": 28,
                "color": "#10b981",
                "waypoints": [
                    [37.7620, -122.4110],
                    [37.7710, -122.3980],
                    [37.7885, -122.4050],
                    [37.7833, -122.4167]
                ]
            },
            {
                "id": "route-alt-2",
                "name": "Midtown Perimeter Ring",
                "distance_km": 9.3,
                "current_eta_min": 22,
                "free_flow_eta_min": 15,
                "delay_min": 7,
                "congestion_level": "Moderate",
                "recommended": False,
                "time_saved_min": 7,
                "emissions_saved_pct": 12,
                "color": "#f59e0b",
                "waypoints": [
                    [37.7620, -122.4110],
                    [37.7650, -122.4180],
                    [37.7780, -122.4220],
                    [37.7833, -122.4167]
                ]
            }
        ]

    def get_traffic_overview(self) -> Dict[str, Any]:
        avg_density = round(sum(i["density_pct"] for i in self.intersections) / len(self.intersections), 1)
        total_queued = sum(i["queue_vehicles"] for i in self.intersections)
        congested_count = sum(1 for i in self.intersections if i["density_pct"] >= 70)

        return {
            "disclaimer": "SAMPLE SIMULATED CITY TRAFFIC DATA (Not connected to municipal live feed)",
            "network_status": {
                "overall_density_pct": avg_density,
                "total_queued_vehicles": total_queued,
                "congested_intersections": congested_count,
                "total_intersections": len(self.intersections),
                "ai_optimization_active": any(i["signal"]["ai_optimized"] for i in self.intersections)
            },
            "intersections": self.intersections,
            "routes": self.routes
        }

    def optimize_signals(self) -> Dict[str, Any]:
        """
        Applies adaptive signal control algorithms (Webster-inspired queue-proportional split).
        """
        results = []
        total_delay_before = 0
        total_delay_after = 0

        for intersection in self.intersections:
            density = intersection["density_pct"]
            queue = intersection["queue_vehicles"]
            delay_before = queue * 2.8 # approx seconds delay per queued vehicle
            total_delay_before += delay_before

            # Recalculate signal allocation based on density ratio
            ns_ratio = min(0.75, max(0.25, density / 100.0))
            cycle = 80
            new_ns = int(cycle * ns_ratio)
            new_ew = cycle - new_ns - 6 # 6s yellow/all-red clearance
            
            intersection["signal"]["ns_green_s"] = new_ns
            intersection["signal"]["ew_green_s"] = new_ew
            intersection["signal"]["cycle_time_s"] = cycle
            intersection["signal"]["ai_optimized"] = True
            
            # Post-optimization improvement simulation
            improved_queue = max(3, int(queue * (0.58 if density > 60 else 0.8)))
            delay_after = improved_queue * 2.1
            total_delay_after += delay_after
            intersection["queue_vehicles"] = improved_queue
            intersection["density_pct"] = max(20, int(density * 0.72))
            intersection["status"] = "AI Optimized Flow" if intersection["density_pct"] < 65 else "Optimized (High Demand)"

            results.append({
                "id": intersection["id"],
                "name": intersection["name"],
                "new_ns_green": new_ns,
                "new_ew_green": new_ew,
                "queue_reduction": queue - improved_queue,
                "delay_saved_pct": round(((delay_before - delay_after) / max(1, delay_before)) * 100, 1)
            })

        overall_reduction = round(((total_delay_before - total_delay_after) / max(1, total_delay_before)) * 100, 1)
        
        return {
            "success": True,
            "message": "AI Adaptive Signal Timing Applied across all corridors.",
            "overall_delay_reduction_pct": overall_reduction,
            "avg_wait_time_before_s": round(total_delay_before / len(self.intersections), 1),
            "avg_wait_time_after_s": round(total_delay_after / len(self.intersections), 1),
            "optimized_intersections": results
        }

traffic_manager = TrafficManager()
