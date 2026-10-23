"""
Read-Only System Diagnostic Engine
Collects local hardware telemetry (CPU, RAM, Disk, Network) with strict privacy safeguards.
Never accesses user files, credentials, or personal telemetry.
"""
import time
import socket
from typing import Dict, Any, List

def get_system_diagnostics() -> Dict[str, Any]:
    """
    Safely retrieves read-only hardware diagnostic metrics using psutil.
    Falls back gracefully if running in a restricted sandbox.
    """
    metrics = {
        "timestamp": time.time(),
        "privacy_notice": "READ-ONLY HARDWARE TELEMETRY. No passwords, credentials, or personal file contents are accessed or stored.",
        "cpu": {
            "usage_percent": 0.0,
            "core_count": 4,
            "status": "NORMAL"
        },
        "memory": {
            "total_gb": 0.0,
            "used_gb": 0.0,
            "available_gb": 0.0,
            "usage_percent": 0.0,
            "status": "NORMAL"
        },
        "disk": {
            "total_gb": 0.0,
            "free_gb": 0.0,
            "usage_percent": 0.0,
            "status": "NORMAL"
        },
        "network": {
            "connected": True,
            "gateway_latency_ms": 15.0,
            "status": "ONLINE"
        },
        "top_processes": [],
        "manual_diagnostic_guide": [
            {
                "tool": "Windows Task Manager",
                "shortcut": "Ctrl + Shift + Esc",
                "purpose": "View real-time CPU, RAM, and Disk column percentages to spot runaway apps."
            },
            {
                "tool": "Resource Monitor",
                "shortcut": "Win + R -> resmon",
                "purpose": "Inspect detailed per-process disk response times and network TCP connections."
            },
            {
                "tool": "Network Latency Test",
                "shortcut": "Command Prompt -> ping 8.8.8.8 -n 4",
                "purpose": "Verify local router-to-internet packet transmission and identify packet loss."
            },
            {
                "tool": "Storage SMART Health",
                "shortcut": "PowerShell -> Get-PhysicalDisk | Select FriendlyName, HealthStatus",
                "purpose": "Query firmware drive controller for impending mechanical or SSD wear failure."
            }
        ]
    }

    try:
        import psutil
        
        # 1. CPU
        cpu_pct = psutil.cpu_percent(interval=0.1)
        core_count = psutil.cpu_count(logical=True) or 4
        metrics["cpu"]["usage_percent"] = round(cpu_pct, 1)
        metrics["cpu"]["core_count"] = core_count
        metrics["cpu"]["status"] = "CRITICAL (Bottleneck)" if cpu_pct > 85 else ("ELEVATED" if cpu_pct > 60 else "OPTIMAL")

        # 2. Memory (RAM)
        vmem = psutil.virtual_memory()
        metrics["memory"]["total_gb"] = round(vmem.total / (1024 ** 3), 1)
        metrics["memory"]["used_gb"] = round(vmem.used / (1024 ** 3), 1)
        metrics["memory"]["available_gb"] = round(vmem.available / (1024 ** 3), 1)
        metrics["memory"]["usage_percent"] = round(vmem.percent, 1)
        metrics["memory"]["status"] = "CRITICAL (Low RAM)" if vmem.percent > 90 else ("HIGH" if vmem.percent > 75 else "OPTIMAL")

        # 3. Disk Usage (Primary C: drive)
        try:
            disk_path = "C:\\" if "\\" in socket.gethostname() or True else "/"
            disk = psutil.disk_usage(disk_path)
            metrics["disk"]["total_gb"] = round(disk.total / (1024 ** 3), 1)
            metrics["disk"]["free_gb"] = round(disk.free / (1024 ** 3), 1)
            metrics["disk"]["usage_percent"] = round(disk.percent, 1)
            metrics["disk"]["status"] = "CRITICAL (<10GB Free)" if (disk.free / (1024 ** 3)) < 10 else ("WARN" if disk.percent > 85 else "HEALTHY")
        except Exception:
            pass

        # 4. Network Gateway Ping latency
        t0 = time.time()
        try:
            s = socket.create_connection(("8.8.8.8", 53), timeout=1.5)
            s.close()
            latency = round((time.time() - t0) * 1000, 1)
            metrics["network"]["connected"] = True
            metrics["network"]["gateway_latency_ms"] = latency
            metrics["network"]["status"] = "CONNECTED (Low Latency)" if latency < 50 else "CONNECTED (High Latency)"
        except Exception:
            metrics["network"]["connected"] = False
            metrics["network"]["gateway_latency_ms"] = None
            metrics["network"]["status"] = "OFFLINE (No Route to Gateway)"

        # 5. Top 5 active process names (strictly non-invasive: process name and memory percent only)
        procs = []
        for p in psutil.process_iter(['name', 'cpu_percent', 'memory_percent']):
            try:
                name = p.info.get('name')
                if name and name.lower() not in ['system idle process', 'idle']:
                    procs.append({
                        "name": name,
                        "cpu_percent": round(p.info.get('cpu_percent') or 0.0, 1),
                        "memory_percent": round(p.info.get('memory_percent') or 0.0, 1)
                    })
            except Exception:
                continue

        procs.sort(key=lambda x: x["memory_percent"], reverse=True)
        metrics["top_processes"] = procs[:5]

    except Exception as e:
        metrics["error"] = f"psutil diagnostic probe limited: {e}"

    return metrics
