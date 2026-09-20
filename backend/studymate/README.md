# 📚 StudyMate AI

> RAG-powered study tool: upload a PDF → get a summary, chat with your document, and take an auto-generated quiz.

Built for a 5-day hackathon. Single deployable Python app, no external database needed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| PDF Parsing | pypdf + pdfplumber fallback |
| Embeddings | Gemini `gemini-embedding-001` |
| LLM | Gemini `gemini-2.0-flash` |
| Vector Store | ChromaDB (in-process, ephemeral) |
| Frontend | Vanilla HTML/CSS/JS served by FastAPI |

---

## Local Development

### 1. Get a Gemini API Key
Get a free key at https://aistudio.google.com/app/apikey

### 2. Install dependencies
```bash
cd studymate
pip install -r requirements.txt
```

### 3. Run the server
```bash
GEMINI_API_KEY=your_key_here uvicorn main:app --reload --port 8000
```

### 4. Open the app
Navigate to http://localhost:8000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload a PDF; returns `{ session_id }` |
| `POST` | `/ask` | RAG Q&A; body: `{ session_id, question }` |
| `GET`  | `/summarize?session_id=...` | Generate document summary |
| `GET`  | `/quiz?session_id=...` | Generate quiz questions |
| `GET`  | `/api/health` | Health check |

---

## Deployment — Render.com (Recommended, Free)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** to `studymate`
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variable: `GEMINI_API_KEY` = your key
8. Click **Deploy** → Get your live URL in ~2 minutes

---

## Deployment — Railway.app

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. In the `studymate/` directory:
   ```bash
   railway init
   railway add
   railway env set GEMINI_API_KEY=your_key_here
   railway up
   ```
4. Get your URL: `railway domain`

---

## How It Works (for judges)

```
User uploads PDF
      │
      ▼
┌─────────────────────┐
│   pdf_processing.py  │  → Extract text (pypdf/pdfplumber)
│                      │  → Chunk into 500-word windows with 50-word overlap
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    embeddings.py     │  → gemini-embedding-001 (RETRIEVAL_DOCUMENT)
│                      │  → 768-dim vectors, batched 20 at a time
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   vector_store.py    │  → ChromaDB EphemeralClient (in-RAM)
│                      │  → cosine similarity, per-session collection
└─────────────────────┘

User asks a question
      │
      ▼
┌─────────────────────┐
│    embeddings.py     │  → gemini-embedding-001 (RETRIEVAL_QUERY)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   vector_store.py    │  → top-5 cosine-similar chunks retrieved
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│       llm.py         │  → gemini-2.0-flash with strict grounding prompt
│                      │  → "answer ONLY from this context"
└─────────┬───────────┘
          │
          ▼
       Answer ✅
```

---

## Project Structure

```
studymate/
├── main.py              # FastAPI app, all API endpoints
├── pdf_processing.py    # PDF text extraction + chunking
├── embeddings.py        # Gemini embedding API wrapper
├── vector_store.py      # ChromaDB in-process vector store
├── llm.py               # Gemini generation: RAG, summary, quiz
├── requirements.txt     # Python dependencies
├── render.yaml          # Render.com deployment config
├── railway.json         # Railway.app deployment config
├── Procfile             # Generic Procfile for PaaS platforms
└── static/
    ├── index.html       # Single-page app HTML
    ├── styles.css       # Modern blue/purple design system
    └── script.js        # Tab switching, upload, chat, quiz logic
```
