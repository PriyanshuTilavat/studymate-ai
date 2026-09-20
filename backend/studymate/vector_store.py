"""
vector_store.py — Per-session ChromaDB collections for RAG retrieval.

We use ChromaDB's in-process (ephemeral) client so there's zero external
infrastructure — everything lives in RAM for the duration of the server
process.  Each uploaded PDF gets its own isolated collection identified
by a UUID `session_id`, so multiple users can work concurrently without
their documents bleeding into each other.

Key design choices:
  - cosine similarity (better than L2 for variable-length text embeddings)
  - We supply pre-computed embeddings from our `embeddings.py` module
    rather than using ChromaDB's built-in embedding functions, giving us
    full control over the model and task type.
"""

import uuid
from typing import Dict, List, Tuple

import chromadb

# ---------------------------------------------------------------------------
# Module-level in-process ChromaDB client (shared across all requests)
# ---------------------------------------------------------------------------
_chroma_client = chromadb.EphemeralClient()

# Cache of session_id → ChromaDB Collection objects
_collections: Dict[str, chromadb.Collection] = {}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def create_session() -> str:
    """
    Generate a new session ID and create a corresponding ChromaDB collection.

    Returns:
        A UUID string that the frontend stores as `session_id`.
    """
    session_id = str(uuid.uuid4())
    collection = _chroma_client.create_collection(
        name=session_id,
        metadata={"hnsw:space": "cosine"},  # cosine distance for text
    )
    _collections[session_id] = collection
    return session_id


def add_chunks(
    session_id: str,
    chunks: List[str],
    embeddings: List[List[float]],
) -> None:
    """
    Store document chunks and their embeddings into the session's collection.

    Args:
        session_id:  The session UUID returned by create_session().
        chunks:      List of text strings (document chunks).
        embeddings:  Parallel list of embedding vectors.
    """
    collection = _get_collection(session_id)

    # ChromaDB requires unique string IDs for each document
    ids = [f"chunk_{i}" for i in range(len(chunks))]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=[{"chunk_index": i} for i in range(len(chunks))],
    )


def retrieve_relevant_chunks(
    session_id: str,
    query_embedding: List[float],
    n_results: int = 5,
) -> List[str]:
    """
    Find the top-N most relevant chunks for a query embedding.

    Args:
        session_id:      The session UUID.
        query_embedding: The embedding vector of the user's question.
        n_results:       How many chunks to retrieve (default 5).

    Returns:
        List of text strings ordered by relevance (most relevant first).
    """
    collection = _get_collection(session_id)

    # Guard: don't ask for more results than documents stored
    count = collection.count()
    n = min(n_results, count)
    if n == 0:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n,
    )

    # results["documents"] is a list-of-lists (one list per query)
    return results["documents"][0] if results["documents"] else []


def get_all_chunks(session_id: str) -> List[str]:
    """
    Retrieve every chunk stored in a session (used for summarisation and quiz).

    Returns:
        All document chunks as a flat list of strings.
    """
    collection = _get_collection(session_id)
    count = collection.count()
    if count == 0:
        return []

    result = collection.get(include=["documents"])
    return result["documents"] or []


def session_exists(session_id: str) -> bool:
    """Check whether a given session_id has an active collection."""
    return session_id in _collections


def delete_session(session_id: str) -> None:
    """Clean up a session's ChromaDB collection (optional housekeeping)."""
    if session_id in _collections:
        _chroma_client.delete_collection(session_id)
        del _collections[session_id]


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _get_collection(session_id: str) -> chromadb.Collection:
    """Look up a collection or raise a clear error if the session is gone."""
    if session_id not in _collections:
        raise KeyError(
            f"Session '{session_id}' not found. "
            "Please upload a PDF first to start a new session."
        )
    return _collections[session_id]
