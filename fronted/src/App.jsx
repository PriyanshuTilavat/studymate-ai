/**
 * App – root component and state manager for StudyMate AI.
 *
 * State machine:
 *   "upload"    – landing / file upload screen
 *   "dashboard" – document loaded; tabs: summary | chat | quiz
 */

import { useState } from "react";
import Navbar     from "./components/Navbar.jsx";
import FileUpload from "./components/FileUpload.jsx";
import Summary    from "./components/Summary.jsx";
import Chat       from "./components/Chat.jsx";
import Quiz       from "./components/Quiz.jsx";

// ── Tab configuration ──────────────────────────────────────────────────────
const TABS = [
  { id: "summary", label: "Summary",  icon: "📋" },
  { id: "chat",    label: "Chat",     icon: "💬" },
  { id: "quiz",    label: "Quiz",     icon: "🧠" },
];

export default function App() {
  // ── App-level state ────────────────────────────────────────────────────────
  const [screen,       setScreen]       = useState("upload");   // "upload" | "dashboard"
  const [documentName, setDocumentName] = useState("");
  const [activeTab,    setActiveTab]    = useState("summary");
  const [isMock,       setIsMock]       = useState(false);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  function handleDocumentReady({ file, documentName: name, isMock: mock }) {
    setDocumentName(name);
    setIsMock(mock);
    setActiveTab("summary");
    setScreen("dashboard");
  }

  function handleUploadNew() {
    setScreen("upload");
    setDocumentName("");
    setIsMock(false);
    setActiveTab("summary");
  }

  // ── Render: Upload screen ──────────────────────────────────────────────────
  if (screen === "upload") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <Navbar documentName={null} onUploadNew={null} />

        <main className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
          {/* Hero section */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }} className="animate-slide-up">
            {/* Brand icon */}
            <div
              style={{
                width: "72px", height: "72px",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                borderRadius: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem",
                margin: "0 auto 1.25rem",
                boxShadow: "0 8px 24px rgb(79 70 229 / .3)",
              }}
            >
              📚
            </div>

            <h1
              style={{
                fontWeight: 900,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: "0.75rem",
              }}
            >
              <span className="gradient-text">StudyMate AI</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "var(--color-text-muted)",
                fontWeight: 400,
                maxWidth: "520px",
                margin: "0 auto 0.5rem",
              }}
            >
              Turn your study material into an interactive learning experience.
            </p>

            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Upload a PDF → Get a summary → Chat with your doc → Take a quiz
            </p>
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex", flexWrap: "wrap", gap: "0.625rem",
              justifyContent: "center", marginBottom: "2.5rem",
            }}
          >
            {[
              { icon: "📋", label: "AI Summary" },
              { icon: "💬", label: "Document Chat" },
              { icon: "🧠", label: "Quiz Generation" },
              { icon: "⚡", label: "Powered by Gemini" },
            ].map((f) => (
              <span
                key={f.label}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "99px",
                  padding: "0.35rem 0.875rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Upload card */}
          <div
            className="card-elevated animate-fade-in"
            style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}
          >
            <h2
              style={{
                fontWeight: 700, fontSize: "1rem", color: "var(--color-text)",
                marginBottom: "1.5rem", textAlign: "center",
              }}
            >
              Get started – upload your PDF
            </h2>
            <FileUpload onDocumentReady={handleDocumentReady} />
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center", marginTop: "2.5rem",
              fontSize: "0.78rem", color: "var(--color-text-muted)",
            }}
          >
            Supports lecture notes · textbook chapters · study guides · lecture slides
          </p>
        </main>
      </div>
    );
  }

  // ── Render: Dashboard ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Navbar documentName={documentName} onUploadNew={handleUploadNew} />

      <main className="container" style={{ paddingTop: "1.75rem", paddingBottom: "4rem" }}>

        {/* Document header bar */}
        <div
          className="card"
          style={{
            padding: "1rem 1.5rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
            borderColor: "#c7d2fe",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
            {/* PDF thumbnail */}
            <div
              style={{
                width: "40px", height: "48px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.6rem", fontWeight: 800,
                letterSpacing: "0.05em",
                boxShadow: "0 2px 6px rgb(239 68 68 / .3)",
                flexShrink: 0,
              }}
            >
              PDF
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700, fontSize: "0.975rem", color: "var(--color-text)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {documentName}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "2px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-success)" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                  Document ready
                </span>
                {isMock && <span className="badge badge-mock" style={{ marginLeft: "0.25rem" }}>⚡ Demo mode</span>}
              </div>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleUploadNew}>
            📄 Upload new PDF
          </button>
        </div>

        {/* Tab navigation */}
        <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "summary" && (
            <Summary key={documentName} documentName={documentName} isMock={isMock} />
          )}
          {activeTab === "chat" && (
            <Chat key={documentName} documentName={documentName} isMock={isMock} />
          )}
          {activeTab === "quiz" && (
            <Quiz key={documentName} documentName={documentName} isMock={isMock} />
          )}
        </div>
      </main>
    </div>
  );
}
