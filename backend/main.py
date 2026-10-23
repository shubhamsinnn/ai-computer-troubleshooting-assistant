"""
FastAPI Backend Entrypoint for Autonomous Vehicles & Intelligent Transportation AI
"""
import asyncio
import io
import time
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from config import CORS_ORIGINS, HOST, PORT
from collision import calculate_collision_risk
from telemetry import telemetry_engine
from traffic import traffic_manager
from analytics import analytics_engine
from detector import init_model, detect_objects_in_image, generate_sample_road_image, MODEL_STATUS, MODEL_TYPE

# Connected WebSockets pool
active_connections: List[WebSocket] = []

async def simulation_loop():
    """
    Background simulation ticker executing at 1Hz.
    Updates vehicle kinematics, collision checks, analytics, and broadcasts via WebSockets.
    """
    while True:
        try:
            snapshot = telemetry_engine.step(1.0)
            
            # Record in analytics
            analytics_engine.record_tick(
                speed=snapshot["vehicle"]["speed_kmh"],
                density=traffic_manager.get_traffic_overview()["network_status"]["overall_density_pct"],
                risk_score=snapshot["safety"]["risk_score"],
                objects_count=1 if snapshot["perception"]["obstacle_distance_m"] < 80 else 0,
                safety_margin=snapshot["safety"]["safety_margin_m"]
            )

            # Broadcast to all connected WebSockets
            if active_connections:
                payload = {
                    "type": "TELEMETRY_UPDATE",
                    "data": snapshot
                }
                dead = []
                for ws in active_connections:
                    try:
                        await ws.send_json(payload)
                    except Exception:
                        dead.append(ws)
                for ws in dead:
                    if ws in active_connections:
                        active_connections.remove(ws)

        except Exception as e:
            print(f"[SimLoop Error]: {e}")
        
        await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize AI model and start background simulation loop
    init_model()
    sim_task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title="Autonomous Vehicles & Intelligent Transportation AI API",
    description="Real-Time AI Telemetry, Computer Vision Perception, Collision Risk & Traffic Optimization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local React Vite & deployment origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------
class CollisionRiskRequest(BaseModel):
    vehicle_speed_kmh: float = Field(..., ge=0, le=250, description="Ego vehicle speed in km/h")
    obstacle_distance_m: float = Field(..., ge=0.5, le=300, description="Clearance to obstacle ahead in meters")
    relative_speed_kmh: float = Field(..., ge=-100, le=150, description="Relative closing speed (v_ego - v_target)")
    road_condition: str = Field("dry", description="Road surface condition: dry, wet, snowy, icy")
    reaction_time_s: float = Field(0.35, ge=0.1, le=2.5, description="Reaction latency in seconds")
    obstacle_type: str = Field("car", description="Obstacle classification label")

class TelemetryControlRequest(BaseModel):
    mode: Optional[str] = None # Autonomous, Manual, Emergency
    target_speed_kmh: Optional[float] = None
    road_condition: Optional[str] = None
    spawn_obstacle_type: Optional[str] = None
    obstacle_distance_m: Optional[float] = None
    relative_speed_kmh: Optional[float] = None

# ----------------- API ROUTES -----------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "system": "Autonomous Transportation AI Backend",
        "timestamp": time.time(),
        "ai_model": {
            "type": MODEL_TYPE,
            "status": MODEL_STATUS
        },
        "websockets_active": len(active_connections)
    }

@app.get("/api/telemetry/current")
async def get_current_telemetry():
    """Returns the latest vehicle telemetry snapshot."""
    return telemetry_engine.get_telemetry_snapshot()

@app.post("/api/telemetry/control")
async def control_telemetry(payload: TelemetryControlRequest):
    """Updates vehicle control inputs, road condition, or triggers obstacles."""
    if payload.mode:
        telemetry_engine.set_mode(payload.mode)
    if payload.target_speed_kmh is not None:
        telemetry_engine.set_target_speed(payload.target_speed_kmh)
    if payload.road_condition:
        telemetry_engine.set_road_condition(payload.road_condition)
    if payload.spawn_obstacle_type:
        dist = payload.obstacle_distance_m if payload.obstacle_distance_m is not None else 28.0
        rel = payload.relative_speed_kmh if payload.relative_speed_kmh is not None else 16.0
        telemetry_engine.spawn_obstacle(payload.spawn_obstacle_type, dist, rel)
    
    return {"success": True, "telemetry": telemetry_engine.get_telemetry_snapshot()}

