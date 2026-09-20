/**
 * Chat – RAG-powered document chat interface.
 *
 * Sends the user's question to POST /api/ask via services/api.js.
 * Falls back to mock answers when the backend is unavailable.
 */

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage.jsx";
import { askQuestion } from "../services/api.js";

const INITIAL_MESSAGE = {
  id: 0,
  role: "ai",
  content: "Hi! 👋 I've read your document and I'm ready to help. Ask me anything about it!",
};

export default function Chat({ documentName, isMock: parentIsMock }) {
  const [messages,  setMessages]  = useState([INITIAL_MESSAGE]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage() {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");
    inputRef.current?.focus();

    try {
      const result = await askQuestion(question);

      if (!result.success) throw new Error("Failed to get an answer.");

      const aiMessage = {
        id: Date.now() + 1,
        role: "ai",
        content: result.data.answer || "I couldn't find a relevant answer in the document. Try rephrasing your question.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError("Something went wrong while fetching the answer. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Send on Enter (but not Shift+Enter which inserts newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Suggested questions (shown when only the initial message exists) ───────
  const suggestions = [
    "Give me a quick overview of the document.",
    "What are the main topics covered?",
    "Explain the most important concept.",
    "What are the key takeaways?",
  ];

  function applySuggestion(text) {
    setInput(text);
    inputRef.current?.focus();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 280px)",
        minHeight: "480px",
        maxHeight: "700px",
      }}
    >
      {/* Header */}
      <div
        className="card"
        style={{
          padding: "0.875rem 1.25rem",
          marginBottom: "0.75rem",
          background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
          borderColor: "#c7d2fe",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>💬</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text)" }}>
            Document Chat
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Ask questions about <strong>{documentName}</strong>
          </p>
        </div>
        {parentIsMock && (
          <span className="badge badge-mock">⚡ Demo mode</span>
        )}
      </div>

      {/* Messages area */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "0.75rem",
        }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}

        {/* AI typing indicator */}
        {isLoading && (
          <ChatMessage role="ai" content="" isLoading={true} />
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error animate-fade-in" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Suggested questions (shown at start) */}
        {messages.length === 1 && !isLoading && (
          <div
            className="animate-fade-in"
            style={{ marginTop: "0.5rem" }}
          >
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
              💡 Try asking:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => applySuggestion(s)}
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.5rem 0.875rem",
                    fontSize: "0.82rem",
                    color: "var(--color-primary)",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-primary-light)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--color-bg)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="card"
        style={{
          padding: "0.75rem",
          display: "flex",
          alignItems: "flex-end",
          gap: "0.625rem",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about your document…"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "0.625rem 0.875rem",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            background: isLoading ? "var(--color-bg)" : "var(--color-surface)",
            color: "var(--color-text)",
            lineHeight: 1.5,
            maxHeight: "120px",
            overflowY: "auto",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          style={{ height: "42px", width: "42px", padding: 0, borderRadius: "var(--radius-md)", flexShrink: 0 }}
        >
          {isLoading ? (
            <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "0.4rem" }}>
        Press <kbd style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "3px", padding: "0 4px", fontSize: "0.7rem" }}>Enter</kbd> to send · <kbd style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "3px", padding: "0 4px", fontSize: "0.7rem" }}>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
