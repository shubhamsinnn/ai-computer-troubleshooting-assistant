# AI-Based Computer Troubleshooting Assistant
> **Academic & AI Laboratory Project Demonstration**  
> *A full-stack, rule-based expert system for intelligent computer diagnostics, root-cause reasoning, and step-by-step interactive troubleshooting.*

---

## 🚀 System Architecture Overview

```
                          ┌──────────────────────────────────────────┐
                          │         React 19 + Vite Frontend         │
                          │   (Tailwind CSS + Lucide + IT UI)        │
                          └────────────────────┬─────────────────────┘
                                               │
                                REST APIs (Hybrid Cloud Fallback)
                                               │
                          ┌────────────────────▼─────────────────────┐
                          │          Python FastAPI Backend          │
                          │     (Rule-Based Inference Engine)        │
                          └───────┬────────────┬─────────────┬───────┘
                                  │            │             │
        ┌─────────────────────────▼──┐  ┌──────▼──────┐  ┌───▼─────────────────────┐
        │   Natural Language Symptom │  │  Production │  │  Safe Hardware System   │
        │     Extraction & N-Grams   │  │  Rules (KB) │  │    Telemetry & Probes   │
        │  • Tokenization & Lexicon  │  │  • Antecedent│  │  • CPU, RAM, & Disk %  │
        │  • Negation Detection      │  │  • Confidence│  │  • Ping Latency Checks │
        │  • Synonym Normalization   │  │  • Reasoning │  │  • Safe Read-Only Mode │
        └────────────────────────────┘  └─────────────┘  └─────────────────────────┘
```

---

## 🌟 Key Functional Features

### 1. 🔍 Natural Language Symptom Extraction
- Accepts user problem descriptions in everyday natural language (e.g., *"My computer is lagging and Disk usage is 100%"* or *"Wi-Fi says DNS server not found and no internet"*).
- Intelligent n-gram tokenization and symptom lexicon mapping covering 8 core IT problem domains.
- Contextual negation detection (distinguishes *"sound not working"* from *"sound is not an issue"*).

### 2. 🧠 Forward-Chaining Rule-Based Expert System
- **Knowledge Representation**: Modular production rules (`IF symptoms THEN root cause & remediation checklist`).
- **Data-Driven Deduction**: Evaluates extracted symptoms against rule antecedents, calculates match strength percentage, and ranks candidate diagnoses.
- **Explainable AI (XAI)**: Generates step-by-step reasoning chains explaining *why* a particular diagnosis was selected and how symptoms contributed to the conclusion.
- **Ambiguity & Dynamic Follow-up Questions**: When confidence is between 50% and 75%, asks targeted clarifying questions to narrow down root causes.

### 3. 🛠️ Tiered, Interactive Solution Checklists
- Sequenced from safest and simplest (e.g., software toggle / process restart) to advanced (e.g., driver reinstallation, hardware reseating).
- Interactive checkboxes with instant progress tracking.
- Safety warnings and cautionary alerts for sensitive troubleshooting steps (BIOS, registry, power supply).

### 4. 🔄 Resolution Verification & Escalation Pathways
- Solved / Unsolved feedback loop on every diagnosis.
- **Solved**: Provides post-resolution preventive maintenance tips (restore points, update hygiene, disk maintenance).
- **Unresolved**: Provides secondary alternative diagnoses and a comprehensive **Technician Readiness Checklist** with diagnostic data for physical bench support.

### 5. 💻 Safe Hardware System Telemetry & Diagnostics
- Integrated read-only hardware telemetry measuring real-time CPU, RAM, Disk usage, and gateway network latency.
- Top resource-consuming processes breakdown.
- Built-in manual diagnostic cheat sheet (shortcuts for Task Manager, Resource Monitor, Ping test, and SMART storage check).

### 6. 🌐 Hybrid Cloud Architecture
- Frontend deployed on Vercel with embedded knowledge base and forward-chaining inference fallback.
- Operates 100% reliably in zero-downtime standalone mode, while automatically connecting to the Python FastAPI backend when available.

---

## 📋 Supported Problem Categories

| Category | Typical Symptoms | Representative Root Causes |
|---|---|---|
| **Slow Computer / Lag** | High boot time, unresponsiveness, slow apps | Startup app bloat, Background indexing thrashing |
| **Wi-Fi & Internet** | Disconnected, DNS error, limited connectivity | IP stack corruption, DNS cache stall, DHCP lease |
| **Audio & Sound** | No sound, muted device, crackling audio | Disabled default playback device, driver conflict |
| **App Freezing** | Not Responding, hung processes, spinning wheel | Memory leak, corrupted app cache, CPU pegging |
| **Boot & Black Screen** | Black screen, cursor only, POST beep codes | Explorer.exe crash, graphics driver hang, boot loop |
| **Printer Issues** | Printer offline, print spooler queue stuck | Spooler service hung, port misconfiguration |
| **High CPU / RAM / Disk** | 100% disk usage, fans loud, low memory | SysMain/Search loop, runaway background tasks |
| **Software & Drivers** | BSOD crash, driver exclamation mark in DevMgr | Incompatible driver update, corrupted system files |

---

## 🛠️ Local Setup and Installation

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`.  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🧪 Testing the Expert System

### Automated Backend Tests
```bash
# Run backend import and rule verification
python -c "import backend.main as m; print('Total Rules:', len(m.RULES))"

# Test forward-chaining diagnosis
python -c "import backend.main as m; res = m.diagnose_problem('My computer is very slow with 100% disk usage'); print(res['title'], '->', res['match_strength'], '%')"
```

### Production Build Verification
```bash
cd frontend
npm run build
```

---

## 🚀 Deployment

- **Frontend**: Deployed to Vercel via Vite static export.
- **Backend**: Can be hosted on Render, Railway, AWS ECS, or local server.
