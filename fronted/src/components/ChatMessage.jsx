/**
 * ChatMessage – renders a single message bubble in the chat interface.
 *
 * Props:
 *   role    – "user" | "ai"
 *   content – message text string
 *   isLoading – true while the AI is generating a response (shows dots)
 */

export default function ChatMessage({ role, content, isLoading = false }) {
  const isUser = role === "user";

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: "0.625rem",
        marginBottom: "0.25rem",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "32px", height: "32px",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          fontSize: "0.9rem",
          background: isUser
            ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
            : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
          border: isUser ? "none" : "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {isUser ? "🧑" : "🤖"}
      </div>

      {/* Bubble */}
      <div
        className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}
        style={{
          position: "relative",
        }}
      >
        {isLoading ? (
          /* Typing indicator */
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0.25rem 0" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "7px", height: "7px",
                  borderRadius: "50%",
                  background: "var(--color-text-muted)",
                  animation: `bounce-dot 1.2s infinite ease-in-out ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
