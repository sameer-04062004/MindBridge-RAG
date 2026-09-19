import csv
import os
from pathlib import Path
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import Chunk, Source, RetrievedChunk

class CorpusLoader:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            # Look relative to current file or root
            base_dir = Path(__file__).resolve().parent.parent.parent
            data_dir = str(base_dir / "data")
        self.data_dir = Path(data_dir)
        self.sources: Dict[str, dict] = {}
        self.chunks: List[Chunk] = []
        self._load_sources()
        self._load_chunks()

    def _load_sources(self):
        sources_file = self.data_dir / "1_sources.csv"
        if not sources_file.exists():
            return
        with open(sources_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sid = row.get("source_id", "")
                self.sources[sid] = {
                    "source_id": sid,
                    "title": row.get("source_title", ""),
                    "type": row.get("source_type", ""),
                    "reference": row.get("source_link_or_reference", ""),
                    "reason_for_use": row.get("reason_for_use", "")
                }

    def _load_chunks(self):
        chunks_file = self.data_dir / "2_corpus_chunks.csv"
        if not chunks_file.exists():
            return
        with open(chunks_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                chunk = Chunk(
                    chunk_id=row.get("chunk_id", ""),
                    topic=row.get("topic", ""),
                    category=row.get("category", ""),
                    risk_level=row.get("risk_level", ""),
                    title=row.get("title", ""),
                    text=row.get("text", ""),
                    source_id=row.get("source_id", ""),
                    allowed_use=row.get("allowed_use", ""),
                    blocked_use=row.get("blocked_use", ""),
                    language=row.get("language", "en")
                )
                self.chunks.append(chunk)

class TfidfRetriever:
    def __init__(self, chunks: List[Chunk], sources: Dict[str, dict]):
        self.chunks = chunks
        self.sources = sources
        corpus = [f"{c.title}. {c.text}" for c in chunks]
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.matrix = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str, top_k: int = 3, min_score: float = 0.05) -> List[RetrievedChunk]:
        if not self.chunks or not query.strip():
            return []
        q_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(q_vec, self.matrix)[0]
        ranked = sorted(zip(sims, self.chunks), key=lambda x: x[0], reverse=True)
        return [
            RetrievedChunk(chunk=c, score=float(s))
            for s, c in ranked[:top_k]
            if s >= min_score
        ]

    def format_chunk_details(self, retrieved: List[RetrievedChunk]) -> List[dict]:
        output = []
        for rc in retrieved:
            c = rc.chunk
            src = self.sources.get(c.source_id, {})
            output.append({
                "chunk_id": c.chunk_id,
                "score": round(rc.score, 4),
                "title": c.title,
                "topic": c.topic,
                "category": c.category,
                "risk_level": c.risk_level,
                "text": c.text,
                "source_id": c.source_id,
                "source_title": src.get("title", "Official Wellbeing Source"),
                "source_reference": src.get("reference", "")
            })
        return output

