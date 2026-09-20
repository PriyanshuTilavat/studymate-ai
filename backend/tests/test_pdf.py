from pathlib import Path

from app.pdf_processing import (
    extract_text_from_pdf,
    chunk_text,
)


PDF_PATH = Path("test.pdf")


def main():

    print("=" * 60)
    print("StudyMate AI - PDF Processing Test")
    print("=" * 60)

    if not PDF_PATH.exists():
        print()
        print("ERROR: test.pdf not found.")
        print()
        print("Put a PDF here:")
        print(PDF_PATH.resolve())
        return

    print()
    print("[1] Reading PDF...")

    pdf_bytes = PDF_PATH.read_bytes()

    print(f"PDF size: {len(pdf_bytes):,} bytes")

    print()
    print("[2] Extracting text...")

    try:
        text = extract_text_from_pdf(pdf_bytes)

    except ValueError as error:
        print(f"ERROR: {error}")
        return

    print(f"Extracted characters: {len(text):,}")

    print()
    print("[3] Creating chunks...")

    chunks = chunk_text(text)

    print(f"Created {len(chunks)} chunks.")

    print()
    print("[4] Chunk information")

    for index, chunk in enumerate(chunks):

        print()
        print(f"--- Chunk {index + 1} ---")
        print(f"Characters: {len(chunk)}")
        print(chunk[:300])

    print()
    print("=" * 60)
    print("PDF PROCESSING TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()