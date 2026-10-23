# Real-Time AI Application: Autonomous Vehicles and Intelligent Transportation
> **Academic & College Project Demonstration Prototype**  
> *A full-stack intelligent transportation system featuring real-time vehicle kinematics, YOLOv8 computer vision perception, kinematic collision risk analysis, and smart city traffic signal optimization.*

---

## 🚀 System Architecture Overview

```
                          ┌──────────────────────────────────────────┐
                          │         React 19 + Vite Frontend         │
                          │   (Tailwind CSS v4 + Recharts + Leaflet) │
                          └────────────────────┬─────────────────────┘
                                               │
                               REST APIs & WebSockets (1Hz)
                                               │
                          ┌────────────────────▼─────────────────────┐
                          │          Python FastAPI Backend          │
                          │        (Asynchronous Event Loop)         │
                          └───────┬────────────┬─────────────┬───────┘
                                  │            │             │
        ┌─────────────────────────▼──┐  ┌──────▼──────┐  ┌───▼─────────────────────┐
        │     Perception Engine      │  │ Kinematics  │  │ Intelligent Traffic Hub │
        │  • YOLOv8 (ultralytics)    │  │ • TTC Model │  │ • Leaflet Map Engine    │
        │  • OpenCV CV Fallback      │  │ • Friction  │  │ • Webster Split Signals │
        │  • Road Agent Bounding Box │  │ • Auto-AEB  │  │ • Dynamic Detour Routes │
        └────────────────────────────┘  └─────────────┘  └─────────────────────────┘
```

---

## 🌟 Key Functional Features

### 1. 🏎️ Live Autonomous Telemetry Dashboard
- Displays dynamic vehicle speed, acceleration ($m/s^2$), steering angle, battery consumption, and odometer.
- Autonomous, Manual, and Emergency Mode toggling.
- Real-time leading obstacle distance and relative speed metrics.
- Multi-lane status (Left Express, Center Cruising, Right Exit).
- Live system audit event stream with WebSocket synchronization.
- Clearly labeled **Simulated Telemetry** banner for academic rigor.

### 2. 🎮 2D Visual Road Kinematics Simulator
- Interactive HTML5 canvas road simulator with 3 distinct lanes and moving road stripes proportional to velocity.
- Dynamic ego vehicle with active headlights, taillights, and sensor perception cone projection.
- Real-time dynamic obstacle injection (Pedestrians, Lead Sedans, Heavy Trucks).
- **Autonomous Emergency Braking (AEB)**: Decelerates at $-8.5\text{ m/s}^2$ automatically when collision risk becomes critical, coming to a standstill safely before impact.
- Manual lane change steering controls (Steer Left, Center, Steer Right).

### 3. 👁️ AI Computer Vision Object Detection
- Accepts user uploaded road camera photos and videos.
- Powered by pretrained **YOLOv8n** (PyTorch) with automatic graceful fallback to OpenCV contour/geometry detection.
- Detects cars, trucks, buses, pedestrians, cyclists, motorcycles, and traffic lights.
- Generates annotated bounding box images with confidence scores and danger level classification.
- One-click preset demo scenes (Highway Corridor & Urban Pedestrian Crossing).

### 4. ⚠️ Kinematic Collision Risk Prediction
- Mathematical model calculating Time-to-Collision ($\text{TTC} = d / v_{\text{rel}}$).
- Newtonian stopping distance breakdown:
  $$\text{Stopping Distance} = (v_{\text{ego}} \times t_{\text{reaction}}) + \frac{v_{\text{ego}}^2}{2 \mu g}$$
- Road friction coefficient selector: Dry Asphalt ($\mu=0.82$), Wet ($\mu=0.52$), Snow ($\mu=0.28$), Black Ice ($\mu=0.14$).
- Benchmark comparison between Autonomous AI reaction ($0.25\text{s}$) vs Human driver ($1.20\text{s}$).

