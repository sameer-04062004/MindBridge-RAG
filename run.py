import os
import sys
import webbrowser
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    url = f"http://localhost:{port}"
    print("=" * 60)
    print(f"🌿 Launching MindBridge-RAG Web Application on {url}")
    print("=" * 60)
    try:
        webbrowser.open(url)
    except Exception:
        pass
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

