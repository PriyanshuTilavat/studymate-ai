/**
 * FileUpload – drag-and-drop PDF upload component.
 *
 * States:
 *   idle      – no file selected, show drop zone
 *   selected  – file chosen, show file info + Analyse button
 *   uploading – calling the backend (or mock), show processing overlay
 *   error     – something went wrong
 */

import { useState, useRef, useCallback } from "react";
import { ProcessingOverlay } from "./Loading.jsx";
import { uploadDocument } from "../services/api.js";

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_BYTES   = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUpload({ onDocumentReady }) {
  const [file,        setFile]        = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error,       setError]       = useState("");
  const inputRef = useRef(null);

  // ── Validation ────────────────────────────────────────────────────────────
  function validateFile(f) {
    if (!f) return "No file selected.";
    if (f.type !== "application/pdf") return "Only PDF files are supported. Please choose a .pdf file.";
    if (f.size > MAX_FILE_BYTES)      return `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
    return null; // valid
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError("");
    setFile(f);
  }, []);

  function handleInputChange(e) {
    const f = e.target.files[0];
    if (f) handleFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave()  { setIsDragging(false); }

  function removeFile() {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleAnalyse() {
    if (!file) return;
    setIsUploading(true);
    setError("");

    try {
      const result = await uploadDocument(file);

      if (!result.success) throw new Error("Upload failed.");

      // Notify parent – pass the File object and mock flag
      onDocumentReady({
        file,
        documentName: file.name.replace(/\.pdf$/i, ""),
        isMock: result.isMock || false,
      });
    } catch (err) {
      setError("Something went wrong while uploading your document. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }

  // ── Render: uploading overlay ─────────────────────────────────────────────
  if (isUploading) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <ProcessingOverlay
          message="Analysing your document…"
          subMessage="The AI is reading and indexing your PDF. This may take a moment."
        />
      </div>
    );
  }

  // ── Render: main upload UI ────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Drop Zone */}
      {!file && (
        <div
          className={`dropzone ${isDragging ? "dropzone-active" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="PDF file drop zone"
          style={{
            padding: "3.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
            background: isDragging ? "var(--color-primary-light)" : "var(--color-surface)",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "72px", height: "72px",
              background: isDragging
                ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
                : "var(--color-primary-light)",
              borderRadius: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              transition: "all 0.2s ease",
              boxShadow: isDragging ? "0 4px 14px rgb(79 70 229 / .3)" : "none",
            }}
          >
            📄
          </div>

          <div>
            <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text)", marginBottom: "0.35rem" }}>
              {isDragging ? "Drop your PDF here" : "Upload your study PDF"}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Drag &amp; drop your PDF here, or{" "}
              <span style={{ color: "var(--color-primary)", fontWeight: 600, cursor: "pointer" }}>
                browse files
              </span>
            </p>
          </div>

          <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            PDF files up to {MAX_FILE_SIZE_MB} MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* File Selected Preview */}
      {file && (
        <div
          className="card animate-fade-in"
          style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}
        >
          {/* PDF icon */}
          <div
            style={{
              width: "48px", height: "56px", flexShrink: 0,
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              boxShadow: "0 2px 6px rgb(239 68 68 / .35)",
            }}
          >
            PDF
          </div>

          {/* File info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
              {formatFileSize(file.size)}
            </p>
          </div>

          {/* Remove button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={removeFile}
            aria-label="Remove file"
            style={{ flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error animate-fade-in" role="alert">
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {file ? (
          <>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAnalyse}>
              <span>🔍</span>
              <span>Analyse Document</span>
            </button>
            <button className="btn btn-ghost" onClick={removeFile}>
              Choose Different File
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline btn-lg"
            style={{ flex: 1 }}
            onClick={() => inputRef.current?.click()}
          >
            <span>📂</span>
            <span>Browse Files</span>
          </button>
        )}
      </div>

      {/* Supported formats note */}
      <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", textAlign: "center" }}>
        Supported: Lecture notes, textbook chapters, study guides, lecture slides
      </p>
    </div>
  );
}
