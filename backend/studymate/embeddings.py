"""
embeddings.py — Wraps the Google Gemini embedding API.

We use `gemini-embedding-001` (successor to text-embedding-004, GA as of 2025)
with 768-dimensional output via Matryoshka Representation Learning — compact
enough for fast in-process ChromaDB lookups.

Two task types matter for RAG quality:
  - RETRIEVAL_DOCUMENT  → used when indexing chunks into ChromaDB
  - RETRIEVAL_QUERY     → used when embedding the user's question at query time

Using the correct task type measurably improves retrieval relevance.
"""

import os
from typing import List

from google import genai
from google.genai import types

# Model to use for embeddings (gemini-embedding-001 replaced text-embedding-004)
EMBEDDING_MODEL = "gemini-embedding-001"
# Output dimension — 768 balances quality vs. memory for an MVP
EMBEDDING_DIM = 768
# Gemini API allows up to 100 documents per embed_content call
BATCH_SIZE = 20


def _get_client() -> genai.Client:
    """Create a Gemini client using the API key from the environment."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY environment variable is not set. "
            "Get a free key at https://aistudio.google.com/app/apikey"
        )
    return genai.Client(api_key=api_key)


def embed_documents(texts: List[str]) -> List[List[float]]:
    """
    Embed a list of document chunks for indexing.

    Args:
        texts: List of text strings (document chunks).

    Returns:
        List of embedding vectors (each a list of floats).
    """
    client = _get_client()
    all_embeddings: List[List[float]] = []

    # Process in batches to respect API rate limits
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=batch,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=EMBEDDING_DIM,
            ),
        )
        all_embeddings.extend([e.values for e in response.embeddings])

    return all_embeddings


def embed_query(query: str) -> List[float]:
    """
    Embed a single user query for retrieval.

    Uses RETRIEVAL_QUERY task type which is optimised for matching
    queries to indexed documents (asymmetric retrieval).

    Args:
        query: The user's natural-language question.

    Returns:
        A single embedding vector (list of floats).
    """
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[query],
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIM,
        ),
    )
    return response.embeddings[0].values
