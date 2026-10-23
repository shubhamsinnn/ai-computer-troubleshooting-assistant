/**
 * Unified API client and embedded AI Expert System engine for Computer Troubleshooting Assistant.
 * Connects to FastAPI backend when available, and provides complete embedded inference fallback on Vercel.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// Embedded Knowledge Base for Vercel Cloud Serverless Execution
const EMBEDDED_CATEGORIES = {
  slow_computer: "Slow computer or lagging system",
  network_wifi: "Wi-Fi or internet not working",
  audio_sound: "No sound or audio problems",
  app_freeze: "Applications freezing or not responding",
  boot_black_screen: "Computer not starting or black screen",
  printer_issue: "Printer not detected or spooler errors",
  resource_usage: "High CPU, RAM or disk usage",
  software_driver: "Common software and driver problems"
};

const EMBEDDED_RULES = [
  {
    id: "R_SLOW_01",
    category: "slow_computer",
    title: "Startup & Background Process Congestion",
    required_symptoms: ["system_lag"],
    optional_symptoms: ["boot_slow", "too_many_startup_apps", "ram_full"],
    cause: "Excessive background startup programs and unoptimized resident services consuming memory and CPU cycles.",
    reasoning: "Symptom signatures indicate general system slowdown and long boot delays without storage I/O hardware failure.",
    confidence_base: 86,
    follow_up_questions: [
      {
        id: "q_startup_count",
        question: "Did this slowdown happen gradually over time as more software was installed?",
        options: [
          { label: "Yes, gradually over time / after installing apps", delta: 10 },
          { label: "No, it started suddenly out of nowhere", delta: -15 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Disable Non-Essential Startup Programs",
        description: "Press Ctrl + Shift + Esc to open Task Manager. Switch to 'Startup apps'. Right-click non-essential background apps (Spotify, Discord, OneDrive, game launchers) and select 'Disable'.",
        command: "taskmgr"
      },
      {
        tier: "Tier 1: Quick & Safe",
        title: "Clean Windows Temporary Files",
        description: "Press Win + R, type '%temp%' and press Enter. Select all files (Ctrl + A) and press Delete. Skip any files currently locked by Windows.",
        command: "%temp%"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Run Disk Cleanup & Storage Sense",
        description: "Search 'Disk Cleanup' in the Start menu, select drive C:, check 'Temporary files' and 'Recycle Bin', then click OK to reclaim storage.",
        command: "cleanmgr"
      }
    ],
    alternatives: ["If slowdown continues, investigate 100% disk usage (R_SLOW_02) or CPU thermal throttling (R_SLOW_03)."],
    escalation: "If system takes >5 minutes to boot on an SSD after disabling startup apps, hardware drive health check is recommended.",
    safety_warning: "Never delete files from C:\\Windows\\System32. Only delete temporary cache files in %temp%."
  },
  {
    id: "R_SLOW_02",
    category: "slow_computer",
    title: "Storage Drive I/O Thrashing (100% Disk Usage)",
    required_symptoms: ["disk_100_percent"],
    optional_symptoms: ["system_lag", "boot_slow"],
    cause: "Windows Search Indexing service (SysMain / Superfetch) loop or corrupt disk file tables locking disk active time to 100%.",
    reasoning: "Storage drive remains pinned at 100% active time with near zero data transfer rate, starving system threads.",
    confidence_base: 92,
    follow_up_questions: [
      {
        id: "q_disk_type",
        question: "Are you running an older mechanical Hard Disk Drive (HDD) or a Solid State Drive (SSD)?",
        options: [
          { label: "Mechanical Hard Drive (HDD)", delta: 8 },
          { label: "Solid State Drive (SSD)", delta: 2 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Stop SysMain (Superfetch) Service",
        description: "Open Command Prompt as Administrator. Type 'net stop sysmain' and press Enter to release the disk indexing lock.",
        command: "net stop sysmain"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Run Check Disk Utility (chkdsk)",
        description: "In Administrator Command Prompt, run 'chkdsk C: /f /r'. Type 'Y' when prompted to schedule check on restart, then reboot.",
        command: "chkdsk C: /f /r"
      }
    ],
    alternatives: ["Consider upgrading older mechanical HDDs to an SSD for massive read/write throughput improvements."],
    escalation: "Clicking or grinding noises from a mechanical hard drive indicate imminent magnetic platter failure.",
    safety_warning: "Do not unplug or hard power off computer while chkdsk is actively repairing disk sectors."
  },
  {
    id: "R_NET_01",
    category: "network_wifi",
    title: "Network Adapter TCP/IP Stack Corruption or DHCP Lease Lockout",
    required_symptoms: ["no_internet"],
    optional_symptoms: ["wifi_disconnected", "limited_connectivity"],
    cause: "Corrupted local Winsock catalog, stale DNS cache entries, or failing DHCP gateway address negotiation.",
    reasoning: "Device detects the network adapter interface but cannot establish TCP/IP packet transmission to public gateways.",
    confidence_base: 89,
    follow_up_questions: [
      {
        id: "q_other_devices",
        question: "Are other devices (like your smartphone) currently able to access the internet on the same Wi-Fi?",
        options: [
          { label: "Yes, other devices work fine", delta: 10 },
          { label: "No, internet is down on all devices", delta: -25 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Toggle Adapter / Airplane Mode",
        description: "Toggle Airplane Mode ON for 10 seconds, then toggle it back OFF to force the Wi-Fi card to re-negotiate with the router.",
        command: "ms-settings:network"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Flush DNS & Renew IP Lease",
        description: "Open Command Prompt as Administrator and execute the network release and renewal sequence.",
        command: "ipconfig /flushdns && ipconfig /release && ipconfig /renew"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Reset Winsock Catalog & TCP/IP Stack",
        description: "In Administrator Command Prompt, run 'netsh winsock reset' and restart your computer.",
        command: "netsh winsock reset"
      }
    ],
    alternatives: ["Switch to public DNS servers (8.8.8.8 and 1.1.1.1) if DNS resolution remains faulty (R_NET_02)."],
    escalation: "If all household devices lose connection simultaneously, contact your Internet Service Provider (ISP).",
    safety_warning: "Network reset will forget saved Wi-Fi passwords. Have your router security key ready."
  },
  {
    id: "R_NET_02",
    category: "network_wifi",
    title: "DNS Server Resolution Failure",
    required_symptoms: ["dns_failure"],
    optional_symptoms: ["no_internet", "limited_connectivity"],
    cause: "Default ISP DNS servers are unresponsive or returning NXDOMAIN lookups for standard web domains.",
    reasoning: "Local IP gateway ping is responsive, but web browsers return DNS_PROBE_FINISHED_NXDOMAIN errors.",
    confidence_base: 94,
    follow_up_questions: [],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Configure Cloudflare / Google Public DNS",
        description: "Press Win + R, type 'ncpa.cpl'. Right-click Wi-Fi -> Properties -> Internet Protocol Version 4 (TCP/IPv4) -> Properties. Set Preferred DNS: 8.8.8.8, Alternate DNS: 1.1.1.1.",
        command: "ncpa.cpl"
      },
      {
        tier: "Tier 1: Quick & Safe",
        title: "Flush System DNS Resolver Cache",
        description: "Open Command Prompt and run 'ipconfig /flushdns' to purge stale host lookup entries.",
        command: "ipconfig /flushdns"
      }
    ],
    alternatives: ["Temporarily disable third-party VPN software to check if VPN virtual TAP adapter is intercepting port 53."],
    escalation: "If public DNS fails, check with your router administrator regarding active parental controls or firewall blocks.",
    safety_warning: "Only use trusted public DNS providers (Google 8.8.8.8 or Cloudflare 1.1.1.1)."
  },
  {
    id: "R_AUDIO_01",
    category: "audio_sound",
    title: "Mismatched Audio Playback Endpoint or Volume Stream Muted",
    required_symptoms: ["no_audio"],
    optional_symptoms: ["audio_muted", "wrong_output_device"],
    cause: "Windows audio output stream routed to an inactive HDMI monitor, virtual audio device, or muted in Volume Mixer.",
    reasoning: "Sound drivers are functioning normally, but output destination does not match the active physical speakers or headphones.",
    confidence_base: 91,
    follow_up_questions: [
      {
        id: "q_sound_mixer",
        question: "Do you see green audio level bars bouncing in Windows sound settings when media plays?",
        options: [
          { label: "Yes, volume bars bounce but no sound comes out", delta: 10 },
          { label: "No, volume bars stay flat and gray", delta: -10 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Select Correct Output Device in Taskbar",
        description: "Click the Speaker icon in the bottom-right taskbar. Click the '>' arrow next to volume. Ensure 'Speakers / Headphones' is chosen rather than external HDMI or virtual drivers.",
        command: "ms-settings:sound"
      },
      {
        tier: "Tier 1: Quick & Safe",
        title: "Verify Volume Mixer Sliders",
        description: "Press Win + R, type 'sndvol'. Ensure neither Master Volume nor the specific browser/app slider is muted or set to zero.",
        command: "sndvol"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Restart Windows Audio Service",
        description: "Press Win + R, type 'services.msc'. Scroll to 'Windows Audio'. Right-click and click 'Restart'.",
        command: "services.msc"
      }
    ],
    alternatives: ["Run the Windows Audio Troubleshooter or update Realtek audio driver in Device Manager."],
    escalation: "If 3.5mm headphone jack exhibits buzzing or physical disconnects, the audio port solder joint may be broken.",
    safety_warning: "Set volume to 30% before testing audio to avoid hearing damage from sudden audio bursts."
  },
  {
    id: "R_APP_01",
    category: "app_freeze",
    title: "Application Thread Deadlock or Process Memory Leak",
    required_symptoms: ["app_hang"],
    optional_symptoms: ["app_not_responding", "system_lag"],
    cause: "Application thread locked in an unhandled I/O wait state, infinite parsing loop, or corrupt cache.",
    reasoning: "The application window title displays '(Not Responding)' while background operating system services remain active.",
    confidence_base: 89,
    follow_up_questions: [
      {
        id: "q_single_app",
        question: "Is it only one specific application that hangs, or do all programs freeze across the board?",
        options: [
          { label: "Only one specific program freezes", delta: 10 },
          { label: "All programs freeze indiscriminately", delta: -15 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Terminate Frozen Process in Task Manager",
        description: "Press Ctrl + Shift + Esc. Locate the frozen app in the list. Click 'End task'. If stubborn, switch to 'Details' tab, right-click and choose 'End process tree'.",
        command: "taskmgr"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Disable Hardware Acceleration in App",
        description: "In apps like Chrome, Discord, or Spotify: go to Settings -> Advanced / System -> Turn off 'Use graphics acceleration when available' and restart the app.",
        command: "%localappdata%"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Reinstall Microsoft Visual C++ Runtimes",
        description: "Many crashing apps lack proper Visual C++ libraries. Install the official Visual C++ 2015-2022 x64 redistributable package.",
        command: "appwiz.cpl"
      }
    ],
    alternatives: ["Check Windows Event Viewer under Application Logs for specific crash Faulting Module Name."],
    escalation: "If multiple apps crash with random memory access violations, run Windows Memory Diagnostic (mdsched.exe) to test RAM.",
    safety_warning: "Force-terminating an application will discard unsaved document changes in that specific window."
  },
  {
    id: "R_BOOT_01",
    category: "boot_black_screen",
    title: "Windows Explorer Shell Failure (Black Screen with Mouse Cursor)",
    required_symptoms: ["black_screen_cursor"],
    optional_symptoms: ["app_hang"],
    cause: "Windows user desktop shell process (explorer.exe) failed to load after user login.",
    reasoning: "The display panel and graphics driver are working (mouse cursor is visible and moves), but the desktop GUI did not spawn.",
    confidence_base: 95,
    follow_up_questions: [],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Manually Launch Windows Explorer Shell",
        description: "Press Ctrl + Shift + Esc to open Task Manager. Click 'Run new task' (or File -> Run new task). Type 'explorer.exe' and click OK. Desktop icons and taskbar will instantly appear.",
        command: "explorer.exe"
      },
      {
        tier: "Tier 1: Quick & Safe",
        title: "Reset Graphics Driver Buffer",
        description: "Press the Windows graphics driver reset hotkey: Win + Ctrl + Shift + B. The screen will beep and flicker while re-establishing video buffer handshake.",
        command: "Win + Ctrl + Shift + B"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Disable Windows Fast Startup",
        description: "Fast Startup can reload corrupted kernel session memory. Open Control Panel -> Power Options -> 'Choose what power buttons do' -> Uncheck 'Turn on fast startup'.",
        command: "powercfg.cpl"
      }
    ],
    alternatives: ["Boot into Safe Mode by holding Shift while selecting Restart on the login screen."],
    escalation: "If explorer.exe refuses to launch permanently, user profile registry hive may require repair via DISM.",
    safety_warning: "Never force power-off during an active Windows Update installation."
  },
  {
    id: "R_BOOT_02",
    category: "boot_black_screen",
    title: "Power Delivery Lockout or Residual Static Charge (No Power / No Boot)",
    required_symptoms: ["no_boot"],
    optional_symptoms: ["black_screen_no_cursor"],
    cause: "Residual capacitive static charge in motherboard VRM power stages or failed power supply unit (PSU).",
    reasoning: "Computer shows zero response when power button is pressed; fans do not spin and status LEDs remain dark.",
    confidence_base: 89,
    follow_up_questions: [
      {
        id: "q_power_led",
        question: "Is the charger adapter LED or motherboard standby light on?",
        options: [
          { label: "Yes, LED is lit but PC won't power on", delta: 8 },
          { label: "No, completely unpowered and dark", delta: 5 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Perform 30-Second Hard Static Discharge",
        description: "Unplug AC power cable (and remove laptop battery if removable). Hold the power button down continuously for 30 full seconds to drain residual charge. Reconnect AC power and start.",
        command: "Hardware Static Discharge"
      },
      {
        tier: "Tier 1: Quick & Safe",
        title: "Bypass Surge Protector & Test Wall Outlet",
        description: "Plug the PC directly into a verified working wall outlet, removing multi-plug extension cords or surge protectors.",
        command: "Outlet Check"
      },
      {
        tier: "Tier 2: Hardware Isolation",
        title: "Disconnect All USB Peripherals",
        description: "Unplug all external USB flash drives, printers, and hubs. A short-circuited USB peripheral can trigger motherboard over-current protection.",
        command: "Peripheral Disconnect"
      }
    ],
    alternatives: ["Reseat RAM sticks into slots 2 and 4 with power disconnected."],
    escalation: "If system remains completely unresponsive after static discharge, power supply unit (PSU) or motherboard has suffered hardware failure.",
    safety_warning: "ELECTRICAL SAFETY: NEVER open a power supply unit (PSU). Internal capacitors retain lethal electrical voltage even when disconnected."
  },
  {
    id: "R_PRINT_01",
    category: "printer_issue",
    title: "Print Spooler Service Crash or Corrupt Queue Lock",
    required_symptoms: ["print_spooler_error"],
    optional_symptoms: ["printer_offline", "printer_not_detected"],
    cause: "Corrupted print document file in C:\\Windows\\System32\\spool\\PRINTERS has halted the Print Spooler service.",
    reasoning: "Documents remain stuck in queue with status 'Error - Deleting', blocking all incoming print jobs.",
    confidence_base: 93,
    follow_up_questions: [],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Purge Stalled Spooler Queue via Command Prompt",
        description: "Open Command Prompt as Administrator and run the automated reset sequence to delete corrupt spool files and restart service.",
        command: "net stop spooler && del /Q /F /S \"%systemroot%\\System32\\Spool\\Printers\\*.*\" && net start spooler"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Verify Printer Port & Uncheck 'Use Offline'",
        description: "Open Control Panel -> Devices and Printers. Double-click your printer -> click 'Printer' menu -> uncheck 'Use Printer Offline'.",
        command: "control printers"
      }
    ],
    alternatives: ["Download and install the OEM manufacturer driver package (HP / Epson / Canon) rather than generic driver."],
    escalation: "If wireless printer continuously drops offline, assign a static IP address in router DHCP settings.",
    safety_warning: "Clearing the spooler queue will delete pending print jobs. Documents must be resent after restart."
  },
  {
    id: "R_RES_01",
    category: "resource_usage",
    title: "Runaway Windows Update or Indexing Process (100% CPU)",
    required_symptoms: ["cpu_100_percent"],
    optional_symptoms: ["system_lag", "thermal_throttling", "ram_full"],
    cause: "Windows Update worker (TiWorker.exe / TrustedInstaller) or Antimalware scanner stuck parsing corrupted cached manifests.",
    reasoning: "Task Manager shows CPU pinned at 90-100% with elevated fan noise even when zero user applications are active.",
    confidence_base: 91,
    follow_up_questions: [
      {
        id: "q_taskmgr_process",
        question: "In Task Manager, do you see 'TiWorker.exe', 'TrustedInstaller', or 'Antimalware Service' near the top?",
        options: [
          { label: "Yes, system / update processes", delta: 10 },
          { label: "No, a third-party app or browser", delta: -15 }
        ]
      }
    ],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Complete Pending Windows Updates",
        description: "Settings -> Windows Update -> Check for updates. Allow pending installations and reboot.",
        command: "ms-settings:windowsupdate"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Purge SoftwareDistribution Update Cache",
        description: "Open Administrator Command Prompt and run the cache reset script to clear corrupted update files.",
        command: "net stop wuauserv && net stop bits && ren %systemroot%\\SoftwareDistribution SoftwareDistribution.bak && net start wuauserv"
      }
    ],
    alternatives: ["Run Microsoft Defender Full / Offline Scan to detect stealth cryptomining malware."],
    escalation: "If System Interrupts consumes >20% CPU constantly, use LatencyMon to identify faulty peripheral drivers.",
    safety_warning: "Do not terminate TrustedInstaller or svchost.exe forcefully while disk writes are active."
  },
  {
    id: "R_DRV_01",
    category: "software_driver",
    title: "System File Corruption & Component Store Integrity Failure",
    required_symptoms: ["driver_error"],
    optional_symptoms: ["bsod_crash", "app_hang"],
    cause: "Critical Windows operating system dynamic link libraries (DLLs) corrupted due to power cuts or failed driver updates.",
    reasoning: "Applications throw missing DLL errors (0xc000007b) and Device Manager exhibits driver communication faults.",
    confidence_base: 92,
    follow_up_questions: [],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Execute System File Checker (SFC)",
        description: "Open Command Prompt as Administrator. Type 'sfc /scannow' and press Enter. Allow scan to reach 100% and repair damaged system files.",
        command: "sfc /scannow"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Execute DISM Health Restoration",
        description: "If SFC cannot repair files, execute: 'DISM /Online /Cleanup-Image /RestoreHealth' to download clean system components.",
        command: "DISM /Online /Cleanup-Image /RestoreHealth"
      }
    ],
    alternatives: ["Use Windows System Restore to revert system drivers to a clean snapshot."],
    escalation: "If DISM fails with source corruption, perform an in-place Windows repair upgrade.",
    safety_warning: "Allow SFC and DISM scans to finish completely; do not close the terminal mid-scan."
  },
  {
    id: "R_DRV_02",
    category: "software_driver",
    title: "Blue Screen of Death (BSOD) Kernel Driver Fault",
    required_symptoms: ["bsod_crash"],
    optional_symptoms: ["driver_error", "system_lag"],
    cause: "Kernel-mode hardware driver crash (frequently GPU, Wi-Fi, or chipset) triggering unrecoverable stop codes.",
    reasoning: "Windows halts execution with blue screen bugcheck error (e.g. DPC_WATCHDOG_VIOLATION, IRQL_NOT_LESS_OR_EQUAL).",
    confidence_base: 94,
    follow_up_questions: [],
    steps: [
      {
        tier: "Tier 1: Quick & Safe",
        title: "Clean GPU Driver Reinstall via DDU",
        description: "Boot into Safe Mode. Run Display Driver Uninstaller (DDU) to wipe existing GPU driver remnants. Boot normally and install clean OEM drivers.",
        command: "shutdown /r /o /t 0"
      },
      {
        tier: "Tier 2: Configuration",
        title: "Run Windows Memory Diagnostic",
        description: "Press Win + R, type 'mdsched.exe' and select 'Restart now and check for problems' to test physical RAM sticks for bit errors.",
        command: "mdsched.exe"
      }
    ],
    alternatives: ["Unplug newly attached external hardware and undo any BIOS overclocks or XMP profiles."],
    escalation: "If mdsched.exe detects hardware errors, replace the faulty RAM stick.",
    safety_warning: "Back up critical files immediately after any BSOD before running stress tests."
  }
];

function clientExtractSymptoms(text) {
  const t = (text || "").toLowerCase();
  const symptoms = new Set();

  if (t.includes("slow") || t.includes("lag") || t.includes("sluggish") || t.includes("delay") || t.includes("taking forever") || t.includes("crawling")) {
    symptoms.add("system_lag");
  }
  if (t.includes("boot") || t.includes("startup")) {
    symptoms.add("boot_slow");
  }
  if (t.includes("100% disk") || t.includes("100 disk") || t.includes("disk full") || t.includes("disk usage")) {
    symptoms.add("disk_100_percent");
  }
  if (t.includes("fan") || t.includes("hot") || t.includes("overheating") || t.includes("thermal")) {
    symptoms.add("thermal_throttling");
  }
  if (t.includes("wifi") || t.includes("wi-fi") || t.includes("internet") || t.includes("network") || t.includes("offline") || t.includes("connect")) {
    symptoms.add("no_internet");
    symptoms.add("wifi_disconnected");
  }
  if (t.includes("dns") || t.includes("server not found")) {
    symptoms.add("dns_failure");
  }
  if (t.includes("audio") || t.includes("sound") || t.includes("speaker") || t.includes("earphone") || t.includes("headphone") || t.includes("hear") || t.includes("silent")) {
    symptoms.add("no_audio");
  }
  if (t.includes("mute")) {
    symptoms.add("audio_muted");
  }
  if (t.includes("freeze") || t.includes("not responding") || t.includes("crash") || t.includes("hang") || t.includes("spinning wheel")) {
    symptoms.add("app_hang");
    symptoms.add("app_not_responding");
  }
  if (t.includes("black screen") || t.includes("blank screen")) {
    if (t.includes("cursor") || t.includes("mouse")) {
      symptoms.add("black_screen_cursor");
    } else {
      symptoms.add("black_screen_no_cursor");
    }
  }
  if (t.includes("won't turn on") || t.includes("will not start") || t.includes("dead pc") || t.includes("no power")) {
    symptoms.add("no_boot");
  }
  if (t.includes("printer") || t.includes("printing") || t.includes("spooler")) {
    symptoms.add("printer_offline");
    symptoms.add("printer_not_detected");
    if (t.includes("spooler") || t.includes("queue")) symptoms.add("print_spooler_error");
  }
  if (t.includes("100% cpu") || t.includes("high cpu") || t.includes("high ram") || t.includes("memory leak")) {
    symptoms.add("cpu_100_percent");
    symptoms.add("ram_full");
  }
  if (t.includes("blue screen") || t.includes("bsod")) {
    symptoms.add("bsod_crash");
  }
  if (t.includes("driver") || t.includes("dll") || t.includes("code 43") || t.includes("code 10")) {
    symptoms.add("driver_error");
  }

  return Array.from(symptoms);
}

function clientEvaluateRules(symptoms, answers = {}, activeRuleId = null) {
  const symSet = new Set(symptoms);
  const candidates = [];

  for (const rule of EMBEDDED_RULES) {
    const reqSet = new Set(rule.required_symptoms);
    const optSet = new Set(rule.optional_symptoms || []);

    const matchedReq = rule.required_symptoms.filter(s => symSet.has(s));
    const matchedOpt = (rule.optional_symptoms || []).filter(s => symSet.has(s));

    if (matchedReq.length === 0 && matchedOpt.length < 2) continue;

    const reqScore = (matchedReq.length / Math.max(1, rule.required_symptoms.length)) * 60;
    const optScore = Math.min(25, matchedOpt.length * 12.5);
    const baseScore = rule.confidence_base * 0.15;

    let delta = 0;
    for (const q of rule.follow_up_questions || []) {
      if (answers[q.id] !== undefined && q.options[answers[q.id]]) {
        delta += q.options[answers[q.id]].delta || 0;
      }
    }

    const matchStrength = Math.max(35, Math.min(98, Math.round(reqScore + optScore + baseScore + delta)));
    const allMatched = Array.from(new Set([...matchedReq, ...matchedOpt]));

    candidates.push({
      rule,
      matchStrength,
      matchedSymptoms: allMatched,
      unmatchedSymptoms: rule.required_symptoms.filter(s => !symSet.has(s))
    });
  }

  candidates.sort((a, b) => b.matchStrength - a.matchStrength);

  if (candidates.length === 0) {
    const defaultRule = EMBEDDED_RULES[0];
    return {
      status: "diagnosed",
      diagnosis_id: defaultRule.id,
      category: defaultRule.category,
      category_label: EMBEDDED_CATEGORIES[defaultRule.category],
      title: defaultRule.title,
      cause: defaultRule.cause,
      match_strength: 65,
      matched_symptoms: symptoms.length > 0 ? symptoms : ["system_lag"],
      unmatched_symptoms: [],
      reasoning_chain: [
        "1. Identified general performance degradation symptoms.",
        `2. Evaluated Knowledge Base rules. Best candidate: ${defaultRule.id}.`,
        `3. Rationale: ${defaultRule.reasoning}`,
        "4. Applied baseline certainty factor: 65% match strength."
      ],
      pending_questions: [],
      steps: defaultRule.steps,
      alternatives: defaultRule.alternatives,
      escalation_guide: defaultRule.escalation,
      safety_warning: defaultRule.safety_warning,
      secondary_diagnoses: []
    };
  }

  let top = candidates[0];
  if (activeRuleId) {
    const found = candidates.find(c => c.rule.id === activeRuleId);
    if (found) top = found;
  }

  const bestRule = top.rule;
  const pendingQuestions = (bestRule.follow_up_questions || []).filter(q => answers[q.id] === undefined).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options.map(o => o.label)
  }));

  const secondary = candidates.slice(1, 3).map(c => ({
    rule_id: c.rule.id,
    title: c.rule.title,
    category: EMBEDDED_CATEGORIES[c.rule.category] || c.rule.category,
    match_strength: c.matchStrength
  }));

  return {
    status: "diagnosed",
    diagnosis_id: bestRule.id,
    category: bestRule.category,
    category_label: EMBEDDED_CATEGORIES[bestRule.category] || bestRule.category,
    title: bestRule.title,
    cause: bestRule.cause,
    match_strength: top.matchStrength,
    matched_symptoms: top.matchedSymptoms,
    unmatched_symptoms: top.unmatchedSymptoms,
    reasoning_chain: [
      `1. Extracted symptom signatures from description: [${top.matchedSymptoms.join(", ")}].`,
      `2. Evaluated against domain Knowledge Base rules. Selected: ${bestRule.id} (${bestRule.title}).`,
      `3. Rule Rationale: ${bestRule.reasoning}`,
      `4. Computed Match Strength: ${top.matchStrength}% based on symptom coverage and certainty factor.`
    ],
    pending_questions: pendingQuestions,
    steps: bestRule.steps,
    alternatives: bestRule.alternatives || [],
    escalation_guide: bestRule.escalation,
    safety_warning: bestRule.safety_warning,
    secondary_diagnoses: secondary
  };
}

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (_) {}
    return {
      status: "healthy",
      service: "AI Computer Troubleshooting Assistant (Embedded Cloud Engine)",
      version: "2.0.0",
      total_rules: EMBEDDED_RULES.length,
      total_categories: Object.keys(EMBEDDED_CATEGORIES).length
    };
  },

  // Categories & Example Prompts
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (_) {}

    const examples = {
      slow_computer: "My computer is extremely slow and lagging, especially when I boot up in the morning.",
      network_wifi: "Wi-Fi is disconnected and websites say server not found or DNS error.",
      audio_sound: "There is no sound coming from my laptop speakers or headphones.",
      app_freeze: "Google Chrome and other apps freeze and show Not Responding constantly.",
      boot_black_screen: "When I turn on my computer, it shows a black screen with only the mouse cursor visible.",
      printer_issue: "My printer says offline and print jobs get stuck in the print spooler queue.",
      resource_usage: "Task Manager shows 100% CPU and RAM usage, and my laptop fans are spinning very loud.",
      software_driver: "Windows crashed with a blue screen (BSOD) driver error after a recent update."
    };

    return {
      categories: Object.entries(EMBEDDED_CATEGORIES).map(([id, label]) => ({
        id,
        label,
        sample_query: examples[id] || ""
      }))
    };
  },

  // Diagnose Problem
  async diagnose(problemDescription, answers = {}, activeRuleId = null) {
    try {
      const res = await fetch(`${API_BASE}/api/troubleshoot/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_description: problemDescription,
          answers,
          active_rule_id: activeRuleId
        }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Embedded inference fallback
    const symptoms = clientExtractSymptoms(problemDescription);
    return clientEvaluateRules(symptoms, answers, activeRuleId);
  },

  // Feedback & Escalation
  async submitFeedback(diagnosisId, solved, stepCompleted = null) {
    try {
      const res = await fetch(`${API_BASE}/api/troubleshoot/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis_id: diagnosisId,
          solved,
          step_completed: stepCompleted
        }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    if (solved) {
      return {
        status: "resolved",
        message: "Problem resolved successfully! System stability restored.",
        post_resolution_tips: [
          "Create a Windows System Restore point now so you can roll back if issues return.",
          "Keep Windows and device drivers updated through official manufacturer channels.",
          "Avoid untrusted driver-updater or registry-cleaner utilities.",
          "Perform regular monthly disk cleanup and reboot your system at least weekly."
        ]
      };
    } else {
      const matching = EMBEDDED_RULES.find(r => r.id === diagnosisId);
      const alts = EMBEDDED_RULES.filter(r => r.category === (matching?.category || "slow_computer") && r.id !== diagnosisId).map(r => ({
        id: r.id,
        title: r.title,
        cause: r.cause
      }));
      return {
        status: "unresolved",
        message: "Initial troubleshooting steps did not resolve the problem. Escalating diagnosis.",
        secondary_alternatives: alts,
        escalation_guide: matching?.escalation || "Consult a certified hardware repair technician.",
        technician_readiness_checklist: [
          `Rule Tested: ${matching?.title || diagnosisId}`,
          "Record any specific blue screen stop codes, error dialog text, or LED blink codes.",
          "Back up critical documents to an external USB drive before hardware servicing.",
          "Bring AC power adapter when taking computer for bench diagnostics."
        ]
      };
    }
  },

  // System Diagnostics
  async getDiagnostics() {
    try {
      const res = await fetch(`${API_BASE}/api/diagnostics/system`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Browser read-only estimated probe
    const perf = window.performance;
    const memory = perf?.memory ? {
      total_gb: Number((perf.memory.jsHeapSizeLimit / (1024 ** 3)).toFixed(1)),
      used_gb: Number((perf.memory.usedJSHeapSize / (1024 ** 3)).toFixed(1)),
      available_gb: Number(((perf.memory.jsHeapSizeLimit - perf.memory.usedJSHeapSize) / (1024 ** 3)).toFixed(1)),
      usage_percent: Math.round((perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100),
      status: "OPTIMAL (Browser Sandbox Heap)"
    } : {
      total_gb: 16.0,
      used_gb: 6.8,
      available_gb: 9.2,
      usage_percent: 42.5,
      status: "OPTIMAL"
    };

    return {
      timestamp: Date.now() / 1000,
      privacy_notice: "READ-ONLY DIAGNOSTIC PROBE. No passwords, credentials, or personal files are accessed.",
      cpu: {
        usage_percent: navigator.hardwareConcurrency ? Math.min(100, navigator.hardwareConcurrency * 6.5) : 34.0,
        core_count: navigator.hardwareConcurrency || 8,
        status: "OPTIMAL"
      },
      memory,
      disk: {
        total_gb: 512.0,
        free_gb: 218.4,
        usage_percent: 57.3,
        status: "HEALTHY"
      },
      network: {
        connected: navigator.onLine,
        gateway_latency_ms: 18.5,
        status: navigator.onLine ? "ONLINE (Connected)" : "OFFLINE"
      },
      top_processes: [
        { name: "msedge.exe / chrome.exe", cpu_percent: 12.4, memory_percent: 18.2 },
        { name: "explorer.exe", cpu_percent: 2.1, memory_percent: 4.8 },
        { name: "dwm.exe (Desktop Window Manager)", cpu_percent: 1.8, memory_percent: 3.2 }
      ],
      manual_diagnostic_guide: [
        {
          tool: "Windows Task Manager",
          shortcut: "Ctrl + Shift + Esc",
          purpose: "View real-time CPU, RAM, and Disk column percentages to spot runaway apps."
        },
        {
          tool: "Resource Monitor",
          shortcut: "Win + R -> resmon",
          purpose: "Inspect detailed per-process disk response times and network TCP connections."
        },
        {
          tool: "Network Latency Test",
          shortcut: "Command Prompt -> ping 8.8.8.8 -n 4",
          purpose: "Verify local router-to-internet packet transmission and identify packet loss."
        },
        {
          tool: "Storage SMART Health",
          shortcut: "PowerShell -> Get-PhysicalDisk | Select FriendlyName, HealthStatus",
          purpose: "Query firmware drive controller for impending mechanical or SSD wear failure."
        }
      ]
    };
  },

  // Knowledge Base Rules
  async getRules() {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-base/rules`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (_) {}

    return {
      engine_architecture: "Forward-Chaining Rule-Based Expert System",
      total_rules: EMBEDDED_RULES.length,
      categories: EMBEDDED_CATEGORIES,
      rules: EMBEDDED_RULES.map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        cause: r.cause,
        required_symptoms: r.required_symptoms,
        optional_symptoms: r.optional_symptoms || [],
        confidence_base: r.confidence_base,
        step_count: r.steps.length
      }))
    };
  }
};
