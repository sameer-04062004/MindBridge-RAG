import { CHUNKS, SOURCES } from '../data/corpusData';

// --- Deterministic Regex Patterns (Identical to backend/core/safety.py) ---
const CRISIS_PATTERNS = [
  /\bkill myself\b/i, /\bkilling myself\b/i, /\bend my life\b/i, /\bending my life\b/i,
  /\bend it all\b/i, /\btake my (own )?life\b/i, /\bsuicid/i, /\bself[- ]?harm/i,
  /\bhurt myself\b/i, /\bhurting myself\b/i, /\bharm myself\b/i, /\bharming myself\b/i,
  /\bwant to die\b/i, /\bdon'?t want to (live|be here)\b/i, /\bcan'?t go on\b/i,
  /\bno reason to live\b/i, /\bbetter off (dead|without me)\b/i,
];

const MEDICAL_PATTERNS = [
  /\bdiagnos/i, /\bmedication\b/i, /\bmedicine\b/i, /\bprescri/i, /\bdosage\b/i,
  /\bpills?\b/i, /\bantidepressant/i, /\bmental illness\b/i, /\bdisorder\b/i,
  /\bclinical\b/i, /\btreatment\b/i, /\bwhat (do|should) i take\b/i,
];

const DISTRESS_PATTERNS = [
  /\bhopeless\b/i, /\boverwhelmed\b/i, /\bcan'?t cope\b/i, /\bcan'?t (sleep|eat)\b/i,
  /\bgiving up\b/i, /\bgive up\b/i, /\bbreaking down\b/i, /\bfalling apart\b/i,
  /\bcan'?t take (it|this) anymore\b/i, /\bnothing matters\b/i, /\bexhausted all the time\b/i,
  /\bcan'?t do this anymore\b/i,
];

const STRESS_PATTERNS = [
  /\bnervous\b/i, /\banxious\b/i, /\banxiety\b/i, /\bstress/i, /\bworried\b/i, /\bworry\b/i,
  /\bpanic/i, /\bprocrastinat/i, /\bmotivation\b/i, /\bunmotivated\b/i, /\bpressure\b/i,
  /\bmind goes blank\b/i, /\bgo(es)? blank\b/i, /\bperfection/i, /\bguilty\b/i,
  /\bafraid\b/i, /\bscared\b/i, /\bfail\b/i, /\bcomparing\b/i, /\bcomparison\b/i,
  /\bgiving up on my degree\b/i,
];

const SUPPORT_VOCAB = [
  "exam", "study", "studying", "revise", "revision", "notes", "note", "timetable",
  "sleep", "focus", "concentrat", "break", "motivat", "test", "paper", "learn",
  "grade", "class", "lecture", "assignment", "prepare", "preparation", "schedule",
  "stress", "anxiet", "nervous", "cope", "coping", "wellbeing", "counsel", "degree",
  "deadline", "procrastinat", "memor", "burnout", "tired", "rest",
];

const CRISIS_MESSAGE = (
  "I'm really sorry you're feeling this way, and I'm glad you reached out. " +
  "Your safety matters most right now. Please contact a local emergency number " +
  "or a suicide prevention helpline immediately, and reach out to someone you " +
  "trust so you don't have to be alone. You deserve support from a real person " +
  "who can help you through this."
);

const MEDICAL_MESSAGE = (
  "I'm not able to diagnose conditions or advise on medication - that needs a " +
  "qualified health professional. Ongoing or severe stress is worth taking " +
  "seriously, so please speak with a doctor, your campus health centre, or your " +
  "university counselling service. They can properly assess things and discuss " +
  "any options with you."
);

const OUT_OF_SCOPE_MESSAGE = (
  "That's outside what I'm here for - I focus on exam stress, study skills, and " +
  "student wellbeing. If there's anything about studying or coping with exam " +
  "pressure I can help with, just let me know."
);

const DISTRESS_SUPPORT_NOTE = (
  " You don't have to handle this alone - your university counselling or " +
  "wellbeing service offers free, confidential support, and reaching out to " +
  "them can really help."
);

