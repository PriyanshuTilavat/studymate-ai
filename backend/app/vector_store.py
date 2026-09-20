"""
StudyMate AI - ChromaDB Vector Store

Stores document chunks and their Gemini embeddings
so we can search for relevant information later.
"""

from pathlib import Path

import chromadb


# Store ChromaDB data inside the backend directory.
CHROMA_PATH = Path("chroma_db")

client = chromadb.PersistentClient(
    path=str(CHROMA_PATH)
)

collection = client.get_or_create_collection(
    name="studymate_documents"
)


def add_documents(
    chunks: list[str],
    embeddings: list[list[float]],
) -> None:
    """
    Store document chunks and their embeddings in ChromaDB.
    """

    if not chunks:
        raise ValueError("No chunks provided.")

    if len(chunks) != len(embeddings):
        raise ValueError(
            "Number of chunks and embeddings must match."
        )

    ids = [
        f"chunk_{index}"
        for index in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
    )


def search_documents(
    query_embedding: list[float],
    top_k: int = 3,
) -> list[str]:
    """
    Search ChromaDB for the most relevant document chunks.
    """

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    documents = results.get("documents", [[]])

    if not documents:
        return []

    return documents[0]