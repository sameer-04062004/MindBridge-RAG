import os
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .core.pipeline import MindBridgeEngine
from .core.safety import RISK_METADATA, classify_risk

app = FastAPI(
    title="MindBridge-RAG API",
    description="Safety-Aware Student Exam-Stress Support RAG Engine",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
engine = MindBridgeEngine(data_dir=str(DATA_DIR))

class ChatRequest(BaseModel):
    message: str
    system: Optional[str] = "S2"

class CompareRequest(BaseModel):
    message: str

class KeyConfig(BaseModel):
    api_key: str

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "llm_backend": getattr(engine.llm, "model_name", "Unknown"),
        "total_chunks": len(engine.loader.chunks),
        "total_sources": len(engine.loader.sources)
    }

@app.post("/api/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    sys_type = req.system.upper() if req.system else "S2"
    if sys_type not in ("S0", "S1", "S2"):
        sys_type = "S2"
        
    res = engine.answer_single(req.message, system_type=sys_type)
    detected_risk = res.risk_label or classify_risk(req.message)
    
    return {
        "system": res.system_type,
        "text": res.text,
        "risk_label": res.risk_label,
        "risk_meta": RISK_METADATA.get(detected_risk, {}),
        "response_time": res.response_time_seconds,
        "retrieved_chunk_ids": res.retrieved_chunk_ids,
        "retrieved_chunks": res.retrieved_chunks
    }

@app.post("/api/compare")
def compare(req: CompareRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    return engine.compare_all(req.message)

@app.get("/api/corpus")
def get_corpus():
    return {
        "sources": engine.loader.sources,
        "chunks": [
            {
                "chunk_id": c.chunk_id,
                "title": c.title,
                "topic": c.topic,
                "category": c.category,
                "risk_level": c.risk_level,
                "text": c.text,
                "source_id": c.source_id,
                "allowed_use": c.allowed_use
            }
            for c in engine.loader.chunks
        ]
    }

@app.post("/api/config")
def update_api_key(req: KeyConfig):
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="API key is required")
    try:
        engine.set_api_key(req.api_key.strip())
        return {
            "status": "success",
            "llm_backend": getattr(engine.llm, "model_name", "Gemini")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static frontend if built
dist_path = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