@app.post("/api/telemetry/reset")
async def reset_simulation():
    """Restores baseline nominal parameters for simulation."""
    telemetry_engine.reset_simulation()
    return {"success": True, "message": "Simulation reset successfully."}

@app.post("/api/telemetry/brake")
async def emergency_brake():
    """Triggers immediate emergency stop."""
    telemetry_engine.trigger_emergency_brake()
    return {"success": True, "message": "Autonomous Emergency Braking engaged."}

@app.post("/api/collision/calculate")
async def calculate_risk(req: CollisionRiskRequest):
    """Calculates Time-To-Collision (TTC), stopping distance and safe advisory."""
    return calculate_collision_risk(
        vehicle_speed_kmh=req.vehicle_speed_kmh,
        obstacle_distance_m=req.obstacle_distance_m,
        relative_speed_kmh=req.relative_speed_kmh,
        road_condition=req.road_condition,
        reaction_time_s=req.reaction_time_s,
        obstacle_type=req.obstacle_type
    )

@app.post("/api/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.35)
):
    """
    Accepts an uploaded road camera image and returns detections,
    bounding boxes, and an annotated image.
    """
    try:
        content = await file.read()
        res = detect_objects_in_image(content, confidence_threshold=confidence)
        # Log detected classes in analytics
        for d in res["detections"]:
            analytics_engine.record_detection(d["class_name"])
        return res
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/api/detect/sample")
async def detect_sample(
    scene: str = Query("highway"),
    confidence: float = Query(0.35)
):
    """
    Generates and analyzes a synthetic road camera frame for quick demonstration.
    """
    img_bytes = generate_sample_road_image(scene)
    res = detect_objects_in_image(img_bytes, confidence_threshold=confidence)
    for d in res["detections"]:
        analytics_engine.record_detection(d["class_name"])
    return res

@app.get("/api/traffic/map-data")
async def get_traffic_data():
    """Returns sample smart city intersections, queue lengths and alternate routes."""
    return traffic_manager.get_traffic_overview()

@app.post("/api/traffic/optimize-signals")
async def optimize_traffic_signals():
    """Triggers AI adaptive signal timing calculation."""
    return traffic_manager.optimize_signals()

@app.get("/api/analytics/summary")
async def get_analytics_summary():
    """Returns aggregated performance metrics, object counts, and time series history."""
    return analytics_engine.get_summary_metrics()

@app.get("/api/reports/export-csv")
async def export_report():
    """Generates and downloads demonstration report as CSV."""
    csv_content = analytics_engine.generate_csv_report(telemetry_engine.events)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=autonomous_transport_ai_report.csv"}
    )

# ----------------- WEBSOCKET REAL-TIME ENDPOINT -----------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Send initial snapshot immediately
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "data": telemetry_engine.get_telemetry_snapshot()
        })
        while True:
            # Listen for client control commands over WebSocket
            client_msg = await websocket.receive_json()
            cmd_type = client_msg.get("action")
            if cmd_type == "SET_SPEED":
                telemetry_engine.set_target_speed(client_msg.get("speed", 60.0))
            elif cmd_type == "SET_MODE":
                telemetry_engine.set_mode(client_msg.get("mode", "Autonomous"))
            elif cmd_type == "SPAWN_OBSTACLE":
                telemetry_engine.spawn_obstacle(
                    client_msg.get("type", "Pedestrian"),
                    client_msg.get("distance", 25.0),
                    client_msg.get("rel_speed", 15.0)
                )
            elif cmd_type == "EMERGENCY_BRAKE":
                telemetry_engine.trigger_emergency_brake()
            elif cmd_type == "RESET":
                telemetry_engine.reset_simulation()
            
            # Immediately send updated state back
            await websocket.send_json({
                "type": "TELEMETRY_UPDATE",
                "data": telemetry_engine.get_telemetry_snapshot()
            })
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)
    except Exception as e:
        print(f"[WebSocket Exception]: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
