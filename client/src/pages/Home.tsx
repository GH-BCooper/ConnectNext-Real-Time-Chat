import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const FEATURES = [
  { icon: "💬", title: "Real-time rooms", text: "Create rooms, chat live, see who's online and who's typing." },
  { icon: "🤖", title: "AI Companion", text: "A multi-turn assistant that searches your rooms, messages and stats to answer." },
  { icon: "🎭", title: "Vibe Check", text: "Ask the AI to read a room's mood and energy in one tap." },
  { icon: "✨", title: "Summarize & Polish", text: "Digest long threads, and rewrite your draft before you hit send." },
  { icon: "💡", title: "Icebreakers", text: "Stuck? Claude suggests conversation starters based on the room." },
  { icon: "🧭", title: "Explore", text: "Search every message across every room from one page." },
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
            ⚡ Version 4 — now with an agentic AI Companion
          </span>
          <h1 style={{ fontSize: 56, margin: "16px 0 12px", letterSpacing: "-2px" }}>
            <span className="cn-grad-text">ConnectNext</span>
          </h1>
          <h2 style={{ fontWeight: 400, color: "var(--text-dim)", fontSize: 22, margin: "0 0 8px" }}>
            Connect. Chat. Collaborate — with an AI that actually knows your chats.
          </h2>
          <p style={{ color: "var(--text-faint)", maxWidth: 540, margin: "16px auto 32px" }}>
            A real-time chat app built for learning: React + TypeScript on the front,
            Node + Socket.IO + PostgreSQL on the back, and Claude woven through it.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} style={{ padding: "13px 32px", fontSize: 15 }}>
              Get Started
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
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
