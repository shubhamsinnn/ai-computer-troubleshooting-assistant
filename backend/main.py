"""
FastAPI Backend for AI-Based Computer Troubleshooting Assistant
Implements expert system endpoints, diagnostic probes, and feedback loops.
"""
import time
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from knowledge_base import CATEGORIES, RULES
from inference_engine import diagnose_problem
from diagnostics import get_system_diagnostics

app = FastAPI(
    title="AI-Based Computer Troubleshooting Assistant API",
    description="Rule-Based Expert System for Intelligent IT Diagnostics & Resolution",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------
class DiagnoseRequest(BaseModel):
    problem_description: str = Field(..., min_length=2, description="Natural language problem description")
    answers: Optional[Dict[str, int]] = Field(default_factory=dict, description="Answers to follow-up questions")
    active_rule_id: Optional[str] = Field(None, description="Force a specific rule selection from alternatives")

class FeedbackRequest(BaseModel):
    diagnosis_id: str = Field(..., description="The ID of the diagnosis rule")
    solved: bool = Field(..., description="Whether the troubleshooting steps solved the issue")
    step_completed: Optional[int] = Field(None, description="Index of the last step executed")

# ----------------- API ROUTES -----------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Computer Troubleshooting Assistant",
        "version": "2.0.0",
        "timestamp": time.time(),
        "total_rules": len(RULES),
        "total_categories": len(CATEGORIES)
    }

@app.get("/api/categories")
async def get_categories():
    """
    Returns supported computer problem categories along with quick-select natural language prompts.
    """
    examples = {
        "slow_computer": "My computer is extremely slow and lagging, especially when I boot up in the morning.",
        "network_wifi": "Wi-Fi is disconnected and websites say server not found or DNS error.",
        "audio_sound": "There is no sound coming from my laptop speakers or headphones.",
        "app_freeze": "Google Chrome and other apps freeze and show Not Responding constantly.",
        "boot_black_screen": "When I turn on my computer, it shows a black screen with only the mouse cursor visible.",
        "printer_issue": "My printer says offline and print jobs get stuck in the print spooler queue.",
        "resource_usage": "Task Manager shows 100% CPU and RAM usage, and my laptop fans are spinning very loud.",
        "software_driver": "Windows crashed with a blue screen (BSOD) driver error after a recent update."
    }

    return {
        "categories": [
            {
                "id": cat_id,
                "label": label,
                "sample_query": examples.get(cat_id, "")
            }
            for cat_id, label in CATEGORIES.items()
        ]
    }

@app.post("/api/troubleshoot/diagnose")
async def diagnose(req: DiagnoseRequest):
    """
    Evaluates the user's natural language problem description against the Knowledge Base
    using the forward-chaining inference engine.
    """
    res = diagnose_problem(
        problem_description=req.problem_description,
        user_answers=req.answers,
        active_rule_id=req.active_rule_id
    )
    return res

@app.post("/api/troubleshoot/feedback")
async def feedback(req: FeedbackRequest):
    """
    Handles Solved / Not Solved feedback.
    Provides follow-up maintenance advice if resolved, or escalation steps if unresolved.
    """
    # Find matching rule
    matching_rule = next((r for r in RULES if r["id"] == req.diagnosis_id), None)
    
    if req.solved:
        return {
            "status": "resolved",
            "message": "Problem marked as resolved! System stability restored.",
            "post_resolution_tips": [
                "Create a Windows System Restore point now so you can roll back if issues return.",
                "Keep Windows and device drivers updated through official manufacturer channels.",
                "Avoid installing untrusted driver-updater or registry-cleaner utilities.",
                "Perform regular monthly disk cleanup and reboot your system at least weekly."
            ]
        }
    else:
        # Not solved: offer secondary diagnoses or technician escalation
        alt_rules = [
            {"id": r["id"], "title": r["title"], "cause": r["cause"]}
            for r in RULES
            if r["category"] == (matching_rule["category"] if matching_rule else "slow_computer") and r["id"] != req.diagnosis_id
        ]
        return {
            "status": "unresolved",
            "message": "Initial troubleshooting checklist did not resolve the symptom. Escalating diagnosis.",
            "secondary_alternatives": alt_rules,
            "escalation_guide": matching_rule.get("escalation") if matching_rule else "Seek certified technician assistance.",
            "technician_readiness_checklist": [
                f"Rule Tested: {matching_rule['title'] if matching_rule else req.diagnosis_id}",
                "Note down any specific blue screen stop codes, error dialog text, or flashing LED blink codes.",
                "Back up critical documents to an external USB drive or cloud storage before handing device to a technician.",
                "Ensure AC power adapter is brought along when submitting a laptop for bench diagnostics."
            ]
        }

@app.get("/api/diagnostics/system")
async def read_system_diagnostics():
    """
    Retrieves safe, read-only hardware diagnostic telemetry (CPU, RAM, Disk, Network ping).
    """
    return get_system_diagnostics()

@app.get("/api/knowledge-base/rules")
async def get_all_rules():
    """
    Returns full Knowledge Base rules for inspection and college laboratory viva presentation.
    """
    return {
        "engine_architecture": "Forward-Chaining Rule-Based Expert System",
        "total_rules": len(RULES),
        "categories": CATEGORIES,
        "rules": [
            {
                "id": r["id"],
                "category": r["category"],
                "title": r["title"],
                "required_symptoms": r["required_symptoms"],
                "optional_symptoms": r.get("optional_symptoms", []),
                "cause": r["cause"],
                "confidence_base": r["confidence_base"],
                "step_count": len(r["steps"])
            }
            for r in RULES
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