### 5. 🚦 Intelligent Traffic Management & Signal Optimization
- Interactive Leaflet map displaying 5 smart city intersections with congestion heat indicators.
- Real-time queue length tracking and signal phase remaining seconds.
- Dynamic route planning comparing congested primary routes against AI recommended bypass corridors.
- **Adaptive Signal Optimization**: Simulates Webster's queue split algorithm to reallocate green time, reducing average vehicle queue delay by up to 43%.

### 6. 📊 Analytics, Event Logging & CSV Export
- Time-series Recharts graphs tracking vehicle speed, safety margin, and traffic density trends.
- Object classification distribution bar charts.
- Filterable system safety event audit table.
- **Instant CSV Export**: Generates a structured demonstration report ready for submission.

### 7. 🛡️ Responsible AI & Safety Framework
- Complete explainability breakdown detailing decision transparency, edge data privacy, and sensor fusion redundancy.
- False positive vs false negative mitigation strategies.
- Explicit prototype safety boundary disclaimer (non-certified for physical motor vehicles).

### 8. ⚙️ Automated Diagnostic Self-Test
- Single-click automated integration test suite validating backend API health, AI inference latency, kinematic physics calculations, and WebSocket connectivity.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Leaflet, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Uvicorn, WebSockets, Pydantic |
| **AI / Vision** | Ultralytics YOLOv8n (PyTorch), OpenCV, NumPy, Pillow |
| **Simulation** | HTML5 Canvas 2D Kinematics Engine, Webster Signal Model |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) |

---

## 📦 Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10 to v3.12 recommended)
- Git

### 1. Clone & Enter Repository
```bash
git clone <repo-url>
cd "AI project"
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
py -3.12 -m pip install -r requirements.txt
py -3.12 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend will be running at `http://127.0.0.1:8000` with Swagger Docs at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be running at `http://localhost:5173`.*

---

## 🎓 College Demonstration Script (Step-by-Step)

1. **Dashboard Overview (Tab 1):** Point out the real-time speedometer gauge, lane offset, and the dynamic leading obstacle clearance meter updating every second via WebSocket.
2. **Driving Simulator (Tab 2):**
   - Click **"Inject Pedestrian Hazard (22m)"**.
   - Show how the radar cone flashes red and **Autonomous Emergency Braking (AEB)** engages automatically, bringing the car to a safe stop without collision.
   - Steer between lanes using the "Steer Left" and "Steer Right" buttons.
3. **AI Object Detection (Tab 3):**
   - Click **"Highway Corridor"** or upload your own road photo.
   - Show the detected bounding boxes with confidence percentages and latency in milliseconds.
4. **Collision Risk Physics (Tab 4):**
   - Slide the Road Condition from **"Dry Asphalt"** to **"Black Ice"**.
   - Point out how stopping distance doubles and risk shifts from LOW to HIGH.
   - Toggle between **AI Autonomous (0.25s)** and **Human Driver (1.20s)** reaction times.
5. **Intelligent Traffic (Tab 5):**
   - Click on intersection markers on the Leaflet map to inspect queue lengths.
   - Click **"Optimize Traffic Signals"** and highlight the 40%+ delay reduction.
6. **Analytics & CSV Report (Tab 6):**
   - Review the time-series charts and click **"Export Demo Report (CSV)"** to instantly download the presentation data.
7. **Diagnostics & Responsible AI (Tabs 7 & 8):**
   - Run the automated self-diagnostic check to show 100% PASS across all subsystems.

---

## 🌐 Production Deployment Guide

### Deploying Frontend to Vercel
1. Set the root directory in Vercel to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`

### Deploying Backend to Render or Railway
1. Set root directory to `backend`.
2. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Python version: `3.12`

---

## ⚖️ Safety & Legal Notice
*This software is an educational prototype developed for computer science academic evaluation and demonstration purposes. It does not interface with physical automotive drive-by-wire or CAN-bus systems.*
