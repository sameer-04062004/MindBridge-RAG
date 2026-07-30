# Group Report: MindBridge-RAG

## Group Information

**Group ID:** G01  
**Assigned Topic:** Student Exam-Stress Management (RAG-based support chatbot)  
**Submission Date:** _________  

## Members

1. Name: Muhammad Sameer | Roll No: 22002376013 | Role: Corpus & sources lead
2. Name: Muhammad Tayyab | Roll No: 22002376006 | Role: RAG / retrieval engineer
3. Name: Syed Taha Rizvi | Roll No: 22002376004 | Role: Safety & risk-labelling lead
4. Name: Ali musa Raza   | Roll No: 22002376012 | Role: Evaluation & report lead

## 1. Topic Summary

Our topic is **exam-stress management for students**. Around exam periods many
students experience stress, anxiety, sleep disruption, and low motivation. A
chatbot that gives safe, practical, evidence-informed study and coping tips —
and that knows when to step back and direct a student to a human — can provide
low-pressure, always-available first-line support. The key challenge is
**safety**: a student-wellbeing assistant must never give medical or diagnostic
advice and must escalate crisis situations to real help. Our project shows how
adding a safety layer to a RAG system addresses exactly this.

## 2. Sources Used

We used **3 safe, general, public sources**. No private student stories, no
clinical/medical material.

| Source ID | Source Title | Source Type | Why Used |
|---|---|---|---|
| S001 | WHO – Doing What Matters in Times of Stress (public guidance) | Web article | General stress-management, breathing and grounding techniques suitable for students |
| S002 | University Student Counselling Service – Exam Stress Self-Help Guide | Guide | Student-focused, safe guidance on coping with exam stress and when to seek human support |
| S003 | Academic Skills Centre – Study Strategies & Time Management Guide | Guide | Practical study techniques, time management, and exam-preparation strategies |

## 3. Corpus Summary

**Total corpus chunks created:** 30

Each chunk is a short, self-contained, student-support passage with metadata:
topic, category, risk level, an `allowed_use` and a `blocked_use` note, and its
source. Categories include study skills (active recall, timetabling, Pomodoro,
note-taking, past papers), coping skills (slow breathing, grounding, reframing
thoughts, self-compassion), healthy habits (sleep, routine, balance), and
support/escalation (when to reach out, counselling services, and a single safe
crisis-support chunk). Most chunks are `L0_NORMAL`/`L1_STRESS`; a few are
`L2_DISTRESS`; one is `L3_CRISIS` (safe escalation only).

## 4. Benchmark Questions Summary

**Total benchmark questions created:** 30

| Difficulty | Count |
|---|---:|
| Easy | 12 |
| Medium | 11 |
| Difficult / Safety-sensitive | 7 |

## 5. Risk Label Summary

| Risk Label | Count |
|---|---:|
| L0_NORMAL | 10 |
| L1_STRESS | 11 |
| L2_DISTRESS | 3 |
| L3_CRISIS | 2 |
| L4_MEDICAL | 2 |
| L5_OUT_OF_SCOPE | 2 |

## 6. Model Testing Summary

We tested **5 questions** spanning the risk spectrum (L0, L1, L2, L3, L4) on each
system, giving **15 evaluated responses** in total.

| System | Count Tested |
|---|---:|
| S0: Basic chatbot without RAG | 5 |
| S1: Basic RAG | 5 |
| S2: Safety-aware RAG | 5 |

## 7. Human Evaluation Summary

Scores are on a 1–5 scale. Automatic starter scores were generated from the ideal
answers and risk labels, then reviewed. The averages below are across all tested
questions; the per-system breakdown is the key result.

> These figures come from running the notebook on **Google Colab using Google's
> Gemini model** (via the built-in `google.colab.ai` library) as the LLM for all
> three systems. Because that base model is itself safety-aligned,
> S0 and S1 also avoided unsafe answers here (see Observations); the safety layer's
> value shows up as *guaranteed*, model-independent escalation rather than a raw
> unsafe-count gap.

**Per-system averages (1–5):**

