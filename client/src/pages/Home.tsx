import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const FEATURES = [
  { icon: "📚", title: "Live study rooms", text: "Make a room for any subject, study together in real time, see who's online." },
  { icon: "❓", title: "Quiz Me", text: "One tap turns what your group just discussed into a multiple-choice recall quiz." },
  { icon: "📝", title: "Revision notes", text: "Claude condenses a whole session into the points that are actually worth remembering." },
  { icon: "🧑‍🏫", title: "AI Tutor", text: "A multi-turn tutor that searches your rooms, sessions and progress before it answers." },
  { icon: "🎯", title: "Focus check", text: "Ask the AI whether the room is locked in or drifting — and what to do about it." },
  { icon: "💡", title: "Discussion prompts", text: "Stuck? Get three questions that push the group's understanding further." },
];

const STEPS = [
  { n: "1", t: "Make a room", d: "Name it after what you're studying — “Organic Chemistry”, “System Design”, “Spanish B2”." },
  { n: "2", t: "Study out loud", d: "Explain things to each other in chat. Ping the tutor with /ai when you're stuck." },
  { n: "3", t: "Test it stuck", d: "Hit Quiz Me, score yourselves, then grab the revision notes for later." },
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me").then(() => navigate("/dashboard")).catch(() => {});
  }, [navigate]);

  return (
    <div className="cn-page">
      <div className="cn-container" style={{ textAlign: "center" }}>
        <div style={{ padding: "60px 0 40px" }}>
          <span className="cn-pill" style={{ marginBottom: 20 }}>
            ⚡ Version 5 — study rooms with a built-in AI tutor
          </span>
          <h1 style={{ fontSize: 56, margin: "16px 0 12px", letterSpacing: "-2px" }}>
            <span className="cn-grad-text">ConnectNext</span>
          </h1>
          <h2 style={{ fontWeight: 400, color: "var(--text-dim)", fontSize: 22, margin: "0 0 8px" }}>
            Study together in real time — and prove it stuck.
          </h2>
          <p style={{ color: "var(--text-faint)", maxWidth: 560, margin: "16px auto 32px" }}>
            Group study rooms where you learn out loud, then turn the session into a
            quiz and a set of revision notes. Built with React, Node, Socket.IO and
            Claude — as a project to learn from.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} style={{ padding: "13px 32px", fontSize: 15 }}>
              Start studying
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{ padding: "13px 32px", fontSize: 15, background: "transparent", border: "2px solid var(--brand)" }}
            >
              Sign In
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            textAlign: "left",
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="cn-card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{f.title}</h3>
              <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 13 }}>{f.text}</p>
            </div>
          ))}
        </div>

        <div style={{ margin: "48px 0 8px" }}>
          <h2 style={{ fontSize: 22, margin: "0 0 20px" }}>
            How a <span className="cn-grad-text">session</span> works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              textAlign: "left",
            }}
          >
            {STEPS.map((s) => (
              <div key={s.n} className="cn-card">
                <div
                  className="cn-grad-text"
                  style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}
                >
                  {s.n}
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>{s.t}</h3>
                <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 13 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
