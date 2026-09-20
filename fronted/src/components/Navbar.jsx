/**
 * Navbar – top navigation bar.
 * Shows the brand logo and, when a document is loaded, an "Upload New PDF" button.
 */

export default function Navbar({ documentName, onUploadNew }) {
  return (
    <nav
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgb(79 70 229 / .35)",
            }}
          >
            📚
          </div>
          <div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
              }}
              className="gradient-text"
            >
              StudyMate AI
            </span>
            {/* Show truncated document name in navbar when loaded */}
            {documentName && (
              <span
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                  lineHeight: 1,
                  marginTop: "2px",
                  maxWidth: "220px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {documentName}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--color-text-muted)",
              fontWeight: 500,
              display: window.innerWidth < 480 ? "none" : "inline",
            }}
          >
            AI-Powered Study Companion
          </span>

          {/* Show "Upload New PDF" button only when a document is already loaded */}
          {documentName && onUploadNew && (
            <button className="btn btn-outline btn-sm" onClick={onUploadNew}>
              <span>📄</span>
              <span>New PDF</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
