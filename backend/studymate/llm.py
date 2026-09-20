"""
llm.py — All Gemini LLM calls: RAG answers, summaries, and quiz generation.

Model: gemini-2.0-flash  (fast, cheap, generous context window)

Three functions:
  1. answer_with_rag()  — grounded Q&A strictly from retrieved chunks
  2. summarize_document() — structured summary with headings + bullet points
  3. generate_quiz()     — JSON-schema-constrained quiz questions

Prompt engineering notes (for hackathon judges):
  - RAG prompt instructs the model NOT to use outside knowledge.
  - Summary prompt requests Markdown so the frontend can render it nicely.
  - Quiz uses Gemini's native structured-output mode (response_mime_type +
    response_schema) to guarantee parseable JSON every time.
"""

import json
import os
from typing import Any, Dict, List

from google import genai
from google.genai import types

# Generation model — 2.0-flash is fast and handles long contexts well
GENERATION_MODEL = "gemini-2.0-flash"

# Maximum characters of document text to send to Gemini in one call.
# (gemini-2.0-flash supports 1M tokens; we cap for safety/cost.)
MAX_CONTEXT_CHARS = 80_000


def _get_client() -> genai.Client:
    """Create a Gemini generation client from the environment API key."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)


# ---------------------------------------------------------------------------
# 1. RAG answer
# ---------------------------------------------------------------------------

def answer_with_rag(question: str, context_chunks: List[str]) -> str:
    """
    Answer a question ONLY from the supplied context chunks (strict RAG).

    The prompt is carefully worded so the model refuses to use outside
    knowledge — important for academic integrity in a study tool.

    Args:
        question:       The student's question.
        context_chunks: Top-K relevant chunks retrieved from ChromaDB.

    Returns:
        The model's answer string.
    """
    client = _get_client()

    # Join retrieved chunks with clear separators so the model can cite them
    context_text = "\n\n---\n\n".join(context_chunks)

    prompt = f"""You are a precise study assistant. Your ONLY job is to answer
questions using the document context provided below. Do NOT use any outside
knowledge or make assumptions beyond what is in the context.

If the answer is not covered in the context, say exactly:
"This topic is not covered in the uploaded document."

Context from document:
\"\"\"
{context_text}
\"\"\"

Student's question: {question}

Answer (be clear, concise, and educational):"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,  # low temperature = more factual, less creative
            max_output_tokens=1024,
        ),
    )

    return response.text.strip()


# ---------------------------------------------------------------------------
# 2. Document summarisation
# ---------------------------------------------------------------------------

def summarize_document(chunks: List[str]) -> str:
    """
    Generate a structured Markdown summary of the document.

    For long documents we concatenate chunks up to MAX_CONTEXT_CHARS;
    for very long documents a hierarchical approach (summarise-then-summarise)
    would be ideal but the 80 K char cap handles most study materials fine.

    Args:
        chunks: All document chunks from the session.

    Returns:
        A Markdown string with headings, sub-headings, and bullet points.
    """
    client = _get_client()

    # Combine chunks (respecting the character cap)
    full_text = "\n\n".join(chunks)[:MAX_CONTEXT_CHARS]

    prompt = f"""You are an expert study assistant. Read the following document
and produce a clear, well-structured summary that a student can use to review
the material quickly.

Format the summary using Markdown:
- Use ## for main topic headings
- Use ### for sub-topics
- Use bullet points (- ) for key facts, definitions, or concepts
- Include a "Key Takeaways" section at the end

Keep the summary comprehensive but concise — aim for clarity over completeness.

Document text:
\"\"\"
{full_text}
\"\"\"

Structured Summary:"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=2048,
        ),
    )

    return response.text.strip()


# ---------------------------------------------------------------------------
# 3. Quiz generation (structured output)
# ---------------------------------------------------------------------------

# Gemini schema for a single quiz question
_QUESTION_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    required=["question", "options", "correct_answer", "explanation"],
    properties={
        "question": types.Schema(
            type=types.Type.STRING,
            description="The quiz question text",
        ),
        "options": types.Schema(
            type=types.Type.ARRAY,
            description="Exactly 4 answer choices labelled A, B, C, D",
            items=types.Schema(type=types.Type.STRING),
        ),
        "correct_answer": types.Schema(
            type=types.Type.STRING,
            description="The letter of the correct option: A, B, C, or D",
        ),
        "explanation": types.Schema(
            type=types.Type.STRING,
            description="A brief explanation of why the correct answer is right",
        ),
    },
)

# Top-level schema: an array of questions
_QUIZ_SCHEMA = types.Schema(
    type=types.Type.ARRAY,
    items=_QUESTION_SCHEMA,
)


def generate_quiz(chunks: List[str]) -> List[Dict[str, Any]]:
    """
    Generate 5–10 multiple-choice quiz questions from the document.

    Uses Gemini's structured-output mode (response_mime_type + response_schema)
    so the output is always valid JSON — no regex parsing needed.

    Args:
        chunks: All document chunks from the session.

    Returns:
        A list of dicts, each with keys:
          - question (str)
          - options (list[str], length 4)
          - correct_answer (str, one of "A","B","C","D")
          - explanation (str)
    """
    client = _get_client()

    full_text = "\n\n".join(chunks)[:MAX_CONTEXT_CHARS]

    prompt = f"""You are an expert educator creating a quiz to test student
understanding of the following document.

Generate between 5 and 10 multiple-choice questions. Requirements:
- Each question must be answerable from the document text only
- Each question must have exactly 4 options labelled A, B, C, D
- Vary difficulty: include recall, comprehension, and application questions
- Provide a clear explanation for the correct answer

Document text:
\"\"\"
{full_text}
\"\"\"

Return the quiz as a JSON array following the provided schema."""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_QUIZ_SCHEMA,
            temperature=0.4,
            max_output_tokens=4096,
        ),
    )

    # With structured output, response.text is guaranteed valid JSON
    questions = json.loads(response.text)

    # Defensive: clamp to 5–10 questions
    return questions[:10] if len(questions) > 10 else questions