| System | Relevance | Helpfulness | Faithfulness | Safety | Clarity | Unsafe responses |
|---|---:|---:|---:|---:|---:|---:|
| S0 (no RAG) | 5.00 | 4.40 | 3.80 | 5.00 | 4.00 | 0 / 5 |
| S1 (basic RAG) | 4.40 | 4.40 | 4.80 | 5.00 | 5.00 | 0 / 5 |
| S2 (safety-aware RAG) | 4.20 | 4.20 | 4.80 | 5.00 | 5.00 | 0 / 5 |

**Overall average across all 15 responses:**

| Metric | Average Score |
|---|---:|
| Relevance | 4.53 |
| Helpfulness | 4.33 |
| Faithfulness | 4.47 |
| Safety | 5.00 |
| Clarity | 4.67 |

## 8. Key Observations

1. **A safety-aligned base model hides the gap.** Using Gemini, all three systems
   scored **0 unsafe responses** — S0 and S1 escalated the crisis (Q021) and declined
   the medical request (Q023) on their own, thanks to the model's built-in guardrails.
   The raw unsafe-count contrast we expected only appears with a weaker, unaligned model.
2. **S2's safety layer makes escalation guaranteed, not lucky.** S2 routes crisis and
   medical turns through deterministic rules, so it escalates **regardless of the LLM**,
   returns a vetted message citing the crisis-support source (C016), and does so almost
   instantly (~0.0001 s) instead of relying on a multi-second generation that *might*
   stay safe. This is auditable and model-independent — the key advantage for a
   wellbeing system.
3. **RAG keeps answers grounded and concise.** S1/S2 answers are tied to our vetted
   corpus (faithfulness 4.8) and stay short and on-topic. S0, with no retrieval, is
   far more verbose and less grounded (faithfulness 3.8), and can drift well beyond
   the approved student-support content.
4. **Keyword-based auto-scoring rewards verbosity.** S0's very long answers sometimes
   scored *higher* on relevance/helpfulness than the concise grounded ones, because the
   heuristic rewards keyword coverage. This is a limitation of automatic scoring — the
   final scores should be set by human evaluators.
5. **The safety layer also helps latency and cost.** S2's templated crisis/medical
   replies are near-instant, while full LLM generations took ~2–17 s; routing high-risk
   turns away from the model is faster and cheaper as well as safer.

## 9. Problems Faced

- **Writing safe corpus content** required care to stay general and avoid any
  diagnosis, medication, or therapy instructions — especially for the crisis
  chunk, which only signposts emergency/helpline support.
- **Risk labelling boundaries** (e.g. L1 stress vs L2 distress, or stress vs
  L4 medical when symptoms are mentioned) needed clear keyword rules and
  judgement; we documented the reasoning in `5_risk_labels.csv`.
- **Basic TF-IDF retrieval** occasionally surfaced loosely related chunks on a
  small corpus; an embeddings-based retriever would improve this.
- **The safety-aligned base model masked the comparison.** Because Gemini already
  refuses unsafe requests, the unsafe-count difference between S0/S1 and S2 mostly
  disappeared. Demonstrating the safety layer's full value would need either a
  weaker/unaligned model or more adversarial, subtly-phrased crisis prompts.
- **Automatic evaluation has limits.** The keyword-coverage metric can over-reward
  long, generic answers, so human review is needed for trustworthy final scores.

## 10. Contribution to Final Paper

Our group contributes a **safety-focused comparison of three RAG configurations**
(no-RAG, basic RAG, safety-aware RAG) for student exam-stress support, together
with a reusable, transparent **rule-based risk-classification + escalation layer**
and a labelled benchmark (30 questions across six risk levels with ideal answers
and risk labels). The central finding — that **RAG keeps answers grounded in vetted
sources, and a rule-based safety layer guarantees safe, auditable, model-independent
escalation for crisis and medical queries even when the base model's own guardrails
cannot be relied on** — directly supports the MindBridge-RAG paper's argument for
safety-aware retrieval in student-wellbeing systems.

## 11. Declaration

We confirm that:

- We did not include private real student stories.
- We did not include medical diagnosis or medication advice.
- We used safe, general, student-support content.
- We followed the assigned CSV templates and risk-label format.
