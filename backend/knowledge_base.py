"""
AI-Based Computer Troubleshooting Assistant Knowledge Base
Contains domain rules, symptom signatures, inference weights, and tiered resolution steps.
"""

CATEGORIES = {
    "slow_computer": "Slow computer or lagging system",
    "network_wifi": "Wi-Fi or internet not working",
    "audio_sound": "No sound or audio problems",
    "app_freeze": "Applications freezing or not responding",
    "boot_black_screen": "Computer not starting or black screen",
    "printer_issue": "Printer not detected or spooler errors",
    "resource_usage": "High CPU, RAM or disk usage",
    "software_driver": "Common software and driver problems"
}

# Symptom keywords mapping for Natural Language Symptom Extraction
SYMPTOM_LEXICON = {
    "system_lag": ["slow", "lag", "lagging", "sluggish", "unresponsive", "taking forever", "crawling", "delayed", "slowdown"],
    "boot_slow": ["slow boot", "slow startup", "takes long to boot", "long startup", "slow restart"],
    "disk_100_percent": ["100% disk", "100 disk", "disk full", "disk thrashing", "hard drive buzzing", "disk usage high"],
    "too_many_startup_apps": ["startup apps", "programs on startup", "background apps", "autostart", "too many programs"],
    "thermal_throttling": ["fan loud", "fans spinning fast", "laptop hot", "overheating", "loud fan", "thermal", "heating up"],
    
    "no_internet": ["no internet", "cannot connect", "no connection", "offline", "not connecting", "network down", "no access"],
    "wifi_disconnected": ["wifi disconnected", "wifi dropping", "wifi not working", "wifi keeps disconnecting", "wireless issue"],
    "wifi_icon_missing": ["no wifi icon", "wifi icon gone", "airplane mode stuck", "no wireless adapter", "wifi disappeared"],
    "dns_failure": ["dns error", "dns_probe_finished", "server not found", "page cannot be displayed", "dns not resolving"],
    "limited_connectivity": ["limited connection", "no internet secured", "yellow exclamation wifi", "unidentified network"],
    
    "no_audio": ["no sound", "no audio", "cannot hear", "silent", "audio dead", "sound not working", "speakers not working"],
    "audio_muted": ["muted", "mute icon", "volume zero", "cannot unmute"],
    "wrong_output_device": ["wrong speaker", "wrong device", "headphones not detected", "earphones not working", "sound playing through monitor"],
    "audio_crackling": ["crackling", "buzzing audio", "popping sound", "audio stutter", "distorted sound"],
    "audio_service_stopped": ["audio service not running", "red x on sound", "sound service stopped"],
    
    "app_hang": ["app freeze", "application freezing", "program not responding", "hangs", "app crash", "crashes unexpectedly"],
    "app_not_responding": ["not responding", "white screen app", "window frozen", "spinning circle", "wait or close program"],
    "memory_leak": ["memory leak", "ram consumption grows", "browser freezing", "chrome freezing", "app eating ram"],
    "missing_runtime": ["dll missing", "visual c++", "vcredist", "directx error", "runtime error", "msvcp", "vcruntime"],
    
    "no_boot": ["won't turn on", "not starting", "will not boot", "no power", "dead pc", "power button does nothing"],
    "black_screen_cursor": ["black screen cursor", "black screen with mouse", "blank screen", "cursor visible black screen"],
    "black_screen_no_cursor": ["black screen", "no display", "monitor blank", "screen black", "monitor no signal"],
    "bsod_crash": ["blue screen", "bsod", "system crash", "stop code", "dumping physical memory", "kernel panic"],
    "beep_codes": ["beeping sound", "beeps on startup", "continuous beep", "motherboard beep"],
    
    "printer_offline": ["printer offline", "printer not responding", "cannot print", "printer paused", "printer not connected"],
    "printer_not_detected": ["printer not detected", "printer not found", "usb printer unrecognized", "add printer fails", "printer missing"],
    "print_spooler_error": ["spooler error", "print spooler stopped", "spooler service", "spoolsv.exe error", "document stuck in queue"],
    
    "cpu_100_percent": ["100% cpu", "high cpu", "cpu maxed", "cpu pinned", "cpu usage 99", "cpu usage 100"],
    "ram_full": ["100% ram", "high memory", "ram full", "out of memory", "low memory warning", "ram 95%"],
    "system_interrupts": ["system interrupts", "dpc latency", "interrupt storm"],
    
    "driver_error": ["driver error", "yellow triangle device manager", "code 43", "code 10", "driver corrupted", "failed driver"],
    "windows_update_error": ["update failed", "windows update error", "update stuck", "0x800", "undoing changes update"]
}

