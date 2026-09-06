import { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../lib/useAuth";
import api from "../api/axios";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  tools?: string[];
}

const SUGGESTIONS = [
  "Which study room has been the most active?",
  "Summarise what we've covered so far",
  "Quiz me on my most recent session",
  "How many messages have I sent?",
];

// The AI Tutor: a multi-turn assistant that looks through your study rooms,
// sessions and progress with tool use before answering.
export default function Assistant() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiOff, setAiOff] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api
      .get("/ai/status")
      .then((r) => setAiOff(!r.data.available))
      .catch(() => setAiOff(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;

    const next: ChatMsg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setThinking(true);

    try {
      const res = await api.post("/ai/companion", {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages([
        ...next,
        { role: "assistant", content: res.data.reply, tools: res.data.toolsUsed || [] },
      ]);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "The tutor is unavailable right now.";
      setMessages([...next, { role: "assistant", content: msg }]);
    } finally {
      setThinking(false);
    }
  };

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

      <div
        className="cn-container"
        style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}
      >
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>
            <span className="cn-grad-text">AI Tutor</span> 🧑‍🏫
          </h1>
          <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 14 }}>
            Ask about your study rooms, sessions or progress — the tutor searches
            your data before answering, and remembers this conversation.
          </p>
        </div>

        {aiOff && (
          <div
            className="cn-card"
            style={{ borderColor: "var(--amber)", marginBottom: 14, fontSize: 14 }}
          >
            ⚠️ AI is turned off. Add <code>ANTHROPIC_API_KEY</code> to{" "}
            <code>server/.env</code> and restart the server.
          </div>
        )}

        <div
          className="cn-card"
          style={{
            flex: 1,
            minHeight: 360,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "auto",
            padding: 18,
          }}
        >
          {messages.length === 0 && (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--text-dim)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
              <p style={{ marginBottom: 14 }}>Try one of these:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={aiOff}
                    style={{ background: "var(--bg-3)", fontSize: 12 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.6,
                  background:
                    m.role === "user" ? "var(--brand)" : "var(--bg-1)",
                  border:
                    m.role === "user" ? "none" : "1px solid var(--border)",
                }}
              >
                {m.content}
              </div>
              {m.tools && m.tools.length > 0 && (
                <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[...new Set(m.tools)].map((t) => (
                    <span key={t} className="cn-pill" style={{ fontSize: 10 }}>
                      🔧 {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div style={{ alignSelf: "flex-start", color: "var(--brand-2)", fontSize: 13 }}>
              Tutor is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            style={{ flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask the tutor anything about your studying…"
            disabled={aiOff || thinking}
          />
          <button onClick={() => send(input)} disabled={aiOff || thinking || !input.trim()}>
            Send
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              style={{ background: "var(--bg-3)" }}
              title="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
