import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import api from "../api/axios";

// NEW in v4 — global search across every room's messages.
export default function Explore() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [touched, setTouched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setTouched(false);
      return;
    }
    setSearching(true);
    setTouched(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await api.get("/messages/search", { params: { q: q.trim() } });
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  if (loading) {
    return (
      <div className="cn-page">
        <div className="cn-container">Loading…</div>
      </div>
    );
  }

  return (
    <div className="cn-page">
      <NavBar username={user?.username} />

      <div className="cn-container" style={{ maxWidth: 760 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>
          <span className="cn-grad-text">Search</span> 🔍
        </h1>
        <p style={{ margin: "0 0 18px", color: "var(--text-dim)", fontSize: 14 }}>
          Find anything you've covered — across every study room and session.
        </p>

        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Search all messages…"
          style={{ width: "100%", fontSize: 15, padding: "12px 14px" }}
        />

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {searching && <p style={{ color: "var(--text-dim)" }}>Searching…</p>}

          {!searching && touched && results.length === 0 && (
            <p style={{ color: "var(--text-dim)" }}>No messages found for “{q}”.</p>
          )}

          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/chat?roomId=${r.room_id}`)}
              className="cn-card"
              style={{
                textAlign: "left",
                background: "var(--bg-2)",
                padding: 14,
                display: "block",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="cn-pill" style={{ fontSize: 11 }}>
                  #{r.room_name}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 14 }}>
                <strong style={{ color: "var(--brand-2)" }}>{r.username}: </strong>
                {highlight(r.content, q.trim())}
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "var(--amber)", color: "#111", borderRadius: 3 }}>
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}
