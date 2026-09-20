export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "48px 40px",
          maxWidth: "540px",
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📚</div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: "8px",
          }}
        >
          StudyMate{" "}
          <span style={{ color: "#6366f1" }}>AI</span>
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: "1rem",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Upload a PDF. Get an AI summary, chat with your document using RAG,
          and test yourself with an auto-generated quiz.
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          {["✨ AI Summary", "💬 RAG Chat", "🧠 Auto Quiz"].map((f) => (
            <span
              key={f}
              style={{
                background: "#eef2ff",
                color: "#6366f1",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: ".85rem",
                fontWeight: 600,
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            fontSize: ".85rem",
            color: "#64748b",
            textAlign: "left",
            lineHeight: "1.7",
          }}
        >
          <strong style={{ color: "#1e293b" }}>How to run StudyMate AI:</strong>
          <br />
          <code
            style={{
              display: "block",
              background: "#1e293b",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "12px 16px",
              marginTop: "10px",
              fontSize: ".8rem",
              fontFamily: "monospace",
              whiteSpace: "pre",
            }}
          >{`cd studymate
pip install -r requirements.txt
GEMINI_API_KEY=your_key uvicorn main:app --port 8000`}</code>
          <br />
          Then open{" "}
          <code
            style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}
          >
            http://localhost:8000
          </code>
        </div>

        <p style={{ fontSize: ".8rem", color: "#94a3b8" }}>
          Built with FastAPI · Gemini API · ChromaDB · Vanilla JS
        </p>
      </div>
    </main>
  );
}
