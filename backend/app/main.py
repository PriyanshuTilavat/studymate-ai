from fastapi import FastAPI, UploadFile, File, HTTPException

from app.pdf_processing import (
    extract_text_from_pdf,
    chunk_text,
)

from app.embeddings import generate_embeddings

from app.vector_store import add_documents


app = FastAPI(
    title="StudyMate AI",
    description="AI-powered PDF study assistant",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "StudyMate AI backend is running."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):
    """
    Upload a PDF and process it into
    searchable vector embeddings.
    """

    # Check file type
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:

        # Read uploaded PDF
        pdf_bytes = await file.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded PDF is empty."
            )

        # Extract text
        text = extract_text_from_pdf(
            pdf_bytes
        )

        # Create chunks
        chunks = chunk_text(text)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF."
            )

        # Generate embeddings
        embeddings = generate_embeddings(
            chunks
        )

        # Store in ChromaDB
        add_documents(
            chunks,
            embeddings
        )

        return {
            "status": "success",
            "message": "PDF uploaded and processed successfully.",
            "filename": file.filename,
            "characters": len(text),
            "chunks": len(chunks),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(error)}"
        )