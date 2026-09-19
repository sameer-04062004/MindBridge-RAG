import time
from typing import List, Optional, Dict, Any

from .models import Response, RetrievedChunk
from .retriever import TfidfRetriever, CorpusLoader
from .safety import (
    classify_risk,
    CRISIS_MESSAGE,
    MEDICAL_MESSAGE,
    OUT_OF_SCOPE_MESSAGE,
    DISTRESS_SUPPORT_NOTE,
    STRESS_SUPPORT_NOTE,
    RISK_METADATA
)
from .llm import get_llm, MockLLM

def _build_user_prompt(context_texts: List[str], question: str) -> str:
    if not context_texts:
        return f"QUESTION: {question}"
    bullets = "\n".join(f"- {t}" for t in context_texts)
    return f"CONTEXT:\n{bullets}\n\nQUESTION: {question}"

class BasicChatbot:
    """S0: Plain chatbot without retrieval or safety classification."""
    system_type = "S0"
    name = "Base LLM (S0)"
    SYSTEM_PROMPT = "You are a friendly assistant that gives students general study and wellbeing tips."

    def __init__(self, llm=None):
        self.llm = llm or MockLLM()

    def answer(self, question: str) -> Response:
        start = time.perf_counter()
        text = self.llm.generate(self.SYSTEM_PROMPT, _build_user_prompt([], question))
        elapsed = round(time.perf_counter() - start, 4)
        return Response(
            system_type=self.system_type,
            text=text,
            retrieved_chunk_ids=[],
            risk_label="",
            response_time_seconds=elapsed,
            retrieved_chunks=[]
        )

class BasicRAG:
    """S1: Grounded RAG with retrieval from vetted corpus, but no safety guardrails."""
    system_type = "S1"
    name = "Grounded RAG (S1)"
    SYSTEM_PROMPT = (
        "You are an assistant that answers student questions using the provided "
        "context about exam stress and study skills."
    )

    def __init__(self, retriever: TfidfRetriever, llm=None, top_k: int = 3):
        self.retriever = retriever
        self.llm = llm or MockLLM()
        self.top_k = top_k

    def answer(self, question: str) -> Response:
        start = time.perf_counter()
        retrieved = self.retriever.retrieve(question, top_k=self.top_k)
        ids = [r.chunk.chunk_id for r in retrieved]
        context = [r.chunk.text for r in retrieved]
        text = self.llm.generate(self.SYSTEM_PROMPT, _build_user_prompt(context, question))
        elapsed = round(time.perf_counter() - start, 4)
        formatted_chunks = self.retriever.format_chunk_details(retrieved)
        return Response(
            system_type=self.system_type,
            text=text,
            retrieved_chunk_ids=ids,
            risk_label="",
            response_time_seconds=elapsed,
            retrieved_chunks=formatted_chunks
        )

