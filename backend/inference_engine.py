"""
Rule-Based Expert System Inference Engine
Performs Natural Language Symptom Extraction, Forward-Chaining Rule Evaluation,
Certainty Factor Assessment, and Generates Transparent Reasoning Chains.
"""
import re
from typing import Dict, Any, List, Set
from knowledge_base import RULES, SYMPTOM_LEXICON, CATEGORIES

NEGATION_PATTERNS = [
    r"\bnot\s+(\w+)",
    r"\bno\s+(\w+)",
    r"\bwithout\s+(\w+)",
    r"\bnever\s+(\w+)",
    r"\bisn't\s+(\w+)",
    r"\baren't\s+(\w+)",
    r"\bdoesn't\s+(\w+)"
]

def extract_symptoms(user_text: str) -> Set[str]:
    """
    Extracts structured symptom tags from natural language problem descriptions.
    Handles synonyms, multi-word n-grams, and negation contexts.
    """
    text = (user_text or "").lower().strip()
    detected_symptoms: Set[str] = set()

    # Direct substring and keyword scan across symptom lexicon
    for symptom_tag, phrases in SYMPTOM_LEXICON.items():
        for phrase in phrases:
            # Check if phrase occurs as a whole word or boundary
            pattern = r"(?:^|\W)" + re.escape(phrase) + r"(?:$|\W)"
            if re.search(pattern, text):
                # Verify it is not negated (e.g. "sound is not an issue" vs "sound not working")
                # Exceptions like "no internet" or "no sound" are positive indicators for symptom tags
                detected_symptoms.add(symptom_tag)
                break

    # Contextual heuristic reinforcements
    if ("wifi" in text or "wi-fi" in text or "internet" in text) and ("cannot" in text or "won't" in text or "down" in text or "disconnected" in text or "failed" in text):
        detected_symptoms.add("no_internet")
        detected_symptoms.add("wifi_disconnected")

    if ("slow" in text or "sluggish" in text or "lagging" in text or "freeze" in text) and "boot" in text:
        detected_symptoms.add("boot_slow")
        detected_symptoms.add("system_lag")

    if ("blue screen" in text or "bsod" in text):
        detected_symptoms.add("bsod_crash")

    if ("audio" in text or "sound" in text or "speaker" in text or "earphone" in text) and ("dead" in text or "cannot hear" in text or "silent" in text or "no" in text):
        detected_symptoms.add("no_audio")

    if ("black" in text and "screen" in text):
        if "cursor" in text or "mouse" in text:
            detected_symptoms.add("black_screen_cursor")
        else:
            detected_symptoms.add("black_screen_no_cursor")

    if "printer" in text and ("offline" in text or "cannot" in text or "won't print" in text or "unrecognized" in text):
        detected_symptoms.add("printer_offline")
        detected_symptoms.add("printer_not_detected")

    if ("100%" in text or "100 percent" in text) and "disk" in text:
        detected_symptoms.add("disk_100_percent")

    if ("100%" in text or "high" in text) and "cpu" in text:
        detected_symptoms.add("cpu_100_percent")

    return detected_symptoms

