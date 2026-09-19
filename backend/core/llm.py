import os
import re
import time
from typing import Optional, List

def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]

class MockLLM:
    """Deterministic offline stand-in for a real LLM (no API key required)."""
    _TIP_BANK = {
        "sleep": "Try to get enough sleep and keep a steady sleep routine, avoiding screens an hour before bed.",
        "time": "Make a prioritized revision timetable and tackle one study session at a time.",
        "study": "Use active recall and spaced repetition, and take regular 5-10 minute breaks.",
        "nervous": "Try the 4-7-8 breathing exercise to calm your sympathetic nervous system.",
        "stress": "Take slow deep breaths, hydrate, and remind yourself that an exam measures preparation, not your worth.",
        "motivation": "Break large goals into 25-minute Pomodoro sprints and celebrate small wins.",
        "panic": "Ground yourself with the 5-4-3-2-1 technique: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
        "default": "Stay organised, maintain realistic goals, take regular breaks, and be kind to yourself.",
    }

    def __init__(self):
        self.model_name = "MockLLM (Offline Simulator)"

    def generate(self, system: str, user: str) -> str:
        context, question = self._parse(user)
        if not context:
            return self._generic_answer(question)
        return self._grounded_answer(context)

    @staticmethod
    def _parse(user: str):
        context, question = [], user.strip()
        if "CONTEXT:" in user and "QUESTION:" in user:
            ctx_block, q_block = user.split("QUESTION:", 1)
            ctx_block = ctx_block.split("CONTEXT:", 1)[1]
            context = [ln.strip(" -\t") for ln in ctx_block.splitlines() if ln.strip(" -\t")]
            question = q_block.strip()
        return context, question

    def _generic_answer(self, question: str) -> str:
        q = question.lower()
        tips = []
        for key, tip in self._TIP_BANK.items():
            if key != "default" and key in q and tip not in tips:
                tips.append(tip)
        if not tips:
            tips.append(self._TIP_BANK["default"])
        return "Here are a few suggestions to help: " + " ".join(tips)

    def _grounded_answer(self, context: List[str]) -> str:
        points = []
        for chunk_text in context[:3]:
            sentences = _split_sentences(chunk_text)
            points.append(" ".join(sentences[:2]) if sentences else chunk_text)
        return "Based on vetted student guidance: " + " ".join(points)

class GeminiLLM:
    """Google Gemini LLM client via google-genai SDK."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash", temperature: float = 0.3):
        from google import genai
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("No Gemini API key provided")
        self.model_name = model
        self.temperature = temperature
        self._client = genai.Client(api_key=self.api_key)

    def generate(self, system: str, user: str) -> str:
        from google.genai import types
        cfg = types.GenerateContentConfig(
            system_instruction=system,
            temperature=self.temperature,
            max_output_tokens=600,
        )
        for attempt in range(3):
            try:
                resp = self._client.models.generate_content(
                    model=self.model_name, contents=user, config=cfg
                )
                return (resp.text or "").strip()
            except Exception as e:
                err_str = str(e)
                if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                    # Fallback to MockLLM on quota exhaustion
                    return MockLLM().generate(system, user)
                if attempt == 2:
                    # Gracefully fall back to MockLLM instead of crashing
                    return MockLLM().generate(system, user)
                time.sleep(1 * (attempt + 1))
        return MockLLM().generate(system, user)

def get_llm(api_key: Optional[str] = None):
    key = api_key or os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if key:
        preferred_models = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
        ]
        for m in preferred_models:
            try:
                return GeminiLLM(api_key=key, model=m)
            except Exception:
                continue
    return MockLLM()