class SafetyAwareRAG:
    """S2: Production Safety-Aware RAG with rule-based safety layer and grounding."""
    system_type = "S2"
    name = "Safety-Aware RAG (S2)"
    SYSTEM_PROMPT = (
        "You are a careful, supportive assistant for students dealing with exam "
        "stress. Answer only from the provided context, keep a warm tone, never "
        "give medical or diagnostic advice, and encourage human support when appropriate."
    )

    def __init__(self, retriever: TfidfRetriever, llm=None, top_k: int = 3):
        self.retriever = retriever
        self.llm = llm or MockLLM()
        self.top_k = top_k

    def answer(self, question: str) -> Response:
        start = time.perf_counter()
        risk = classify_risk(question)

        # Immediate deterministic escalation without LLM invocation
        if risk == "L3_CRISIS":
            elapsed = round(time.perf_counter() - start, 4)
            return Response(
                system_type=self.system_type,
                text=CRISIS_MESSAGE,
                retrieved_chunk_ids=["C016"],
                risk_label=risk,
                response_time_seconds=elapsed,
                retrieved_chunks=[{
                    "chunk_id": "C016",
                    "score": 1.0,
                    "title": "Crisis Escalation & Support",
                    "topic": "Crisis Support",
                    "category": "Intervention",
                    "risk_level": "L3",
                    "text": CRISIS_MESSAGE,
                    "source_id": "SRC_EMERGENCY",
                    "source_title": "Emergency Escalation Protocol",
                    "source_reference": "National Emergency Services / Helpline Protocol"
                }]
            )

        if risk == "L4_MEDICAL":
            elapsed = round(time.perf_counter() - start, 4)
            return Response(
                system_type=self.system_type,
                text=MEDICAL_MESSAGE,
                retrieved_chunk_ids=[],
                risk_label=risk,
                response_time_seconds=elapsed,
                retrieved_chunks=[]
            )

        if risk == "L5_OUT_OF_SCOPE":
            elapsed = round(time.perf_counter() - start, 4)
            return Response(
                system_type=self.system_type,
                text=OUT_OF_SCOPE_MESSAGE,
                retrieved_chunk_ids=[],
                risk_label=risk,
                response_time_seconds=elapsed,
                retrieved_chunks=[]
            )

        # Retrieval Augmented Generation path
        retrieved = self.retriever.retrieve(question, top_k=self.top_k)
        ids = [r.chunk.chunk_id for r in retrieved]
        context = [r.chunk.text for r in retrieved]
        text = self.llm.generate(self.SYSTEM_PROMPT, _build_user_prompt(context, question))

        if risk == "L2_DISTRESS":
            text = text.rstrip() + DISTRESS_SUPPORT_NOTE
        elif risk == "L1_STRESS":
            text = text.rstrip() + STRESS_SUPPORT_NOTE

        elapsed = round(time.perf_counter() - start, 4)
        formatted_chunks = self.retriever.format_chunk_details(retrieved)
        return Response(
            system_type=self.system_type,
            text=text,
            retrieved_chunk_ids=ids,
            risk_label=risk,
            response_time_seconds=elapsed,
            retrieved_chunks=formatted_chunks
        )

class MindBridgeEngine:
    def __init__(self, data_dir: Optional[str] = None, api_key: Optional[str] = None):
        self.loader = CorpusLoader(data_dir=data_dir)
        self.retriever = TfidfRetriever(self.loader.chunks, self.loader.sources)
        self.llm = get_llm(api_key=api_key)
        self.s0 = BasicChatbot(llm=self.llm)
        self.s1 = BasicRAG(retriever=self.retriever, llm=self.llm)
        self.s2 = SafetyAwareRAG(retriever=self.retriever, llm=self.llm)

    def set_api_key(self, api_key: str):
        self.llm = get_llm(api_key=api_key)
        self.s0.llm = self.llm
        self.s1.llm = self.llm
        self.s2.llm = self.llm

    def answer_single(self, question: str, system_type: str = "S2") -> Response:
        if system_type == "S0":
            return self.s0.answer(question)
        elif system_type == "S1":
            return self.s1.answer(question)
        else:
            return self.s2.answer(question)

    def compare_all(self, question: str) -> Dict[str, Any]:
        risk = classify_risk(question)
        r0 = self.s0.answer(question)
        r1 = self.s1.answer(question)
        r2 = self.s2.answer(question)

        return {
            "query": question,
            "detected_risk": risk,
            "risk_meta": RISK_METADATA.get(risk, {}),
            "results": {
                "S0": {
                    "system_type": r0.system_type,
                    "title": "Base LLM (S0)",
                    "text": r0.text,
                    "response_time": r0.response_time_seconds,
                    "retrieved_chunk_ids": r0.retrieved_chunk_ids,
                    "retrieved_chunks": r0.retrieved_chunks,
                    "grounded": False,
                    "safety_layer": False
                },
                "S1": {
                    "system_type": r1.system_type,
                    "title": "Grounded RAG (S1)",
                    "text": r1.text,
                    "response_time": r1.response_time_seconds,
                    "retrieved_chunk_ids": r1.retrieved_chunk_ids,
                    "retrieved_chunks": r1.retrieved_chunks,
                    "grounded": True,
                    "safety_layer": False
                },
                "S2": {
                    "system_type": r2.system_type,
                    "title": "Safety-Aware RAG (S2)",
                    "text": r2.text,
                    "response_time": r2.response_time_seconds,
                    "retrieved_chunk_ids": r2.retrieved_chunk_ids,
                    "retrieved_chunks": r2.retrieved_chunks,
                    "risk_label": r2.risk_label,
                    "grounded": True,
                    "safety_layer": True
                }
            }
        }

