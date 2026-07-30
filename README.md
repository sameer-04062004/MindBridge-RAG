# MindBridge-RAG — Safety-Aware Student Exam-Stress Support Chatbot

A retrieval-augmented (RAG) chatbot for student exam-stress management, comparing three system configurations to demonstrate the value of a rule-based safety layer for wellbeing-related queries.

> ⚠️ **Research/coursework prototype only.** Not a substitute for professional mental health support. Crisis and medical queries are escalated to human help, never answered directly.

## Overview

| System | Description |
|---|---|
| **S0** | Basic chatbot, no retrieval (raw LLM only) |
| **S1** | Basic RAG (retrieval-augmented, no safety layer) |
| **S2** | Safety-aware RAG (retrieval + rule-based crisis/medical escalation) |

The core finding: RAG grounds answers in vetted sources (faithfulness ↑), and a **rule-based, model-independent safety layer** guarantees safe escalation for crisis/medical queries — rather than relying solely on the base LLM's own alignment.

## Repository Structure

```
data/
  1_sources.csv              # Public sources used (WHO, university guides)
  2_corpus_chunks.csv        # 30 vetted student-support passages with risk labels
  3_benchmark_questions.csv  # 30 test questions across 6 risk levels
  4_ideal_answers.csv        # Reference answers for evaluation
  5_risk_labels.csv          # Ground-truth risk classification per question
  6_model_responses.csv      # Logged responses from S0/S1/S2
  7_human_evaluation.csv     # Human-reviewed scores (relevance, safety, etc.)
notebooks/
  MindBridge_RAG.ipynb       # Full pipeline: retriever, safety classifier, systems, evaluation
report/
  group_report.md
```

## Setup

```bash
pip install -r requirements.txt
```

The notebook uses Google's Gemini model as the LLM backend. **Set your API key as an environment variable — never commit it:**

```bash
export GOOGLE_API_KEY="your-key-here"
```

In Colab, use `google.colab.userdata` (Secrets) instead of hardcoding the key.

## Key Results

| System | Relevance | Helpfulness | Faithfulness | Safety | Unsafe responses |
|---|---:|---:|---:|---:|---:|
| S0 (no RAG) | 5.00 | 4.40 | 3.80 | 5.00 | 0/5 |
| S1 (basic RAG) | 4.40 | 4.40 | 4.80 | 5.00 | 0/5 |
| S2 (safety-aware RAG) | 4.20 | 4.20 | 4.80 | 5.00 | 0/5 |

Full results and discussion in `report/group_report.md`.

## Safety Design

- Crisis-support content deliberately avoids hardcoded hotline numbers (which vary by country and can go stale) — it directs users to contact local emergency services or a suicide-prevention helpline.
- Risk classification (L0–L5) is rule-based and deterministic for crisis/medical queries, so escalation happens regardless of the underlying LLM's behaviour.
- No real student data, medical diagnoses, or treatment advice are included anywhere in the corpus.

## License

MIT License — see `LICENSE`. Public sources (WHO, university guidance) are cited, not redistributed in full.
