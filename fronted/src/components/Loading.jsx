/**
 * Loading – reusable loading states.
 *
 * Variants:
 *   spinner  – small inline spinner with an optional message
 *   overlay  – full-page centred overlay while processing
 *   skeleton – content placeholder skeletons for Summary
 */

/* ── Spinner ──────────────────────────────────────────────────────────────── */
export function Spinner({ message = "Loading…", size = "md" }) {
  const sizes = { sm: "1rem", md: "1.5rem", lg: "2.25rem" };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: s, height: s,
          border: "2.5px solid var(--color-primary-light)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.75s linear infinite",
        }}
      />
      {message && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );
}

/* ── Processing Overlay ───────────────────────────────────────────────────── */
export function ProcessingOverlay({ message = "Processing your document…", subMessage }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "1.5rem",
        textAlign: "center",
      }}
    >
      {/* Animated logo-like spinner */}
      <div style={{ position: "relative", width: "72px", height: "72px" }}>
        <div
          style={{
            width: "72px", height: "72px",
            border: "3px solid var(--color-primary-light)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            position: "absolute",
          }}
        />
        <div
          style={{
            width: "56px", height: "56px",
            border: "3px solid transparent",
            borderTopColor: "var(--color-secondary)",
            borderRadius: "50%",
            animation: "spin 0.65s linear infinite reverse",
            position: "absolute",
            top: "8px", left: "8px",
          }}
        />
        <div
          style={{
            width: "72px", height: "72px",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "absolute",
            fontSize: "1.5rem",
          }}
        >
          📚
        </div>
      </div>

      <div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text)" }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>
            {subMessage}
          </p>
        )}
      </div>

      {/* Animated dots */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              animation: `bounce-dot 1.2s infinite ease-in-out ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Summary Skeleton ─────────────────────────────────────────────────────── */
export function SummarySkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} aria-label="Loading summary">
      {/* Title */}
      <div className="skeleton" style={{ height: "28px", width: "55%", borderRadius: "6px" }} />
      {/* Overview block */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="skeleton" style={{ height: "16px", width: "100%" }} />
        <div className="skeleton" style={{ height: "16px", width: "92%" }} />
        <div className="skeleton" style={{ height: "16px", width: "78%" }} />
      </div>
      {/* Section heading */}
      <div className="skeleton" style={{ height: "20px", width: "38%", marginTop: "0.5rem" }} />
      {/* Bullet points */}
      {[90, 75, 82, 68, 85].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="skeleton" style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 }} />
          <div className="skeleton" style={{ height: "14px", width: `${w}%` }} />
        </div>
      ))}
      {/* Another section */}
      <div className="skeleton" style={{ height: "20px", width: "45%", marginTop: "0.5rem" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="skeleton" style={{ height: "16px", width: "100%" }} />
        <div className="skeleton" style={{ height: "16px", width: "85%" }} />
      </div>
    </div>
  );
}

/* ── Quiz Skeleton ────────────────────────────────────────────────────────── */
export function QuizSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} aria-label="Loading quiz">
      <div className="skeleton" style={{ height: "14px", width: "30%" }} />
      <div className="skeleton" style={{ height: "26px", width: "80%", marginTop: "0.25rem" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: "52px", borderRadius: "8px" }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: "44px", width: "160px", borderRadius: "8px", marginTop: "0.5rem" }} />
    </div>
  );
}

/* Default export – generic spinner */
export default Spinner;