const STRESS_SUPPORT_NOTE = (
  " If exam stress starts to feel like too much, remember that talking to a " +
  "counsellor or someone you trust is always okay."
);

export const RISK_METADATA = {
  "L0_NORMAL": {
    label: "General Study Support",
    badge_color: "emerald",
    description: "Standard study guidance & wellbeing tips"
  },
  "L1_STRESS": {
    label: "Exam Stress Detected",
    badge_color: "blue",
    description: "Mild to moderate stress handled with reassurance and grounding"
  },
  "L2_DISTRESS": {
    label: "High Distress Detected",
    badge_color: "amber",
    description: "Student is feeling overwhelmed; university counselling note appended"
  },
  "L3_CRISIS": {
    label: "Crisis Escalation",
    badge_color: "rose",
    description: "Immediate intervention: LLM bypassed, emergency helpline resources provided"
  },
  "L4_MEDICAL": {
    label: "Medical / Clinical Query",
    badge_color: "purple",
    description: "Diagnostic or medication query redirected to certified healthcare provider"
  },
  "L5_OUT_OF_SCOPE": {
    label: "Out of Scope",
    badge_color: "gray",
    description: "Query not related to exam stress, academic skills, or wellbeing"
  }
};

export function classifyRisk(message) {
  const text = message.toLowerCase();
  if (CRISIS_PATTERNS.some(p => p.test(text))) return "L3_CRISIS";
  if (MEDICAL_PATTERNS.some(p => p.test(text))) return "L4_MEDICAL";
  if (DISTRESS_PATTERNS.some(p => p.test(text))) return "L2_DISTRESS";
  if (STRESS_PATTERNS.some(p => p.test(text))) return "L1_STRESS";
  if (SUPPORT_VOCAB.some(w => text.includes(w))) return "L0_NORMAL";
  return "L5_OUT_OF_SCOPE";
}

