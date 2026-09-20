/**
 * Quiz – AI-generated multiple-choice quiz component.
 *
 * Phases:
 *   loading   – fetching questions from backend (or mock)
 *   error     – fetch failed
 *   question  – one question at a time
 *   score     – final results screen
 */

import { useState, useEffect } from "react";
import { QuizSkeleton } from "./Loading.jsx";
import { generateQuiz } from "../services/api.js";

export default function Quiz({ documentName, isMock: parentIsMock }) {
  const [questions,      setQuestions]      = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState("");
  const [isMock,         setIsMock]         = useState(false);

  // Quiz interaction state
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // index of selected option
  const [isAnswered,     setIsAnswered]      = useState(false);
  const [score,          setScore]          = useState(0);
  const [showScore,      setShowScore]      = useState(false);

  // ── Fetch questions ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchQuiz() {
      setIsLoading(true);
      setError("");
      resetQuizState();

      // Artificial delay for demo polish when mocking
      await new Promise((r) => setTimeout(r, parentIsMock ? 2000 : 0));

      try {
        const result = await generateQuiz();
        if (cancelled) return;

        if (!result.success || !result.data?.questions?.length) {
          throw new Error("No questions returned.");
        }

        setQuestions(result.data.questions);
        setIsMock(result.isMock || false);
      } catch (err) {
        if (!cancelled) {
          setError("Something went wrong while generating the quiz. Please try again.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchQuiz();
    return () => { cancelled = true; };
  }, [documentName]);

  function resetQuizState() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowScore(false);
  }

  function handleRetry() {
    resetQuizState();
    // Re-trigger effect by toggling a key (handled by parent re-mount if needed)
    // For simplicity, just reset state here — questions are already loaded.
    // Alternatively the component can be re-mounted by the parent.
  }

  // ── Select an option ───────────────────────────────────────────────────────
  function selectOption(index) {
    if (isAnswered) return;
    setSelectedOption(index);
  }

  // ── Submit answer ──────────────────────────────────────────────────────────
  function submitAnswer() {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    if (selectedOption === questions[currentIndex].answer) {
      setScore((prev) => prev + 1);
    }
  }

  // ── Next question ──────────────────────────────────────────────────────────
  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setShowScore(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }

  // ── Determine option style ─────────────────────────────────────────────────
  function getOptionClass(optionIndex) {
    if (!isAnswered) {
      return selectedOption === optionIndex ? "quiz-option quiz-option-selected" : "quiz-option";
    }
    const correct = questions[currentIndex].answer;
    if (optionIndex === correct) return "quiz-option quiz-option-correct";
    if (optionIndex === selectedOption && optionIndex !== correct) return "quiz-option quiz-option-incorrect";
    return "quiz-option";
  }

  // ── Render: loading ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <div className="skeleton" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ width: "120px", height: "20px" }} />
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          🧠 Generating quiz questions with AI…
        </p>
        <QuizSkeleton />
      </div>
    );
  }

  // ── Render: error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div className="alert alert-error">
          <span>⚠️</span>
          <div>
            <strong>Quiz unavailable</strong>
            <p style={{ marginTop: "0.25rem" }}>{error}</p>
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Render: score screen ───────────────────────────────────────────────────
  if (showScore) {
    const total      = questions.length;
    const percentage = Math.round((score / total) * 100);
    const grade      = percentage >= 80 ? "excellent" : percentage >= 60 ? "good" : "needs-work";
    const gradeInfo  = {
      excellent:  { emoji: "🎉", label: "Excellent!",    color: "var(--color-success)",  bg: "#d1fae5" },
      good:       { emoji: "👍", label: "Good job!",     color: "#d97706",               bg: "#fef3c7" },
      "needs-work": { emoji: "📚", label: "Keep studying!", color: "var(--color-error)",  bg: "#fee2e2" },
    }[grade];

    return (
      <div
        className="card animate-slide-up"
        style={{ padding: "2.5rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
      >
        {/* Grade badge */}
        <div
          style={{
            width: "96px", height: "96px",
            borderRadius: "50%",
            background: gradeInfo.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem",
            border: `3px solid ${gradeInfo.color}`,
          }}
        >
          {gradeInfo.emoji}
        </div>

        <div>
          <h2 style={{ fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", marginBottom: "0.25rem" }}>
            Quiz Complete!
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{documentName}</p>
        </div>

        {/* Score */}
        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <p style={{ fontSize: "3.5rem", fontWeight: 900, color: gradeInfo.color, lineHeight: 1 }}>
            {percentage}%
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text)" }}>
            {score} / {total} correct
          </p>
          <p style={{ fontSize: "1rem", color: gradeInfo.color, fontWeight: 700 }}>
            {gradeInfo.label}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {/* Per-question breakdown */}
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.625rem" }}>
            Question breakdown
          </p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
            {questions.map((q, i) => {
              // We can't track per-answer after state reset, so show a dot per question
              // with colour if we stored answers — for simplicity, show generic dots
              return (
                <div
                  key={i}
                  style={{
                    width: "10px", height: "10px",
                    borderRadius: "50%",
                    background: "var(--color-border)",
                  }}
                  title={`Question ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              resetQuizState();
            }}
          >
            🔄 Try Again
          </button>
        </div>

        {isMock && (
          <span className="badge badge-mock">⚡ Demo data – connect backend for real questions</span>
        )}
      </div>
    );
  }

  // ── Render: question ───────────────────────────────────────────────────────
  const question = questions[currentIndex];
  const isCorrect = isAnswered && selectedOption === question.answer;
  const progress  = ((currentIndex) / questions.length) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Quiz header */}
      <div
        className="card"
        style={{
          padding: "1rem 1.5rem",
          background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
          borderColor: "#c7d2fe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🧠</span>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text)" }}>
              AI Quiz
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {isMock && <span className="badge badge-mock">⚡ Demo</span>}
            <span
              style={{
                fontSize: "0.82rem", fontWeight: 600,
                color: "var(--color-primary)",
                background: "var(--color-primary-light)",
                padding: "0.25rem 0.625rem",
                borderRadius: "99px",
              }}
            >
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card animate-fade-in" style={{ padding: "1.75rem" }}>
        <p
          style={{
            fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem",
          }}
        >
          Question {currentIndex + 1}
        </p>

        <h3
          style={{
            fontWeight: 700, fontSize: "1.05rem", color: "var(--color-text)",
            lineHeight: 1.5, marginBottom: "1.5rem",
          }}
        >
          {question.question}
        </h3>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {question.options.map((option, idx) => {
            const letters = ["A", "B", "C", "D", "E"];
            const correct = isAnswered && idx === question.answer;
            const wrong   = isAnswered && idx === selectedOption && idx !== question.answer;

            return (
              <button
                key={idx}
                className={getOptionClass(idx)}
                onClick={() => selectOption(idx)}
                disabled={isAnswered}
                aria-pressed={selectedOption === idx}
              >
                {/* Letter badge */}
                <div
                  style={{
                    width: "28px", height: "28px",
                    borderRadius: "50%",
                    border: "1.5px solid",
                    borderColor: correct ? "var(--color-success)" : wrong ? "var(--color-error)" : selectedOption === idx ? "var(--color-primary)" : "var(--color-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: correct ? "#d1fae5" : wrong ? "#fee2e2" : selectedOption === idx ? "var(--color-primary-light)" : "transparent",
                    color: correct ? "#065f46" : wrong ? "#991b1b" : selectedOption === idx ? "var(--color-primary)" : "var(--color-text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {correct ? "✓" : wrong ? "✗" : letters[idx]}
                </div>

                <span style={{ flex: 1, textAlign: "left" }}>{option}</span>

                {/* Correctness icon on the right */}
                {isAnswered && correct && <span style={{ fontSize: "1rem", flexShrink: 0 }}>✅</span>}
                {isAnswered && wrong    && <span style={{ fontSize: "1rem", flexShrink: 0 }}>❌</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after answering) */}
        {isAnswered && question.explanation && (
          <div
            className="alert alert-info animate-fade-in"
            style={{ marginTop: "1.25rem" }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>💡</span>
            <div>
              <strong style={{ fontSize: "0.85rem" }}>
                {isCorrect ? "Correct! " : `Not quite. The correct answer is "${question.options[question.answer]}". `}
              </strong>
              <span style={{ fontSize: "0.875rem" }}>{question.explanation}</span>
            </div>
          </div>
        )}

        {/* Current score tracker */}
        {isAnswered && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.75rem", textAlign: "right" }}>
            Score so far: <strong style={{ color: "var(--color-primary)" }}>{score}</strong> / {currentIndex + 1}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {!isAnswered ? (
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={submitAnswer}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={nextQuestion}
          >
            {currentIndex + 1 >= questions.length ? "See Results 🏆" : "Next Question →"}
          </button>
        )}

        {/* Skip (only before answering) */}
        {!isAnswered && (
          <button
            className="btn btn-ghost"
            onClick={nextQuestion}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