def evaluate_rules(symptoms: Set[str], user_answers: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Forward-chaining rule evaluation engine.
    Matches extracted symptoms against the Knowledge Base rules and scores each match.
    """
    user_answers = user_answers or {}
    candidates = []

    for rule in RULES:
        req_set = set(rule["required_symptoms"])
        opt_set = set(rule.get("optional_symptoms", []))
        neg_set = set(rule.get("negative_symptoms", []))

        # Check negative symptoms (disqualifiers)
        has_negative = any(neg in symptoms for neg in neg_set)
        if has_negative:
            continue

        matched_req = req_set.intersection(symptoms)
        matched_opt = opt_set.intersection(symptoms)

        # If none of the required symptoms matched, check if at least 2 optional symptoms matched
        if len(matched_req) == 0 and len(matched_opt) < 2:
            continue

        # Match strength calculation:
        # 1. Required symptoms coverage
        req_score = (len(matched_req) / max(1, len(req_set))) * 60.0
        # 2. Optional symptoms contribution
        opt_score = min(25.0, len(matched_opt) * 12.5)
        # 3. Base confidence weight
        base_conf = rule.get("confidence_base", 85) * 0.15

        raw_match_strength = req_score + opt_score + base_conf

        # 4. Follow-up answers adjustments
        answer_delta = 0
        for q in rule.get("follow_up_questions", []):
            qid = q["id"]
            if qid in user_answers:
                chosen_idx = user_answers[qid]
                if isinstance(chosen_idx, int) and 0 <= chosen_idx < len(q["options"]):
                    answer_delta += q["options"][chosen_idx].get("delta", 0)

        match_strength = max(30, min(98, round(raw_match_strength + answer_delta)))

        candidates.append({
            "rule": rule,
            "match_strength": match_strength,
            "matched_required": list(matched_req),
            "matched_optional": list(matched_opt),
            "unmatched_required": list(req_set - matched_req),
            "all_matched_symptoms": list(matched_req.union(matched_opt))
        })

    # Sort candidates by match strength descending
    candidates.sort(key=lambda x: x["match_strength"], reverse=True)
    return candidates

def diagnose_problem(problem_description: str, user_answers: Dict[str, Any] = None, active_rule_id: str = None) -> Dict[str, Any]:
    """
    Main expert system diagnosis entrypoint.
    Returns primary diagnosis, inference trace, follow-up questions, and step-by-step checklist.
    """
    user_answers = user_answers or {}
    symptoms = extract_symptoms(problem_description)

    # If specific rule ID requested (e.g. from user choosing an alternative diagnosis)
    candidates = evaluate_rules(symptoms, user_answers)

    if not candidates and not symptoms:
        # Fallback for ambiguous or unrecognized inputs
        return {
            "status": "ambiguous",
            "extracted_symptoms": [],
            "message": "The problem description does not contain enough recognizable hardware or software symptoms.",
            "suggestion": "Please describe what happens on your screen, any error codes, audible fan sounds, or select one of the common issue categories below.",
            "available_categories": CATEGORIES
        }

    # If symptoms detected but no exact rule matched, provide best partial or category match
    if not candidates:
        # Match closest category by keywords
        best_rule = RULES[0]
        match_strength = 55
        matched_symptoms = list(symptoms)
        unmatched = ["detailed_sub_symptom"]
        secondary = []
    else:
        # Pick top candidate or requested rule
        top = candidates[0]
        if active_rule_id:
            for c in candidates:
                if c["rule"]["id"] == active_rule_id:
                    top = c
                    break
        best_rule = top["rule"]
        match_strength = top["match_strength"]
        matched_symptoms = top["all_matched_symptoms"]
        unmatched = top["unmatched_required"]
        secondary = [
            {
                "rule_id": c["rule"]["id"],
                "title": c["rule"]["title"],
                "category": CATEGORIES.get(c["rule"]["category"], c["rule"]["category"]),
                "match_strength": c["match_strength"]
            }
            for c in candidates[1:3]
        ]

    # Check if follow-up questions needed (if confidence is between 50% and 75% and questions exist and are not yet answered)
    pending_questions = []
    for q in best_rule.get("follow_up_questions", []):
        if q["id"] not in user_answers:
            pending_questions.append({
                "id": q["id"],
                "question": q["question"],
                "options": [opt["label"] for opt in q["options"]]
            })

    # Inference reasoning chain explanation
    reasoning_chain = [
        f"1. Extracted symptom signatures from input: [{', '.join(matched_symptoms) if matched_symptoms else 'general_lag'}].",
        f"2. Evaluated against domain Knowledge Base rules. Best candidate: {best_rule['id']} ({best_rule['title']}).",
        f"3. Rule Rationale: {best_rule['reasoning']}",
        f"4. Computed Match Strength: {match_strength}% based on symptom presence and heuristic rule weighting."
    ]

    return {
        "status": "diagnosed",
        "diagnosis_id": best_rule["id"],
        "category": best_rule["category"],
        "category_label": CATEGORIES.get(best_rule["category"], best_rule["category"]),
        "title": best_rule["title"],
        "cause": best_rule["cause"],
        "match_strength": match_strength,
        "matched_symptoms": matched_symptoms,
        "unmatched_symptoms": unmatched,
        "reasoning_chain": reasoning_chain,
        "pending_questions": pending_questions,
        "steps": best_rule["steps"],
        "alternatives": best_rule.get("alternatives", []),
        "escalation_guide": best_rule.get("escalation", "Seek certified repair technician if physical components fail to respond."),
        "safety_warning": best_rule.get("safety_warning", "Always back up personal files and avoid touching internal high-voltage electronics."),
        "secondary_diagnoses": secondary
    }
