from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Source:
    source_id: str
    source_name: str
    organization: str
    url: str
    license: str
    description: str

@dataclass
class Chunk:
    chunk_id: str
    topic: str
    category: str
    risk_level: str
    title: str
    text: str
    source_id: str
    allowed_use: str
    blocked_use: str
    language: str

@dataclass
class RetrievedChunk:
    chunk: Chunk
    score: float

@dataclass
class Response:
    system_type: str
    text: str
    retrieved_chunk_ids: List[str] = field(default_factory=list)
    risk_label: str = ""
    response_time_seconds: float = 0.0
    retrieved_chunks: List[dict] = field(default_factory=list)

