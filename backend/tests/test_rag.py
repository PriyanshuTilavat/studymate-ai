from app.pdf_processing import (
    extract_text_from_pdf,
    chunk_text,
)

from app.embeddings import (
    generate_embeddings,
    generate_embedding,
)

from app.vector_store import (
    add_documents,
    search_documents,
)


def main():

    print("=" * 60)
    print("StudyMate AI - ChromaDB RAG Test")
    print("=" * 60)

    # --------------------------------------------------
    # 1. Read PDF
    # --------------------------------------------------

    print()
    print("[1] Reading PDF...")

    with open("test.pdf", "rb") as file:
        pdf_bytes = file.read()

    text = extract_text_from_pdf(pdf_bytes)

    print(
        f"Extracted characters: {len(text):,}"
    )

    # --------------------------------------------------
    # 2. Create chunks
    # --------------------------------------------------

    print()
    print("[2] Creating chunks...")

    chunks = chunk_text(text)

    print(
        f"Created {len(chunks)} chunks."
    )

    # --------------------------------------------------
    # 3. Generate embeddings
    # --------------------------------------------------

    print()
    print("[3] Generating Gemini embeddings...")

    embeddings = generate_embeddings(chunks)

    print(
        f"Generated {len(embeddings)} embeddings."
    )

    # --------------------------------------------------
    # 4. Store in ChromaDB
    # --------------------------------------------------

    print()
    print("[4] Storing chunks in ChromaDB...")

    add_documents(
        chunks,
        embeddings,
    )

    print("Documents stored successfully.")

    # --------------------------------------------------
    # 5. Search
    # --------------------------------------------------

    print()
    print("[5] Testing semantic search...")

    question = "What is hashing?"

    print()
    print(f"Question: {question}")

    query_embedding = generate_embedding(
        question
    )

    results = search_documents(
        query_embedding,
        top_k=3,
    )

    print()
    print("Relevant chunks:")

    for index, result in enumerate(
        results,
        start=1,
    ):

        print()
        print(f"--- Result {index} ---")
        print(result[:500])

    # --------------------------------------------------
    # Done
    # --------------------------------------------------

    print()
    print("=" * 60)
    print("CHROMADB RAG TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()