RULES = [
    # ------------------ SLOW COMPUTER ------------------
    {
        "id": "R_SLOW_01",
        "category": "slow_computer",
        "title": "Startup & Background Process Congestion",
        "required_symptoms": ["system_lag"],
        "optional_symptoms": ["boot_slow", "too_many_startup_apps", "ram_full"],
        "negative_symptoms": ["thermal_throttling", "disk_100_percent"],
        "cause": "Excessive startup applications and unoptimized background resident tasks consuming RAM and CPU cycles during idle states.",
        "reasoning": "Symptom signatures indicate general system slowdown and extended boot times without hardware overheating or storage I/O lockup.",
        "confidence_base": 86,
        "follow_up_questions": [
            {
                "id": "q_startup_count",
                "question": "Did the slowdown start after installing new software or over time as more applications were added?",
                "options": [
                    {"label": "Yes, gradually over time / after installing multiple apps", "delta": 10},
                    {"label": "No, it happened suddenly out of nowhere", "delta": -15}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Disable Unnecessary Startup Programs",
                "description": "Press Ctrl + Shift + Esc to open Task Manager. Click the 'Startup apps' tab. Right-click non-essential background applications (Spotify, Discord, Adobe, OneDrive) and select 'Disable'.",
                "command": "taskmgr"
            },
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Clean Windows Temporary Files",
                "description": "Press Win + R, type '%temp%' and press Enter. Select all files (Ctrl + A) and press Delete. Skip any files currently in use by Windows.",
                "command": "%temp%"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Run Built-in Storage Sense Optimization",
                "description": "Open Windows Settings -> System -> Storage. Turn on 'Storage Sense' and click 'Run Storage Sense now' to purge old cache, dump files, and recycle bin buffers.",
                "command": "cleanmgr /sageset:1"
            }
        ],
        "alternatives": ["If slowdown continues, investigate thermal throttling (R_SLOW_03) or hard drive health (R_SLOW_02)."],
        "escalation": "If system takes >5 minutes to boot on an SSD after disabling startup apps, hardware storage degradation may be present.",
        "safety_warning": "Do not delete files in C:\\Windows\\System32. Only delete files within the %temp% user directory."
    },
    {
        "id": "R_SLOW_02",
        "category": "slow_computer",
        "title": "Storage Drive I/O Thrashing (100% Disk Usage)",
        "required_symptoms": ["disk_100_percent"],
        "optional_symptoms": ["system_lag", "boot_slow"],
        "negative_symptoms": [],
        "cause": "Windows Search Indexing service (SysMain / Superfetch) loop or corrupt storage sector caching leading to 100% active disk time.",
        "reasoning": "The hard drive or SSD is trapped at 100% utilization while transfer rates are near 0 MB/s, starving the OS of read/write bandwidth.",
        "confidence_base": 92,
        "follow_up_questions": [
            {
                "id": "q_disk_type",
                "question": "Are you using an older mechanical Hard Disk Drive (HDD) or a Solid State Drive (SSD)?",
                "options": [
                    {"label": "Traditional Mechanical Hard Drive (HDD)", "delta": 8},
                    {"label": "Solid State Drive (SSD)", "delta": 2}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Restart SysMain (Superfetch) Service",
                "description": "Open Command Prompt as Administrator. Type 'net stop sysmain' and press Enter to release the disk indexing lock.",
                "command": "net stop sysmain"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Run Check Disk Utility (chkdsk)",
                "description": "In Administrator Command Prompt, run 'chkdsk C: /f /r'. If prompted to schedule on next reboot, type 'Y' and restart your computer to verify file system integrity.",
                "command": "chkdsk C: /f /r"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Verify Virtual Memory (Paging File) Settings",
                "description": "Search 'View advanced system settings' -> Performance 'Settings' -> Advanced tab -> Virtual memory 'Change'. Ensure 'Automatically manage paging file size for all drives' is checked.",
                "command": "sysdm.cpl"
            }
        ],
        "alternatives": ["If chkdsk reports unrecoverable bad sectors, back up personal data immediately and consider an SSD upgrade."],
        "escalation": "Audible clicking or grinding sounds from an HDD indicate impending mechanical drive failure. Power off to prevent data loss.",
        "safety_warning": "Do not abruptly power off the computer while chkdsk is actively repairing disk sectors."
    },
    {
        "id": "R_SLOW_03",
        "category": "slow_computer",
        "title": "CPU Thermal Throttling & Heat Dissipation Failure",
        "required_symptoms": ["thermal_throttling"],
        "optional_symptoms": ["system_lag", "cpu_100_percent"],
        "negative_symptoms": [],
        "cause": "Processor temperatures exceeding thermal threshold (>90°C), forcing clock frequency reduction to prevent silicon damage.",
        "reasoning": "Loud fan activity accompanied by progressive system slowdown under sustained loads is the textbook signature of thermal throttling.",
        "confidence_base": 90,
        "follow_up_questions": [
            {
                "id": "q_laptop_desk",
                "question": "Is the computer used on a soft surface (bed/couch) or has it been more than 1-2 years since internal dust cleaning?",
                "options": [
                    {"label": "Yes, dusty vents or used on soft surface", "delta": 10},
                    {"label": "No, clean desk with clear airflow", "delta": -10}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Elevate Computer and Clear Intake Vents",
                "description": "Ensure the computer is placed on a hard, flat surface. Ensure at least 4-6 inches of clearance around all exhaust and intake vents.",
                "command": "powercfg /setactive scheme_balanced"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Inspect Runaway Background Processes",
                "description": "Open Task Manager, sort by 'CPU'. Check if an errant background task (e.g. browser hardware acceleration or crypto miner) is pegging cores at 100%.",
                "command": "resmon"
            },
            {
                "tier": "Tier 3: Advanced Maintenance",
                "title": "Clean Cooling Fans with Compressed Air",
                "description": "Turn off PC, disconnect power. Use short bursts of compressed air to blow dust out of heatsink fins and fan grilles. Hold fan blades gently to prevent overspinning.",
                "command": "shutdown /s /t 0"
            }
        ],
        "alternatives": ["Inspect CPU thermal paste and liquid cooler pump if temperatures remain critical."],
        "escalation": "If temperatures exceed 95°C and fans are non-functional, contact a technician to inspect cooling fan bearings or liquid pump.",
        "safety_warning": "Always disconnect AC power before using compressed air. Never use a vacuum cleaner inside a PC chassis due to ESD static shock."
    },

    # ------------------ WI-FI & INTERNET ------------------
    {
        "id": "R_NET_01",
        "category": "network_wifi",
        "title": "Network Adapter Stack Corruption or IP Lease Failure",
        "required_symptoms": ["no_internet"],
        "optional_symptoms": ["wifi_disconnected", "limited_connectivity", "dns_failure"],
        "negative_symptoms": ["wifi_icon_missing"],
        "cause": "Corrupted TCP/IP socket catalog, invalid DHCP IP address assignment, or DNS cache lockup.",
        "reasoning": "Device detects the network adapter but cannot establish full packet routing to the internet gateway.",
        "confidence_base": 88,
        "follow_up_questions": [
            {
                "id": "q_other_devices",
                "question": "Are other devices (like your phone) currently able to connect to the same Wi-Fi?",
                "options": [
                    {"label": "Yes, other devices work fine", "delta": 10},
                    {"label": "No, all devices have no internet", "delta": -25}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Quick Network Adapter Power Cycle",
                "description": "Toggle Airplane Mode ON for 10 seconds, then toggle it OFF. Alternatively, disconnect and reconnect to the Wi-Fi SSID.",
                "command": "netsh interface set interface name=\"Wi-Fi\" admin=disable && netsh interface set interface name=\"Wi-Fi\" admin=enable"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Flush DNS Cache & Release/Renew IP Lease",
                "description": "Open Command Prompt as Administrator and run the following command sequence to clear stale routing tables.",
                "command": "ipconfig /flushdns && ipconfig /release && ipconfig /renew"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Reset Winsock Catalog & TCP/IP Stack",
                "description": "In Administrator Command Prompt, execute 'netsh winsock reset' and 'netsh int ip reset'. Restart your computer when completed.",
                "command": "netsh winsock reset"
            }
        ],
        "alternatives": ["If all devices are disconnected, power cycle the physical router/modem by unplugging it for 30 seconds (R_NET_02)."],
        "escalation": "Contact your Internet Service Provider (ISP) if the modem shows an orange WAN indicator light.",
        "safety_warning": "Resetting TCP/IP stack will prompt a PC restart. Save all open documents before executing."
    },
    {
        "id": "R_NET_02",
        "category": "network_wifi",
        "title": "DNS Server Resolution Failure",
        "required_symptoms": ["dns_failure"],
        "optional_symptoms": ["no_internet", "limited_connectivity"],
        "negative_symptoms": [],
        "cause": "Default ISP DNS servers are unreachable or failing to resolve domain names to IP addresses.",
        "reasoning": "Device has valid local network gateway connection but web browsers return DNS_PROBE_FINISHED_NXDOMAIN.",
        "confidence_base": 94,
        "follow_up_questions": [
            {
                "id": "q_ping_ip",
                "question": "Can you open a specific website if you type an IP address like 8.8.8.8 directly?",
                "options": [
                    {"label": "Yes or not sure", "delta": 5},
                    {"label": "No, nothing loads at all", "delta": -10}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Switch to Secure Public DNS (Google / Cloudflare)",
                "description": "Press Win + R, type 'ncpa.cpl'. Right-click Wi-Fi adapter -> Properties -> Select 'Internet Protocol Version 4 (TCP/IPv4)' -> Properties. Select 'Use the following DNS server addresses': Preferred: 8.8.8.8, Alternate: 1.1.1.1.",
                "command": "ncpa.cpl"
            },
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Purge Browser DNS Socket Cache",
                "description": "In Chrome or Edge, navigate to 'chrome://net-internals/#dns' and click 'Clear host cache'.",
                "command": "ipconfig /flushdns"
            }
        ],
        "alternatives": ["Verify if an active VPN or third-party antivirus firewall is intercepting DNS queries."],
        "escalation": "If custom DNS fails to resolve, contact your network administrator or ISP regarding DNS port 53 blocking.",
        "safety_warning": "Do not enter unverified proxy or DNS IPs from unknown forums."
    },
    {
        "id": "R_NET_03",
        "category": "network_wifi",
        "title": "Missing Wi-Fi Adapter or Driver Code 10/43 Error",
        "required_symptoms": ["wifi_icon_missing"],
        "optional_symptoms": ["no_internet", "driver_error"],
        "negative_symptoms": [],
        "cause": "WLAN network interface controller card disabled, in power-state error, or missing OEM driver.",
        "reasoning": "The Windows system tray shows only an airplane or globe icon with no Wi-Fi networks discovered.",
        "confidence_base": 91,
        "follow_up_questions": [
            {
                "id": "q_device_mgr_wifi",
                "question": "Does Device Manager show a yellow warning triangle under 'Network adapters'?",
                "options": [
                    {"label": "Yes, yellow triangle or missing adapter", "delta": 10},
                    {"label": "No, adapter looks normal", "delta": -15}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Check Physical Wi-Fi Switch / Airplane Key",
                "description": "Check if your laptop has a physical Wi-Fi switch or function hotkey (Fn + F2/F5/F12) that toggled the antenna hardware off.",
                "command": "ms-settings:network"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Re-enable Adapter in Device Manager",
                "description": "Press Win + X -> Device Manager -> Expand 'Network adapters'. Right-click your Intel/Realtek/Qualcomm Wi-Fi card -> 'Disable device', wait 5 seconds, then 'Enable device'.",
                "command": "devmgmt.msc"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Perform Complete Windows Network Reset",
                "description": "Settings -> Network & internet -> Advanced network settings -> 'Network reset' -> 'Reset now'. PC will automatically restart in 5 minutes.",
                "command": "ms-settings:network-advancedsettings"
            }
        ],
        "alternatives": ["Download the official Wi-Fi driver from your laptop maker on another device and transfer via USB."],
        "escalation": "If the Wi-Fi card does not appear even after scanning for hardware changes, the M.2 WLAN card may be loose or defective.",
        "safety_warning": "Network reset will remove saved Wi-Fi passwords. Ensure you know your network key before resetting."
    },

    # ------------------ NO SOUND / AUDIO ------------------
    {
        "id": "R_AUDIO_01",
        "category": "audio_sound",
        "title": "Mismatched Audio Playback Endpoint or Stream Muted",
        "required_symptoms": ["no_audio"],
        "optional_symptoms": ["audio_muted", "wrong_output_device"],
        "negative_symptoms": ["audio_service_stopped"],
        "cause": "Windows audio stream routed to inactive HDMI monitor, virtual audio cable, or muted application volume mixer.",
        "reasoning": "Audio hardware is functional but the primary OS sound output routing is directed to the wrong hardware endpoint.",
        "confidence_base": 90,
        "follow_up_questions": [
            {
                "id": "q_sound_mixer",
                "question": "Do you see green volume bars moving in the sound settings when audio plays?",
                "options": [
                    {"label": "Yes, volume bar moves but no sound comes out", "delta": 10},
                    {"label": "No, volume bar stays completely dead", "delta": -10}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Verify Primary Default Output Device",
                "description": "Click the Speaker icon on the bottom right taskbar. Click the '>' arrow next to the volume slider. Ensure your real 'Speakers' or 'Headphones' are selected, not an external monitor or virtual driver.",
                "command": "ms-settings:sound"
            },
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Inspect Volume Mixer Levels",
                "description": "Press Win + R, type 'sndvol' and press Enter. Verify neither Master Volume nor the specific web browser / media player is muted.",
                "command": "sndvol"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Run Built-in Windows Audio Troubleshooter",
                "description": "Settings -> System -> Troubleshoot -> Other troubleshooters -> 'Playing Audio' -> 'Run'. Follow on-screen prompts.",
                "command": "msdt.exe /id AudioPlaybackDiagnostic"
            }
        ],
        "alternatives": ["If audio service has crashed, restart the Windows Audio background service (R_AUDIO_02)."],
        "escalation": "If headphone 3.5mm jack produces crackling or physical disconnects, the port hardware may be worn out.",
        "safety_warning": "Set volume to 30% before testing audio to protect your hearing from sudden loud spikes."
    },
    {
        "id": "R_AUDIO_02",
        "category": "audio_sound",
        "title": "Windows Audio Service Failure (AudioSrv Stopped)",
        "required_symptoms": ["audio_service_stopped"],
        "optional_symptoms": ["no_audio", "driver_error"],
        "negative_symptoms": [],
        "cause": "The core 'Windows Audio' (AudioSrv) or 'Windows Audio Endpoint Builder' service has terminated unexpectedly.",
        "reasoning": "Speaker icon in taskbar shows a red 'X' badge with tooltip 'Audio Service is not running'.",
        "confidence_base": 96,
        "follow_up_questions": [],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Restart Windows Audio Services",
                "description": "Press Win + R, type 'services.msc'. Scroll to 'Windows Audio'. Right-click -> 'Restart'. Do the same for 'Windows Audio Endpoint Builder'.",
                "command": "net stop audiosrv && net start audiosrv"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Set Audio Services to Automatic Startup",
                "description": "In services.msc, double-click 'Windows Audio'. Set Startup type to 'Automatic'. Switch to 'Recovery' tab and set First, Second, and Subsequent failures to 'Restart the Service'.",
                "command": "services.msc"
            }
        ],
        "alternatives": ["Reinstall High Definition Audio Device driver in Device Manager."],
        "escalation": "Persistent service crashes may indicate registry corruption in AudioSrv dependencies.",
        "safety_warning": "Do not disable RPC (Remote Procedure Call) dependency services when configuring audio."
    },

    # ------------------ APPS FREEZING ------------------
    {
        "id": "R_APP_01",
        "category": "app_freeze",
        "title": "Application Thread Deadlock or Process Memory Leak",
        "required_symptoms": ["app_hang"],
        "optional_symptoms": ["app_not_responding", "memory_leak", "system_lag"],
        "negative_symptoms": ["bsod_crash"],
        "cause": "Application process trapped in an unhandled I/O wait state, resource contention, or corrupt local application cache.",
        "reasoning": "Application window title displays '(Not Responding)' and turns white/translucent while the rest of the OS remains functional.",
        "confidence_base": 89,
        "follow_up_questions": [
            {
                "id": "q_single_app",
                "question": "Is it only one specific application that freezes, or are all apps freezing across the board?",
                "options": [
                    {"label": "Only one specific program/game freezes", "delta": 10},
                    {"label": "All applications freeze indiscriminately", "delta": -15}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Terminate Stuck Process Tree via Task Manager",
                "description": "Press Ctrl + Shift + Esc. Find the frozen application under 'Processes'. Click 'End task'. If unresponsive, switch to 'Details' tab, right-click the .exe and select 'End process tree'.",
                "command": "taskmgr"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Clear Application Cache and Temporary Data",
                "description": "For web browsers: press Ctrl + Shift + Delete to clear cached images and files. For desktop apps: delete temporary configuration under %LocalAppData%.",
                "command": "%localappdata%"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Disable Hardware Acceleration in Application",
                "description": "Many apps (Chrome, Discord, Office) hang due to GPU hardware acceleration conflicts. Open app Settings -> Advanced -> Disable 'Use hardware acceleration when available'.",
                "command": "appwiz.cpl"
            }
        ],
        "alternatives": ["Check Event Viewer under 'Windows Logs -> Application' for Event ID 1000/1002 crash codes."],
        "escalation": "If multiple software titles freeze simultaneously, test RAM with Windows Memory Diagnostic (mdsched.exe).",
        "safety_warning": "Force-ending a program may lose unsaved work in that specific document."
    },

    # ------------------ BOOT / BLACK SCREEN ------------------
    {
        "id": "R_BOOT_01",
        "category": "boot_black_screen",
        "title": "Windows Explorer Shell Hang (Black Screen with Visible Cursor)",
        "required_symptoms": ["black_screen_cursor"],
        "optional_symptoms": ["app_hang"],
        "negative_symptoms": ["no_boot"],
        "cause": "Windows desktop GUI process (explorer.exe) failed to load user shell session after authentication.",
        "reasoning": "Monitor receives video signal and renders the mouse cursor, proving GPU and display are alive, but the desktop shell is dead.",
        "confidence_base": 95,
        "follow_up_questions": [],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Manually Relaunch Windows Explorer Shell",
                "description": "Press Ctrl + Shift + Esc to open Task Manager. Click 'Run new task' (or File -> Run new task). Type 'explorer.exe' and click OK. Desktop and taskbar will appear immediately.",
                "command": "explorer.exe"
            },
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Wake Graphics Driver Hotkey",
                "description": "Press the Windows graphics driver reset shortcut: Win + Ctrl + Shift + B. The screen will flicker and beep, re-establishing video buffer handshake.",
                "command": "Win + Ctrl + Shift + B"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Disable Windows Fast Startup",
                "description": "Fast Startup saves cached kernel memory that can corrupt over time. Open Control Panel -> Power Options -> 'Choose what the power buttons do' -> Uncheck 'Turn on fast startup'.",
                "command": "powercfg.cpl"
            }
        ],
        "alternatives": ["Boot into Windows Safe Mode by holding Shift while clicking Restart on the login screen."],
        "escalation": "If black screen persists across Safe Mode reboots, user profile registry hive (Winlogon\\Shell) may be damaged.",
        "safety_warning": "Do not force power cut during Windows updates; wait at least 15 minutes before hard rebooting."
    },
    {
        "id": "R_BOOT_02",
        "category": "boot_black_screen",
        "title": "Power Delivery or Residual Static Lockout (No Power / No Post)",
        "required_symptoms": ["no_boot"],
        "optional_symptoms": ["black_screen_no_cursor", "beep_codes"],
        "negative_symptoms": ["black_screen_cursor"],
        "cause": "Residual capacitive static charge in motherboard power delivery stages or loose main ATX / AC power connector.",
        "reasoning": "No fans spin, no LEDs illuminate, or system shuts down instantly upon pressing the power button.",
        "confidence_base": 89,
        "follow_up_questions": [
            {
                "id": "q_laptop_led",
                "question": "Is the power charging light on your laptop or the motherboard standby LED illuminated?",
                "options": [
                    {"label": "Yes, LED light is on but screen stays off", "delta": 8},
                    {"label": "No, completely dark and silent", "delta": 5}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Perform Hard Power Drain (Static Discharge)",
                "description": "Unplug the AC power cable (and remove battery if removable). Hold the power button down continuously for 30 full seconds. Reconnect power and power on.",
                "command": "Hardware Static Discharge"
            },
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Test Power Outlet & Bypass Surge Protectors",
                "description": "Plug the computer charger/power supply directly into a known working wall outlet, bypassing power strips, extension cords, or battery backups.",
                "command": "Outlet Verification"
            },
            {
                "tier": "Tier 2: Hardware Safety",
                "title": "Disconnect All External Peripherals",
                "description": "Unplug all external USB hubs, printers, webcams, and flash drives. A shorted USB device can trigger motherboard over-current protection.",
                "command": "Peripheral Isolation"
            }
        ],
        "alternatives": ["Reseat RAM modules into slots 2 and 4 after disconnecting power."],
        "escalation": "If power drain yields no fans or lights, power supply unit (PSU) or motherboard VRM has failed and requires certified replacement.",
        "safety_warning": "CRITICAL ELECTRICAL SAFETY: Never open a computer Power Supply Unit (PSU). High-voltage internal capacitors hold lethal charges even when unplugged."
    },

    # ------------------ PRINTER NOT DETECTED ------------------
    {
        "id": "R_PRINT_01",
        "category": "printer_issue",
        "title": "Print Spooler Service Jam or Stalled Queue Lock",
        "required_symptoms": ["print_spooler_error"],
        "optional_symptoms": ["printer_offline", "printer_not_detected"],
        "negative_symptoms": [],
        "cause": "A corrupted print document in C:\\Windows\\System32\\spool\\PRINTERS has crashed the Windows Print Spooler daemon.",
        "reasoning": "Print jobs get stuck with status 'Deleting' or 'Error - Printing', preventing all subsequent print commands.",
        "confidence_base": 93,
        "follow_up_questions": [],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Purge Print Queue and Restart Spooler",
                "description": "Open Command Prompt as Administrator and run the automated queue reset sequence.",
                "command": "net stop spooler && del /Q /F /S \"%systemroot%\\System32\\Spool\\Printers\\*.*\" && net start spooler"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Toggle 'Use Printer Offline' Setting",
                "description": "Open Control Panel -> Devices and Printers. Double-click your printer -> click 'Printer' menu at the top -> uncheck 'Use Printer Offline'.",
                "command": "control printers"
            }
        ],
        "alternatives": ["Reinstall printer driver software directly from manufacturer website (HP, Epson, Canon)."],
        "escalation": "If wireless printer continuously drops, assign a static IP address in your router DHCP reservation table.",
        "safety_warning": "Clearing the spooler will delete pending print jobs. Re-send required documents after restart."
    },
    {
        "id": "R_PRINT_02",
        "category": "printer_issue",
        "title": "USB Interface Port Dropout or Driver Binding Error",
        "required_symptoms": ["printer_not_detected"],
        "optional_symptoms": ["printer_offline"],
        "negative_symptoms": ["print_spooler_error"],
        "cause": "USB controller port suspended by power management or corrupt generic printer driver communication.",
        "reasoning": "Printer is powered on with green ready LED, but Windows Settings lists device as 'Driver is unavailable' or 'Not connected'.",
        "confidence_base": 88,
        "follow_up_questions": [
            {
                "id": "q_printer_usb",
                "question": "Is the printer connected via a direct USB cable or via Wi-Fi wireless network?",
                "options": [
                    {"label": "Direct USB cable", "delta": 10},
                    {"label": "Wireless Wi-Fi / Network", "delta": -5}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Try a Direct Rear USB 2.0 Port",
                "description": "Unplug the USB cable from front panels or USB hubs. Plug directly into the back motherboard I/O panel. Listen for the Windows device connection chime.",
                "command": "devmgmt.msc"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Remove Device and Re-detect",
                "description": "Settings -> Bluetooth & devices -> Printers & scanners. Select printer -> 'Remove'. Turn printer off for 10 seconds, turn back on, and click 'Add device'.",
                "command": "ms-settings:printers"
            }
        ],
        "alternatives": ["Install OEM manufacturer full feature software suite rather than generic Windows default driver."],
        "escalation": "Inspect printer USB type-B socket for bent pins if cable feels loose.",
        "safety_warning": "Ensure printer power is off when connecting or disconnecting data cables."
    },

    # ------------------ HIGH CPU / RAM USAGE ------------------
    {
        "id": "R_RES_01",
        "category": "resource_usage",
        "title": "Runaway Windows Update or Indexer Thread (100% CPU)",
        "required_symptoms": ["cpu_100_percent"],
        "optional_symptoms": ["system_lag", "thermal_throttling", "ram_full"],
        "negative_symptoms": [],
        "cause": "Windows Update service (TiWorker.exe / TrustedInstaller) or telemetry worker trapped in a parsing loop.",
        "reasoning": "CPU utilization hovers at 95-100% even with zero user applications open, causing lag and high heat.",
        "confidence_base": 91,
        "follow_up_questions": [
            {
                "id": "q_taskmgr_process",
                "question": "In Task Manager, do you see 'TiWorker.exe', 'TrustedInstaller', or 'Antimalware Service Executable' near the top?",
                "options": [
                    {"label": "Yes, system / update processes", "delta": 10},
                    {"label": "No, a third-party application or browser", "delta": -15}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Check and Complete Pending Windows Updates",
                "description": "Open Settings -> Windows Update. If updates are downloading or pending restart, let them finish or click 'Check for updates'.",
                "command": "ms-settings:windowsupdate"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Clear Windows SoftwareDistribution Cache",
                "description": "Open Administrator Command Prompt and execute the update cache purge script.",
                "command": "net stop wuauserv && net stop bits && ren %systemroot%\\SoftwareDistribution SoftwareDistribution.bak && net start wuauserv"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Run Windows Maintenance Diagnostics",
                "description": "Search 'Security and Maintenance' in Start Menu -> Expand 'Maintenance' -> click 'Start maintenance'.",
                "command": "control /name Microsoft.ActionCenter"
            }
        ],
        "alternatives": ["Run Microsoft Defender Offline Scan to check for background cryptomining malware."],
        "escalation": "If System Interrupts consumes >20% CPU constantly, run LatencyMon to identify faulty hardware drivers.",
        "safety_warning": "Do not terminate TrustedInstaller or svchost.exe processes forcefully while updates are writing."
    },

    # ------------------ SOFTWARE & DRIVER ERRORS ------------------
    {
        "id": "R_DRV_01",
        "category": "software_driver",
        "title": "System File Corruption & Component Store Integrity Failure",
        "required_symptoms": ["driver_error"],
        "optional_symptoms": ["bsod_crash", "app_hang", "windows_update_error"],
        "negative_symptoms": [],
        "cause": "Critical Windows dynamic link libraries (DLLs) corrupted due to unexpected shutdowns or failed patch installation.",
        "reasoning": "Applications throw missing DLL errors (0xc000007b) and Device Manager exhibits driver communication faults.",
        "confidence_base": 92,
        "follow_up_questions": [
            {
                "id": "q_recent_crash",
                "question": "Did the computer recently experience an abrupt power outage, blue screen, or battery die while running?",
                "options": [
                    {"label": "Yes, had an unexpected power cut / BSOD", "delta": 10},
                    {"label": "No, normal shutdown", "delta": -5}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Execute System File Checker (SFC)",
                "description": "Open Command Prompt as Administrator. Type 'sfc /scannow' and press Enter. Allow the verification scan to reach 100% and repair damaged files.",
                "command": "sfc /scannow"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Execute Deployment Image Servicing and Management (DISM)",
                "description": "If SFC cannot repair files, run DISM to pull healthy copies from Windows Update servers: 'DISM /Online /Cleanup-Image /RestoreHealth'.",
                "command": "DISM /Online /Cleanup-Image /RestoreHealth"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Install Microsoft Visual C++ All-in-One Redistributables",
                "description": "Download and install the official Microsoft Visual C++ 2015-2022 redistributable package (x64 and x86) to restore missing runtime libraries.",
                "command": "ms-settings:appsfeatures"
            }
        ],
        "alternatives": ["Use Windows System Restore to revert system state to a point prior to driver failure."],
        "escalation": "If DISM reports error 0x800f081f (source files could not be found), an in-place Windows repair upgrade is recommended.",
        "safety_warning": "Allow SFC and DISM to run without interruption; do not close the terminal window prematurely."
    },
    {
        "id": "R_DRV_02",
        "category": "software_driver",
        "title": "Blue Screen of Death (BSOD) Driver Fault",
        "required_symptoms": ["bsod_crash"],
        "optional_symptoms": ["driver_error", "system_lag"],
        "negative_symptoms": [],
        "cause": "Kernel-mode hardware driver crash (often GPU, Wi-Fi, or chipset) triggering bugcheck stop codes.",
        "reasoning": "Windows halts execution with blue screen error (e.g. DPC_WATCHDOG_VIOLATION, IRQL_NOT_LESS_OR_EQUAL, VIDEO_TDR_FAILURE).",
        "confidence_base": 94,
        "follow_up_questions": [
            {
                "id": "q_bsod_stopcode",
                "question": "Did the blue screen mention a specific filename ending in '.sys' (like nvlddmkm.sys, igdkmd64.sys, or ntoskrnl.exe)?",
                "options": [
                    {"label": "Yes, mentioned a graphics or driver .sys file", "delta": 10},
                    {"label": "No, just generic stop code", "delta": 0}
                ]
            }
        ],
        "steps": [
            {
                "tier": "Tier 1: Quick & Safe",
                "title": "Clean Reinstall Display Drivers with DDU",
                "description": "Boot into Windows Safe Mode. Run Display Driver Uninstaller (DDU) to wipe existing GPU driver remnants. Boot normally and install clean OEM drivers.",
                "command": "shutdown /r /o /t 0"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Run Windows Memory Diagnostic",
                "description": "Press Win + R, type 'mdsched.exe' and select 'Restart now and check for problems' to test physical RAM sticks for bit errors.",
                "command": "mdsched.exe"
            },
            {
                "tier": "Tier 2: Configuration",
                "title": "Inspect Minidump Crash Logs",
                "description": "Use the free BlueScreenView or WinDbg utility to inspect crash minidumps stored in C:\\Windows\\Minidump to identify the exact culprit driver.",
                "command": "%systemroot%\\Minidump"
            }
        ],
        "alternatives": ["Disconnect newly attached external USB devices or undo recent BIOS overclocks / XMP."],
        "escalation": "If mdsched.exe detects hardware errors, replace the failing RAM module.",
        "safety_warning": "Back up important files immediately after any BSOD crash before running extensive stress tests."
    }
]
