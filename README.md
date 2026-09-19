---
title: MindBridge-RAG
emoji: 🌿
colorFrom: green
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

<div align="center">

[![Live Demo on Vercel](https://img.shields.io/badge/🚀%20Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-omega-black-62.vercel.app/)
[![Hugging Face Space](https://img.shields.io/badge/🤗%20Hugging%20Face-Space-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/spaces/Sameer109sam/MindBridge-RAG)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-06B6D4?style=for-the-badge&logo=react&logoColor=black)](https://frontend-omega-black-62.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

### 🌐 [Click Here to Open the Live Web Application](https://frontend-omega-black-62.vercel.app/)

</div>

---

A retrieval-augmented (RAG) chatbot for student exam-stress management, comparing three system configurations to demonstrate the value of a rule-based safety layer for wellbeing-related queries.

> ⚠️ **Research/coursework prototype only.** Not a substitute for professional mental health support. Crisis and medical queries are escalated to human help, never answered directly.

---

## ✨ Interactive Features in the Live App

- **💬 Empathetic AI Chat**: Conversational interface with real-time risk classification (`L0` to `L5`) and verified source citations.
- **⚖️ Tri-System Compare Arena**: Side-by-side benchmark comparing **S0** (Base LLM), **S1** (Basic RAG), and **S2** (Safety-Aware RAG) on the exact same question.
- **🌬️ 4-7-8 Breathing Reset**: Interactive animated visualizer with soothing synthesized tones to ease acute exam panic.
- **📚 Vetted Corpus Explorer**: Search and inspect all 30 knowledge passages from WHO, NHS, Cambridge, and Oxford guides.
- **🚨 Crisis & Medical Guardrails**: Hardcoded deterministic intervention bypassing LLM hallucination for emergency and medication queries.

---

## 🔬 Systems Overview

| System | Description | Grounding | Safety Layer |
|---|---|:---:|:---:|
| **S0** | Basic chatbot, no retrieval (raw LLM only) | ❌ No | ❌ None |
| **S1** | Basic RAG (retrieval-augmented from vetted corpus) | ✅ Yes | ❌ None |
| **S2** | **Safety-aware RAG** (vetted retrieval + deterministic escalation) | ✅ Yes | ✅ Rule-Based |

The core finding: RAG grounds answers in vetted sources (faithfulness ↑), and a **rule-based, model-independent safety layer** guarantees safe escalation for crisis/medical queries — rather than relying solely on the base LLM's own alignment.

---

## 📁 Repository Structure

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
frontend/                    # Catchy React web interface (Vite + Tailwind CSS)
app.py                       # Hugging Face Gradio production entrypoint
run.py                       # 1-click Python launcher
start_app.bat                # 1-click Windows launcher
report/
  group_report.md
```

---

## 🚀 Quickstart (Local Run)

### 1-Click Launch (Windows)
Double-click `start_app.bat` or run:
```bash
python run.py
```
This launches the app and automatically opens `http://localhost:8000` in your web browser.

### Development Mode
```bash
# Terminal 1: Backend API
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend Dev Server
cd frontend
npm run dev
```

---

## 📊 Key Results

| System | Relevance | Helpfulness | Faithfulness | Safety | Unsafe responses |
|---|---:|---:|---:|---:|---:|
| S0 (no RAG) | 5.00 | 4.40 | 3.80 | 5.00 | 0/5 |
| S1 (basic RAG) | 4.40 | 4.40 | 4.80 | 5.00 | 0/5 |
| S2 (safety-aware RAG) | 4.20 | 4.20 | 4.80 | 5.00 | 0/5 |

Full results and discussion in `report/group_report.md`.

---

## 📜 License

MIT License — see `LICENSE`. Public sources (WHO, university guidance) are cited, not redistributed in full.
