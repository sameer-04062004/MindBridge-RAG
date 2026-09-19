import re
from typing import Dict, Any

CRISIS_PATTERNS = [
    r"\bkill myself\b", r"\bkilling myself\b", r"\bend my life\b", r"\bending my life\b",
    r"\bend it all\b", r"\btake my (own )?life\b", r"\bsuicid", r"\bself[- ]?harm",
    r"\bhurt myself\b", r"\bhurting myself\b", r"\bharm myself\b", r"\bharming myself\b",
    r"\bwant to die\b", r"\bdon'?t want to (live|be here)\b", r"\bcan'?t go on\b",
    r"\bno reason to live\b", r"\bbetter off (dead|without me)\b",
]

MEDICAL_PATTERNS = [
    r"\bdiagnos", r"\bmedication\b", r"\bmedicine\b", r"\bprescri", r"\bdosage\b",
    r"\bpills?\b", r"\bantidepressant", r"\bmental illness\b", r"\bdisorder\b",
    r"\bclinical\b", r"\btreatment\b", r"\bwhat (do|should) i take\b",
]

DISTRESS_PATTERNS = [
    r"\bhopeless\b", r"\boverwhelmed\b", r"\bcan'?t cope\b", r"\bcan'?t (sleep|eat)\b",
    r"\bgiving up\b", r"\bgive up\b", r"\bbreaking down\b", r"\bfalling apart\b",
    r"\bcan'?t take (it|this) anymore\b", r"\bnothing matters\b", r"\bexhausted all the time\b",
    r"\bcan'?t do this anymore\b",
]

STRESS_PATTERNS = [
    r"\bnervous\b", r"\banxious\b", r"\banxiety\b", r"\bstress", r"\bworried\b", r"\bworry\b",
    r"\bpanic", r"\bprocrastinat", r"\bmotivation\b", r"\bunmotivated\b", r"\bpressure\b",
    r"\bmind goes blank\b", r"\bgo(es)? blank\b", r"\bperfection", r"\bguilty\b",
    r"\bafraid\b", r"\bscared\b", r"\bfail\b", r"\bcomparing\b", r"\bcomparison\b",
    r"\bgiving up on my degree\b",
]

SUPPORT_VOCAB = [
    "exam", "study", "studying", "revise", "revision", "notes", "note", "timetable",
    "sleep", "focus", "concentrat", "break", "motivat", "test", "paper", "learn",
    "grade", "class", "lecture", "assignment", "prepare", "preparation", "schedule",
    "stress", "anxiet", "nervous", "cope", "coping", "wellbeing", "counsel", "degree",
    "deadline", "procrastinat", "memor", "burnout", "tired", "rest",
]

CRISIS_MESSAGE = (
    "I'm really sorry you're feeling this way, and I'm glad you reached out. "
    "Your safety matters most right now. Please contact a local emergency number "
    "or a suicide prevention helpline immediately, and reach out to someone you "
    "trust so you don't have to be alone. You deserve support from a real person "
    "who can help you through this."
)

MEDICAL_MESSAGE = (
    "I'm not able to diagnose conditions or advise on medication - that needs a "
    "qualified health professional. Ongoing or severe stress is worth taking "
    "seriously, so please speak with a doctor, your campus health centre, or your "
    "university counselling service. They can properly assess things and discuss "
    "any options with you."
)

OUT_OF_SCOPE_MESSAGE = (
    "That's outside what I'm here for - I focus on exam stress, study skills, and "
    "student wellbeing. If there's anything about studying or coping with exam "
    "pressure I can help with, just let me know."
)

DISTRESS_SUPPORT_NOTE = (
    " You don't have to handle this alone - your university counselling or "
    "wellbeing service offers free, confidential support, and reaching out to "
    "them can really help."
)

STRESS_SUPPORT_NOTE = (
    " If exam stress starts to feel like too much, remember that talking to a "
    "counsellor or someone you trust is always okay."
)

RISK_METADATA: Dict[str, Dict[str, Any]] = {
    "L0_NORMAL": {
        "label": "General Study Support",
        "level": 0,
        "badge_color": "emerald",
        "description": "Standard study guidance & wellbeing tips"
    },
    "L1_STRESS": {
        "label": "Exam Stress Detected",
        "level": 1,
        "badge_color": "blue",
        "description": "Mild to moderate stress handled with reassurance and grounding"
    },
    "L2_DISTRESS": {
        "label": "High Distress Detected",
        "level": 2,
        "badge_color": "amber",
        "description": "Student is feeling overwhelmed; university counselling note appended"
    },
    "L3_CRISIS": {
        "label": "Crisis Escalation",
        "level": 3,
        "badge_color": "rose",
        "description": "Immediate intervention: LLM bypassed, emergency helpline resources provided"
    },
    "L4_MEDICAL": {
        "label": "Medical / Clinical Query",
        "level": 4,
        "badge_color": "purple",
        "description": "Diagnostic or medication query redirected to certified healthcare provider"
    },
    "L5_OUT_OF_SCOPE": {
        "label": "Out of Scope",
        "level": 5,
        "badge_color": "gray",
        "description": "Query not related to exam stress, academic skills, or wellbeing"
    }
}

def _matches(patterns, text: str) -> bool:
    return any(re.search(p, text) for p in patterns)

def classify_risk(message: str) -> str:
    text = message.lower()
    if _matches(CRISIS_PATTERNS, text):
        return "L3_CRISIS"
    if _matches(MEDICAL_PATTERNS, text):
        return "L4_MEDICAL"
    if _matches(DISTRESS_PATTERNS, text):
        return "L2_DISTRESS"
    if _matches(STRESS_PATTERNS, text):
        return "L1_STRESS"
    if any(w in text for w in SUPPORT_VOCAB):
        return "L0_NORMAL"
    return "L5_OUT_OF_SCOPE"

