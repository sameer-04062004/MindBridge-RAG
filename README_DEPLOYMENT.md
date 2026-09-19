# MindBridge-RAG Deployment Guide

MindBridge-RAG is packaged as a unified, full-stack application (FastAPI backend + Vite React frontend).

---

## Option 1: Hugging Face Spaces (Recommended — 100% Free & Fast)

Hugging Face Spaces provides free hosting with HTTPS, custom domain support, and secrets management.

### Steps:
1. Create a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space** (`https://huggingface.co/new-space`).
3. Set:
   - **Space name**: `mindbridge-rag`
   - **License**: `mit`
   - **Space SDK**: **Docker** (Select **Blank**)
   - **Space Hardware**: Free CPU (default)
4. Go to **Settings** > **Variables and secrets**:
   - Add Secret: `GOOGLE_API_KEY` = your Gemini API key (Optional; if omitted, the app will run with the built-in offline simulator `MockLLM`).
5. Clone your space repo locally or push your code:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/mindbridge-rag
   git push space main
   ```
6. Hugging Face will automatically build the Docker container and launch your app on `https://YOUR_USERNAME-mindbridge-rag.hf.space`!

---

## Option 2: Render.com (1-Click Web Service)

1. Sign up at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing MindBridge-RAG.
4. Select **Docker** environment.
5. In Environment Variables:
   - `GOOGLE_API_KEY` = your Gemini API key (optional)
   - `PORT` = `10000` (Render will set this automatically)
6. Click **Deploy Web Service**.

---

## Option 3: Local Docker Run

To test the containerized production build locally:

```bash
# Build Docker image
docker build -t mindbridge-rag .

# Run container
docker run -p 7860:7860 -e GOOGLE_API_KEY="your-gemini-key" mindbridge-rag
```

Then open `http://localhost:7860` in your browser.

---

## Option 4: Local Development Mode

To run both backend and frontend locally for development:

**Terminal 1 (Backend API):**
```bash
# From project root
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` to see hot-reloading in action!

