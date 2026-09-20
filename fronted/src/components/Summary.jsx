/**
 * Summary – displays the AI-generated document summary.
 *
 * Fetches on mount (or when triggered), shows a skeleton while loading,
 * then renders title, overview, key concepts, sections, and takeaways.
 */

import { useState, useEffect } from "react";
import { SummarySkeleton } from "./Loading.jsx";
import { getSummary } from "../services/api.js";

export default function Summary({ documentName, isMock: parentIsMock }) {
  const [summary,   setSummary]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [isMock,    setIsMock]    = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setIsLoading(true);
      setError("");

      // Small artificial delay to show the skeleton when mocking
      await new Promise((r) => setTimeout(r, parentIsMock ? 1600 : 0));

      try {
        const result = await getSummary();
        if (cancelled) return;

        if (!result.success) throw new Error("Failed to generate summary.");
        setSummary(result.data);
        setIsMock(result.isMock || false);
      } catch (err) {
        if (!cancelled) {
          setError("Something went wrong while generating the summary. Please try again.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [documentName]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <div className="skeleton" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ width: "120px", height: "20px" }} />
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          ✨ Generating summary with AI…
        </p>
        <SummarySkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div className="alert alert-error">
          <span>⚠️</span>
          <div>
            <strong>Summary unavailable</strong>
            <p style={{ marginTop: "0.25rem" }}>{error}</p>
          </div>
        </div>
        <button
          className="btn btn-outline"
          style={{ marginTop: "1rem" }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header card */}
      <div
        className="card"
        style={{
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
          borderColor: "#c7d2fe",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📋</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Summary
              </span>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--color-text)", lineHeight: 1.25 }}>
              {summary.title || documentName}
            </h2>
          </div>

          {isMock && (
            <span className="badge badge-mock">
              ⚡ Demo data
            </span>
          )}
        </div>
      </div>

      {/* Overview */}
      {summary.overview && (
        <Section icon="📖" title="Overview">
          <p style={{ lineHeight: 1.7, color: "var(--color-text)", fontSize: "0.925rem" }}>
            {summary.overview}
          </p>
        </Section>
      )}

      {/* Key Concepts */}
      {summary.key_concepts && summary.key_concepts.length > 0 && (
        <Section icon="🔑" title="Key Concepts">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {summary.key_concepts.map((concept, i) => (
              <span
                key={i}
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary-dark)",
                  border: "1px solid #c7d2fe",
                  borderRadius: "99px",
                  padding: "0.3rem 0.85rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {concept}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Detailed Sections */}
      {summary.sections && summary.sections.length > 0 && (
        <Section icon="📝" title="Detailed Breakdown">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {summary.sections.map((sec, i) => (
              <div key={i}>
                <h4
                  style={{
                    fontWeight: 700, fontSize: "0.975rem",
                    color: "var(--color-text)", marginBottom: "0.35rem",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                  }}
                >
                  <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>{i + 1}.</span>
                  {sec.heading}
                </h4>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.65, paddingLeft: "1.2rem" }}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Takeaways */}
      {summary.key_takeaways && summary.key_takeaways.length > 0 && (
        <Section icon="💡" title="Key Takeaways">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {summary.key_takeaways.map((point, i) => (
              <li key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                <span
                  style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    color: "#fff", fontSize: "0.65rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "2px",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.55 }}>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/* ── Internal helper sub-component ─────────────────────────────────────────── */
function Section({ icon, title, children }) {
  return (
    <div className="card" style={{ padding: "1.5rem 1.75rem" }}>
      <h3
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          fontWeight: 700, fontSize: "1rem", color: "var(--color-text)",
          marginBottom: "1rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
