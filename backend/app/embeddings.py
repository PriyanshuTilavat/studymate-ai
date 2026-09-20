"""
StudyMate AI - Gemini Embeddings

Converts text chunks into numerical vectors using
Google Gemini's embedding model.
"""

import os

from dotenv import load_dotenv
from google import genai


load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not set in the environment."
    )


client = genai.Client(api_key=API_KEY)


EMBEDDING_MODEL = "gemini-embedding-001"


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding for a single text string.
    """

    if not text.strip():
        raise ValueError("Text cannot be empty.")

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )

    return response.embeddings[0].values


def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    """
    Generate embeddings for multiple text chunks.
    """

    if not texts:
        return []

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
    )

    return [
        embedding.values
        for embedding in response.embeddings
    ]