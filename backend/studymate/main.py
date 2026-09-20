"""
main.py — StudyMate AI FastAPI application entry point.

Endpoints:
  POST /upload          — Upload a PDF; returns { session_id }
  POST /ask             — RAG question answering; returns { answer }
  GET  /summarize       — Document summary; returns { summary }
  GET  /quiz            — Quiz questions; returns { questions: [...] }
  GET  /api/health      — Health check (for deployment platforms)

Static files (frontend) are served from ./static/ at the root URL.

Run locally:
  cd studymate
  uvicorn main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import pdf_processing
import embeddings
import vector_store
import llm


# ---------------------------------------------------------------------------
# App lifecycle & setup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown logic."""
    print("🚀 StudyMate AI starting up...")
    # Verify Gemini API key is present early so we fail fast
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not set — API calls will fail.")
    yield
    print("👋 StudyMate AI shutting down.")


app = FastAPI(
    title="StudyMate AI",
    description="RAG-powered study assistant: upload a PDF, get a summary, chat, and take a quiz.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow same-origin and localhost requests (relaxed for hackathon demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models (Pydantic)
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    """Body for POST /ask."""
    session_id: str
    question: str


class UploadResponse(BaseModel):
    session_id: str
    chunk_count: int
    char_count: int


class AskResponse(BaseModel):
    answer: str


class SummaryResponse(BaseModel):
    summary: str


class QuizResponse(BaseModel):
    questions: list


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint required by deployment platforms.
    Returns 200 OK if the service is running.
    """
    return {"ok": True, "service": "StudyMate AI"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF and build the RAG index for that document.

    Pipeline:
      1. Read the uploaded file bytes.
      2. Extract text (pypdf → pdfplumber fallback).
      3. Chunk the text into ~500-word windows with 50-word overlap.
      4. Embed each chunk with gemini-embedding-001 (RETRIEVAL_DOCUMENT).
      5. Store chunks + embeddings in a new ChromaDB collection.

    Returns:
      session_id — a UUID the frontend must send with all subsequent requests.
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Step 1: Extract text from the PDF
    try:
        text = pdf_processing.extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to read PDF: {str(e)}. The file may be corrupted or image-only.",
        )

    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract readable text from this PDF. "
                "The document may be scanned (image-only) or encrypted."
            ),
        )

    # Step 2: Chunk the text
    chunks = pdf_processing.chunk_text(text, chunk_size=500, overlap=50)

    if not chunks:
        raise HTTPException(status_code=422, detail="Document produced no text chunks.")

    # Step 3: Create a new session (ChromaDB collection)
    session_id = vector_store.create_session()

    # Step 4: Embed all chunks (RETRIEVAL_DOCUMENT task type)
    try:
        chunk_embeddings = embeddings.embed_documents(chunks)
    except EnvironmentError as e:
        vector_store.delete_session(session_id)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        vector_store.delete_session(session_id)
        raise HTTPException(
            status_code=502,
            detail=f"Embedding API error: {str(e)}",
        )

    # Step 5: Store in ChromaDB
    vector_store.add_chunks(session_id, chunks, chunk_embeddings)

    return UploadResponse(
        session_id=session_id,
        chunk_count=len(chunks),
        char_count=len(text),
    )


@app.post("/ask", response_model=AskResponse)
async def ask_question(body: AskRequest):
    """
    Answer a question using RAG — strictly from the uploaded document.

    Pipeline:
      1. Embed the question (RETRIEVAL_QUERY task type).
      2. Query ChromaDB for the top 5 most relevant chunks.
      3. Send chunks + question to Gemini with a strict grounding prompt.

    Returns:
      answer — the model's response, grounded in the document.
    """
    if not vector_store.session_exists(body.session_id):
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a PDF first.",
        )

    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Embed the query (using RETRIEVAL_QUERY for asymmetric retrieval)
    try:
        query_embedding = embeddings.embed_query(body.question)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embedding error: {str(e)}")

    # Retrieve top-5 relevant chunks from ChromaDB
    relevant_chunks = vector_store.retrieve_relevant_chunks(
        body.session_id, query_embedding, n_results=5
    )

    if not relevant_chunks:
        return AskResponse(answer="No relevant content found in the document for this question.")

    # Generate answer with Gemini (strict RAG prompt)
    try:
        answer = llm.answer_with_rag(body.question, relevant_chunks)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return AskResponse(answer=answer)


@app.get("/summarize", response_model=SummaryResponse)
async def summarize(session_id: str):
    """
    Generate a structured Markdown summary of the entire document.

    Retrieves all stored chunks for the session and sends them to Gemini
    with a prompt requesting headings, bullets, and a key-takeaways section.

    Returns:
      summary — a Markdown string ready for frontend rendering.
    """
    if not vector_store.session_exists(session_id):
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a PDF first.",
        )

    chunks = vector_store.get_all_chunks(session_id)

    if not chunks:
        raise HTTPException(status_code=422, detail="No content found in session.")

    try:
        summary = llm.summarize_document(chunks)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Summary generation failed: {str(e)}")

    return SummaryResponse(summary=summary)


@app.get("/quiz", response_model=QuizResponse)
async def generate_quiz(session_id: str):
    """
    Generate a 5–10 question multiple-choice quiz from the document.

    Uses Gemini's structured-output mode with a JSON schema to guarantee
    parseable output — no regex or error-prone string splitting needed.

    Returns:
      questions — a list of objects with question, options, correct_answer, explanation.
    """
    if not vector_store.session_exists(session_id):
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a PDF first.",
        )

    chunks = vector_store.get_all_chunks(session_id)

    if not chunks:
        raise HTTPException(status_code=422, detail="No content found in session.")

    try:
        questions = llm.generate_quiz(chunks)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quiz generation failed: {str(e)}")

    return QuizResponse(questions=questions)


# ---------------------------------------------------------------------------
# Static file serving — frontend lives at /static, root redirects to it
# ---------------------------------------------------------------------------

static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)

# Mount static files so the frontend is accessible at /
# The index.html will be served for the root route via the catch-all below
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the main single-page application HTML."""
    index_path = static_dir / "index.html"
    if not index_path.exists():
        return HTMLResponse("<h1>Frontend not found. Place index.html in /static/</h1>", status_code=404)
    return HTMLResponse(content=index_path.read_text(), status_code=200)
