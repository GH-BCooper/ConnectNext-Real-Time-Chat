import { useMemo, useState } from "react";

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

// NEW in v5 — an interactive recall quiz built from the study session.
// Pick an answer for each question, submit, see your score + explanations.
export default function QuizModal({
  questions,
  onClose,
}: {
  questions: QuizQuestion[];
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () =>
      questions.reduce(
        (n, q, i) => (answers[i] === q.correct ? n + 1 : n),
        0,
      ),
    [answers, questions],
  );

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="cn-modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="cn-card cn-modal"
        style={{ borderColor: "var(--cyan)" }}
      >
        <h3 style={{ marginTop: 0, color: "var(--cyan)" }}>❓ Quiz Me</h3>

        {submitted && (
          <div
            className="cn-pill"
            style={{
              fontSize: 14,
              marginBottom: 16,
              background: "rgba(6,182,212,0.15)",
              borderColor: "rgba(6,182,212,0.5)",
              color: "#a5f3fc",
            }}
          >
            🎯 You scored {score} / {questions.length}
          </div>
        )}

        {questions.map((question, qi) => (
          <div key={qi} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              {qi + 1}. {question.q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {question.options.map((opt, oi) => {
                const picked = answers[qi] === oi;
                const isCorrect = question.correct === oi;
                let bg = "var(--bg-1)";
                let border = "var(--border)";
                if (submitted && isCorrect) {
                  bg = "rgba(34,197,94,0.18)";
                  border = "var(--green)";
                } else if (submitted && picked && !isCorrect) {
                  bg = "rgba(239,68,68,0.18)";
                  border = "var(--red)";
                } else if (picked) {
                  bg = "rgba(99,102,241,0.2)";
                  border = "var(--brand)";
                }
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      !submitted &&
                      setAnswers((a) => ({ ...a, [qi]: oi }))
                    }
                    disabled={submitted}
                    className="cn-bubble"
                    style={{
                      textAlign: "left",
                      background: bg,
                      border: `1px solid ${border}`,
                      color: "var(--text)",
                      fontWeight: 500,
                      padding: "9px 12px",
                      whiteSpace: "normal",
                      height: "auto",
                      width: "100%",
                    }}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
            {submitted && question.why && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                {question.why}
              </div>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              style={{ background: "var(--cyan)" }}
            >
              Submit answers
            </button>
          ) : (
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              style={{ background: "var(--brand-2)" }}
            >
              Try again
            </button>
          )}
          <button onClick={onClose} style={{ background: "var(--bg-3)" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
