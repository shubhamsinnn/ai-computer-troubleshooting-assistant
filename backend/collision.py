"""
Collision Risk Prediction and Vehicle Dynamics Physics Engine
Calculates Time-To-Collision (TTC), dynamic stopping distance, friction factors, and risk classifications.
"""
from typing import Dict, Any, Optional

ROAD_FRICTION = {
    "dry": {"mu": 0.82, "label": "Dry Asphalt (Optimal Traction)"},
    "wet": {"mu": 0.52, "label": "Wet Road (Reduced Friction)"},
    "snowy": {"mu": 0.28, "label": "Snow Covered (Low Grip)"},
    "icy": {"mu": 0.14, "label": "Black Ice / Freezing (Extreme Hazard)"},
}

GRAVITY = 9.81 # m/s^2

def calculate_collision_risk(
    vehicle_speed_kmh: float,
    obstacle_distance_m: float,
    relative_speed_kmh: float,
    road_condition: str = "dry",
    reaction_time_s: float = 0.35, # AI Autonomous reaction time (approx 350ms vs 1.2s human)
    obstacle_type: str = "car"
) -> Dict[str, Any]:
    """
    Computes time-to-collision and safety parameters based on vehicle kinematics.
    """
    v_speed = max(0.0, float(vehicle_speed_kmh))
    dist = max(0.1, float(obstacle_distance_m))
    rel_speed = float(relative_speed_kmh)
    
    road_data = ROAD_FRICTION.get(road_condition.lower(), ROAD_FRICTION["dry"])
    mu = road_data["mu"]

    # Kinematics conversions (km/h -> m/s)
    v_ego_ms = v_speed / 3.6
    v_rel_ms = rel_speed / 3.6

    # 1. Time-to-Collision (TTC)
    if v_rel_ms > 0.05:
        ttc_seconds = round(dist / v_rel_ms, 2)
    elif v_rel_ms < -0.05:
        # Obstacle pulling away
        ttc_seconds = 999.0
    else:
        # Equal speed
        ttc_seconds = 999.0 if dist > 20 else round(dist / max(0.1, v_ego_ms), 2)

    # 2. Stopping Distance Calculation:
    # d_reaction = v_ego * t_reaction
    d_reaction = v_ego_ms * reaction_time_s
    # d_braking = v_ego^2 / (2 * mu * g)
    d_braking = (v_ego_ms ** 2) / (2 * mu * GRAVITY)
    total_stopping_distance = round(d_reaction + d_braking, 1)

    # 3. Safety Margin (Distance minus stopping distance)
    safety_margin = round(dist - total_stopping_distance, 1)

    # 4. Risk Classification Logic
    if dist < 4.0 or ttc_seconds < 2.2 or safety_margin < -5.0:
        risk_level = "HIGH"
        risk_color = "#ef4444"
        risk_score = 90 + min(10, int((2.2 - min(2.2, ttc_seconds)) * 4.5))
        action = "CRITICAL: Immediate Autonomous Emergency Braking (AEB) engagement required. Decelerate at maximum limit (-8.5 m/s²). Prepare lane evasion if path clear."
        explanation = f"Critical proximity hazard: Stopping distance ({total_stopping_distance}m) exceeds available clearance ({dist}m) under {road_data['label']}. TTC is {ttc_seconds}s."
        emergency_brake_recommended = True
    elif ttc_seconds < 4.2 or safety_margin < 8.0:
        risk_level = "MEDIUM"
        risk_color = "#f59e0b"
        risk_score = 55 + min(25, int((4.2 - min(4.2, ttc_seconds)) * 12))
        action = "CAUTION: Disengage acceleration cruise. Initiate predictive regenerative braking (-3.2 m/s²). Increase headway buffer to >40 meters."
        explanation = f"Elevated risk: Closing velocity of {rel_speed:.1f} km/h narrows safety margin to {safety_margin}m. Caution advised for {obstacle_type} ahead."
        emergency_brake_recommended = False
    else:
        risk_level = "LOW"
        risk_color = "#10b981"
        risk_score = max(5, int(15 - min(10, safety_margin * 0.2)))
        action = "NOMINAL: Safe following distance maintained. Trajectory clear. Adaptive Cruise Control active at target velocity."
        explanation = f"Normal cruising conditions: Safety margin is +{safety_margin}m. Traction coefficient ({mu}) sufficient for smooth braking."
        emergency_brake_recommended = False

    return {
        "inputs": {
            "vehicle_speed_kmh": v_speed,
            "obstacle_distance_m": dist,
            "relative_speed_kmh": rel_speed,
            "road_condition": road_condition,
            "obstacle_type": obstacle_type,
            "reaction_time_s": reaction_time_s,
        },
        "metrics": {
            "time_to_collision_s": ttc_seconds if ttc_seconds < 900 else None,
            "time_to_collision_display": f"{ttc_seconds:.1f}s" if ttc_seconds < 900 else "Clear (>10s)",
            "reaction_distance_m": round(d_reaction, 1),
            "braking_distance_m": round(d_braking, 1),
            "total_stopping_distance_m": total_stopping_distance,
            "safety_margin_m": safety_margin,
            "friction_coefficient": mu,
            "road_condition_label": road_data["label"],
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_color": risk_color,
            "emergency_brake_recommended": emergency_brake_recommended
        },
        "recommendation": {
            "action": action,
            "explanation": explanation,
            "throttle_override": 0.0 if risk_level == "HIGH" else (0.4 if risk_level == "MEDIUM" else 1.0)
        },
        "disclaimer": "Academic & Prototype Demonstration System: Kinematics model uses standard ISO Newtonian approximations. Not rated for real automotive safety critical actuation."
    }
