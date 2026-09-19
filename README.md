---
title: MindBridge-RAG
emoji: 🌿
colorFrom: teal
colorTo: indigo
sdk: gradio
sdk_version: 6.28.0
python_version: '3.12'
app_file: app.py
pinned: false
license: mit
short_description: Safety-Aware Student Exam-Stress Support RAG
---

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
backend/
  core/                      # Refactored modular RAG engine & safety classifier
  main.py                    # FastAPI server
frontend/                    # Catchy React web interface
app.py                       # Hugging Face Gradio production entrypoint
report/
  group_report.md
```

## Setup

```bash
pip install -r requirements.txt
```

The app uses Google's Gemini model as the LLM backend (with an automatic fallback to an offline reproducible `MockLLM` if no key is provided).

```bash
export GOOGLE_API_KEY="your-key-here"
```

## Key Results

| System | Relevance | Helpfulness | Faithfulness | Safety | Unsafe responses |
|---|---:|---:|---:|---:|---:|
| S0 (no RAG) | 5.00 | 4.40 | 3.80 | 5.00 | 0/5 |
| S1 (basic RAG) | 4.40 | 4.40 | 4.80 | 5.00 | 0/5 |
| S2 (safety-aware RAG) | 4.20 | 4.20 | 4.80 | 5.00 | 0/5 |

## License

MIT License — see `LICENSE`.
