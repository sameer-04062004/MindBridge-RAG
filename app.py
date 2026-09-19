import os
import sys
from pathlib import Path
import uvicorn
import gradio as gr
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from backend.main import app as fastapi_app

# Mount the exact modern React frontend that runs on localhost
dist_path = ROOT / "frontend" / "dist"
if dist_path.exists():
    fastapi_app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

# Mount minimal Gradio route at /gradio to satisfy Hugging Face Gradio supervisor
with gr.Blocks(title="MindBridge-RAG") as demo:
    gr.Markdown("### MindBridge-RAG API & Gradio Gateway")

app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
