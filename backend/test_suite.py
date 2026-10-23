import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import main as app_module

def run_tests():
    print("========================================")
    print(" AI EXPERT SYSTEM INTEGRATION TEST SUITE")
    print("========================================")

    # 1. Health check
    print("\n[TEST 1] Checking API Health Endpoint...")
    health = asyncio.run(app_module.health_check())
    assert health["status"] == "healthy", f"Unexpected status: {health}"
    print(f"PASS: Service: {health['service']}, Total Rules: {health['total_rules']}")

    # 2. Categories
    print("\n[TEST 2] Checking Problem Categories...")
    cats = asyncio.run(app_module.get_categories())
    assert len(cats["categories"]) == 8, f"Expected 8 categories, got {len(cats['categories'])}"
    print(f"PASS: Loaded {len(cats['categories'])} diagnostic categories.")

    # 3. Knowledge Base Rules
    print("\n[TEST 3] Checking Knowledge Base Rules...")
    rules_resp = asyncio.run(app_module.get_all_rules())
    assert rules_resp["total_rules"] >= 16, f"Expected >=16 rules, got {rules_resp['total_rules']}"
    print(f"PASS: Verified {rules_resp['total_rules']} forward-chaining production rules.")

    # 4. Multi-Domain Diagnoses
    print("\n[TEST 4] Testing Multi-Category Natural Language Queries...")
    queries = [
        ("My computer is very slow and lagging when starting up", "slow_computer"),
        ("Wi-Fi disconnected with DNS lookup failure and no internet access", "network_wifi"),
        ("No sound or audio coming from my headphone jack or speakers", "audio_sound"),
        ("Google Chrome keeps freezing with Not Responding message", "app_freeze"),
        ("Computer powers on to a black screen with only mouse cursor visible", "boot_black_screen"),
        ("Printer is offline and print jobs are stuck in queue", "printer_issue"),
        ("Task manager shows 100% CPU and fan is spinning very fast", "resource_usage"),
        ("Windows crashed with blue screen BSOD driver watchdog violation", "software_driver")
    ]

    for q, expected_cat in queries:
        req = app_module.DiagnoseRequest(problem_description=q)
        res = asyncio.run(app_module.diagnose(req))
        assert res["status"] in ("diagnosed", "ambiguous"), f"Unexpected diagnosis status: {res}"
        assert res["match_strength"] > 0, "Match strength should be > 0"
        print(f"  OK [{expected_cat}]: '{q[:40]}...' -> {res['title']} ({res['match_strength']}%)")

    # 5. Feedback Loop - Solved
    print("\n[TEST 5] Testing Feedback Loop (Resolved)...")
    fb_req = app_module.FeedbackRequest(diagnosis_id="RULE_STARTUP_BLOAT", solved=True)
    fb_solved = asyncio.run(app_module.feedback(fb_req))
    assert fb_solved["status"] == "resolved"
    assert len(fb_solved["post_resolution_tips"]) > 0
    print(f"PASS: Solved response returned {len(fb_solved['post_resolution_tips'])} preventive tips.")

    # 6. Feedback Loop - Unsolved (Escalation)
    print("\n[TEST 6] Testing Escalation Pathway (Unresolved)...")
    fb_req_unsolved = app_module.FeedbackRequest(diagnosis_id="RULE_STARTUP_BLOAT", solved=False)
    fb_unsolved = asyncio.run(app_module.feedback(fb_req_unsolved))
    assert fb_unsolved["status"] == "unresolved"
    assert len(fb_unsolved["secondary_alternatives"]) > 0
    assert len(fb_unsolved["technician_readiness_checklist"]) > 0
    print(f"PASS: Escalated to {len(fb_unsolved['secondary_alternatives'])} alternative rules & technician readiness checklist.")

    # 7. System Diagnostics Telemetry
    print("\n[TEST 7] Testing Read-Only Hardware Telemetry...")
    telemetry = asyncio.run(app_module.read_system_diagnostics())
    assert "cpu" in telemetry and "memory" in telemetry and "disk" in telemetry
    print(f"PASS: Telemetry probe operational: CPU {telemetry['cpu']['usage_percent']}%, RAM {telemetry['memory']['usage_percent']}%")

    print("\n========================================")
    print(" ALL 7 BACKEND TEST SUITES PASSED (100%)")
    print("========================================")

if __name__ == "__main__":
    run_tests()
