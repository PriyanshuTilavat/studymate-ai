"""
pdf_processing.py — Handles PDF text extraction and text chunking.

Strategy:
  1. Try pypdf first (fast, works for most text-layer PDFs).
  2. Fall back to pdfplumber if pypdf returns less than 100 chars
     (handles complex layouts better, e.g. multi-column textbooks).
  3. Chunk the raw text into ~500-token windows with a 50-token overlap
     so context is preserved at chunk boundaries.
"""

import re
from typing import List

import pypdf
import pdfplumber


# ---------------------------------------------------------------------------
# PDF → raw text
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text from a PDF given its raw bytes.
    Returns the full document text as a single string.
    """
    import io

    text = _extract_with_pypdf(file_bytes)

    # If pypdf got very little text, fall back to pdfplumber
    if len(text.strip()) < 100:
        text = _extract_with_pdfplumber(file_bytes)

    return text.strip()


def _extract_with_pypdf(file_bytes: bytes) -> str:
    """Use pypdf to read text from every page."""
    import io
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        pages.append(page_text)
    return "\n".join(pages)


def _extract_with_pdfplumber(file_bytes: bytes) -> str:
    """Use pdfplumber for better layout-aware extraction (fallback)."""
    import io
    pages = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            pages.append(page_text)
    return "\n".join(pages)


# ---------------------------------------------------------------------------
# Text → overlapping chunks
# ---------------------------------------------------------------------------

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping windows of approximately `chunk_size` tokens.

    We use a simple whitespace-split word count as a proxy for tokens
    (1 word ≈ 1.3 tokens on average for English — close enough for chunking).

    Args:
        text:       The full document text.
        chunk_size: Approximate number of words per chunk.
        overlap:    Number of words to repeat at the start of the next chunk
                    so questions that span a chunk boundary are still answerable.

    Returns:
        A list of text chunks (strings).
    """
    if not text:
        return []

    # Split on whitespace, preserving natural word boundaries
    words = text.split()

    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        chunk = " ".join(chunk_words)
        chunks.append(chunk)

        # Advance by chunk_size minus overlap so next chunk shares context
        start += chunk_size - overlap

        # Safety guard: if overlap >= chunk_size we'd loop forever
        if chunk_size <= overlap:
            break

    return chunks