// --- TF-IDF Style Retriever ---
function tokenize(text) {
  return (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

const docTokens = CHUNKS.map(c => tokenize(`${c.title} ${c.text}`));
const docCount = CHUNKS.length;

// Compute DF
const df = {};
docTokens.forEach(tokens => {
  const unique = new Set(tokens);
  unique.forEach(t => {
    df[t] = (df[t] || 0) + 1;
  });
});

export function retrieveChunks(query, topK = 3) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];

  const scores = CHUNKS.map((chunk, idx) => {
    const tokens = docTokens[idx];
    const tokenCounts = {};
    tokens.forEach(t => { tokenCounts[t] = (tokenCounts[t] || 0) + 1; });

    let score = 0;
    qTokens.forEach(t => {
      if (tokenCounts[t]) {
        const idf = Math.log((docCount + 1) / ((df[t] || 0) + 1)) + 1;
        const tf = tokenCounts[t] / tokens.length;
        score += tf * idf;
      }
    });

    const src = SOURCES[chunk.source_id] || {};
    return {
      chunk_id: chunk.chunk_id,
      score: Math.min(1.0, score * 10),
      title: chunk.title,
      topic: chunk.topic,
      category: chunk.category,
      risk_level: chunk.risk_level,
      text: chunk.text,
      source_id: chunk.source_id,
      source_title: src.title || "Vetted Wellbeing Guide",
      source_reference: src.reference || ""
    };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

// --- Mock LLM Tip Bank (for S0 Baseline) ---
const TIP_BANK = {
  sleep: "Try to get enough sleep and keep a steady sleep routine, avoiding screens an hour before bed.",
  time: "Make a prioritized revision timetable and tackle one study session at a time.",
  study: "Use active recall and spaced repetition, and take regular 5-10 minute breaks.",
  nervous: "Try the 4-7-8 breathing exercise to calm your sympathetic nervous system.",
  stress: "Take slow deep breaths, hydrate, and remind yourself that an exam measures preparation, not your worth.",
  motivation: "Break large goals into 25-minute Pomodoro sprints and celebrate small wins.",
  panic: "Ground yourself with the 5-4-3-2-1 technique: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
  default: "Stay organised, maintain realistic goals, take regular breaks, and be kind to yourself."
};

function generateS0Answer(query) {
  const q = query.toLowerCase();
  const tips = [];
  for (const [k, tip] of Object.entries(TIP_BANK)) {
    if (k !== 'default' && q.includes(k) && !tips.includes(tip)) {
      tips.push(tip);
    }
  }
  if (!tips.length) tips.push(TIP_BANK.default);
  return "Here are a few suggestions to help: " + tips.join(' ');
}

function generateGroundedAnswer(chunks) {
  if (!chunks.length) return TIP_BANK.default;
  const excerpts = chunks.map(c => {
    const sentences = c.text.split(/(?<=[.!?])\s+/);
    return sentences.slice(0, 2).join(' ') || c.text;
  });
  return "Based on vetted student guidance: " + excerpts.join(' ');
}

// --- MindBridge Unified Client Engine ---
export async function runClientChat(message, systemType = "S2") {
  const start = performance.now();
  const risk = classifyRisk(message);
  const sys = (systemType || 'S2').toUpperCase();

  let text = "";
  let chunks = [];

  if (sys === "S0") {
    text = generateS0Answer(message);
  } else if (sys === "S1") {
    chunks = retrieveChunks(message, 3);
    text = generateGroundedAnswer(chunks);
  } else {
    // S2: Safety-Aware RAG
    if (risk === "L3_CRISIS") {
      text = CRISIS_MESSAGE;
      chunks = [{
        chunk_id: "C016",
        score: 1.0,
        title: "Crisis Escalation Protocol",
        topic: "Crisis Support",
        risk_level: "L3",
        text: CRISIS_MESSAGE,
        source_title: "Emergency Services / Suicide Prevention Helpline",
        source_reference: "National Emergency Helpline Protocol"
      }];
    } else if (risk === "L4_MEDICAL") {
      text = MEDICAL_MESSAGE;
    } else if (risk === "L5_OUT_OF_SCOPE") {
      text = OUT_OF_SCOPE_MESSAGE;
    } else {
      chunks = retrieveChunks(message, 3);
      text = generateGroundedAnswer(chunks);
      if (risk === "L2_DISTRESS") {
        text += DISTRESS_SUPPORT_NOTE;
      } else if (risk === "L1_STRESS") {
        text += STRESS_SUPPORT_NOTE;
      }
    }
  }

  const elapsed = Math.round((performance.now() - start) / 10) / 100;

  return {
    system: sys,
    text,
    risk_label: risk,
    risk_meta: RISK_METADATA[risk] || RISK_METADATA.L0_NORMAL,
    response_time: elapsed,
    retrieved_chunk_ids: chunks.map(c => c.chunk_id),
    retrieved_chunks: chunks
  };
}

export async function runClientCompare(query) {
  const risk = classifyRisk(query);
  const r0 = await runClientChat(query, "S0");
  const r1 = await runClientChat(query, "S1");
  const r2 = await runClientChat(query, "S2");

  return {
    query,
    detected_risk: risk,
    risk_meta: RISK_METADATA[risk] || RISK_METADATA.L0_NORMAL,
    results: {
      S0: {
        system_type: "S0",
        title: "Base LLM (S0)",
        text: r0.text,
        response_time: r0.response_time,
        retrieved_chunk_ids: r0.retrieved_chunk_ids,
        retrieved_chunks: r0.retrieved_chunks,
        grounded: false,
        safety_layer: false
      },
      S1: {
        system_type: "S1",
        title: "Grounded RAG (S1)",
        text: r1.text,
        response_time: r1.response_time,
        retrieved_chunk_ids: r1.retrieved_chunk_ids,
        retrieved_chunks: r1.retrieved_chunks,
        grounded: true,
        safety_layer: false
      },
      S2: {
        system_type: "S2",
        title: "Safety-Aware RAG (S2)",
        text: r2.text,
        response_time: r2.response_time,
        retrieved_chunk_ids: r2.retrieved_chunk_ids,
        retrieved_chunks: r2.retrieved_chunks,
        risk_label: r2.risk_label,
        grounded: true,
        safety_layer: true
      }
    }
  };
}

