"""
StudyMate AI - PDF Processing

This module handles:
1. Extracting text from PDF files
2. Cleaning the extracted text
3. Splitting the document into overlapping chunks

These chunks will later be converted into Gemini embeddings
and stored in ChromaDB.
"""

from io import BytesIO

from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from all pages of a PDF.

    Args:
        pdf_bytes: PDF file as raw bytes.

    Returns:
        Cleaned text extracted from the PDF.

    Raises:
        ValueError: If the PDF contains no extractable text.
    """

    reader = PdfReader(BytesIO(pdf_bytes))

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text:
            pages.append(text)

    full_text = "\n\n".join(pages)

    # Normalize excessive whitespace.
    full_text = " ".join(full_text.split())

    if not full_text.strip():
        raise ValueError(
            "No extractable text found in this PDF. "
            "The PDF may be scanned or image-based."
        )

    return full_text


def chunk_text(
    text: str,
    chunk_size: int = 2500,
    overlap: int = 300,
) -> list[str]:
    """
    Split document text into overlapping chunks.

    We use character-based chunking for the MVP.
    This is approximately several hundred tokens per chunk.

    Args:
        text: Complete document text.
        chunk_size: Maximum characters per chunk.
        overlap: Number of repeated characters between chunks.

    Returns:
        A list of text chunks.
    """

    if not text:
        return []

    if overlap >= chunk_size:
        raise ValueError(
            "overlap must be smaller than chunk_size"
        )

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = min(
            start + chunk_size,
            text_length,
        )

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks