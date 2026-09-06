import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import { useAuth } from "../lib/useAuth";
import api from "../api/axios";
import QuizModal, { type QuizQuestion } from "../components/QuizModal";

export default function RoomChat() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [polishing, setPolishing] = useState(false);

  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);
  const [busy, setBusy] = useState<"" | "summary" | "icebreakers" | "vibe" | "quiz">("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Room name
  useEffect(() => {
    if (!roomId) return;
    api
      .get("/rooms")
      .then((res) => {
        const room = res.data.find((r: any) => r.id == roomId);
        setRoomName(room?.name || "Chat Room");
      })
      .catch((err) => console.error("Error fetching room name:", err));
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket events — joins on mount, cleanly leaves on unmount / room change
  useEffect(() => {
    if (!roomId || !user) return;

    socket.emit("joinRoom", { roomId, username: user.username });

    const onReceive = (data: any) => setMessages((prev) => [...prev, data]);
    const onTyping = (data: any) => {
      setTypingUser(data.username);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUser(""), 1500);
    };
    const onSystem = (data: any) => setMessages((prev) => [...prev, data]);
    const onUsers = (users: string[]) => setOnlineUsers(users);
    const onAiTyping = (v: boolean) => setAiTyping(v);

    socket.on("receiveMessage", onReceive);
    socket.on("typing", onTyping);
    socket.on("systemMessage", onSystem);
    socket.on("roomUsers", onUsers);
    socket.on("aiTyping", onAiTyping);

    return () => {
      socket.emit("leaveRoom", { roomId, username: user.username });
      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
      socket.off("systemMessage", onSystem);
      socket.off("roomUsers", onUsers);
      socket.off("aiTyping", onAiTyping);
    };
  }, [roomId, user]);

  // Previous messages
  useEffect(() => {
    if (!roomId) return;
    api
      .get(`/messages/${roomId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { roomId, message, username: user?.username });
    setMessage("");
  };

  const exitRoom = () => navigate("/dashboard");

  const runAI = async (
    kind: "summary" | "icebreakers" | "vibe",
    url: string,
    title: string,
    pick: (d: any) => string,
  ) => {
    if (!roomId) return;
    setBusy(kind);
    try {
      const res = await api.get(url);
      setModal({ title, body: pick(res.data) });
    } catch (err: any) {
      setModal({
        title,
        body: err.response?.data?.message || "Something went wrong. Try again.",
      });
    } finally {
      setBusy("");
    }
  };

  const summarize = () =>
    runAI("summary", `/ai/summarize/${roomId}`, "📝 Revision Notes", (d) => d.summary);
  const icebreakers = () =>
    runAI("icebreakers", `/ai/icebreakers/${roomId}`, "💡 Discussion Prompts", (d) => d.ideas);

  const quizMe = async () => {
    if (!roomId) return;
    setBusy("quiz");
    try {
      const res = await api.get(`/ai/quiz/${roomId}`);
      if (res.data.questions?.length) {
        setQuiz(res.data.questions);
      } else {
        setModal({
          title: "❓ Quiz Me",
          body: res.data.note || "Not enough discussion to build a quiz yet.",
        });
      }
    } catch (err: any) {
      setModal({
        title: "❓ Quiz Me",
        body: err.response?.data?.message || "Something went wrong. Try again.",
      });
    } finally {
      setBusy("");
    }
  };
  const vibeCheck = () =>
    runAI(
      "vibe",
      `/ai/vibe/${roomId}`,
      "🎭 Room Vibe Check",
      (d) =>
        `${d.emoji}  ${d.mood}\n\nFocus: ${"🔥".repeat(d.energy)}${"·".repeat(5 - d.energy)}\n\n${d.note}`,
    );

  const polish = async () => {
    if (!message.trim()) return;
    setPolishing(true);
    try {
      const res = await api.post("/ai/polish", { text: message });
      setMessage(res.data.polished);
    } catch {
      /* keep original draft */
    } finally {
      setPolishing(false);
    }
  };

  if (loading) {
    return (
      <div className="cn-page">
        <div className="cn-container">Loading…</div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const shown = q
    ? messages.filter((m) => (m.message || m.content || "").toLowerCase().includes(q))
    : messages;

  return (
    <div className="cn-page" style={{ height: "100vh" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15,23,42,0.7)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}># {roomName || "Study Room"}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={quizMe} disabled={busy !== ""} style={{ background: "var(--cyan)" }}>
            {busy === "quiz" ? "Building…" : "❓ Quiz Me"}
          </button>
          <button onClick={summarize} disabled={busy !== ""} style={{ background: "var(--brand-2)" }}>
            {busy === "summary" ? "Writing…" : "📝 Notes"}
          </button>
          <button onClick={icebreakers} disabled={busy !== ""} style={{ background: "var(--green)" }}>
            {busy === "icebreakers" ? "Thinking…" : "💡 Discuss"}
          </button>
          <button onClick={vibeCheck} disabled={busy !== ""} style={{ background: "var(--pink)" }}>
            {busy === "vibe" ? "Reading…" : "🎯 Focus"}
          </button>
          <button onClick={exitRoom} style={{ background: "var(--red)" }}>
            Exit
          </button>
        </div>
      </div>

      {quiz && <QuizModal questions={quiz} onClose={() => setQuiz(null)} />}

      {modal && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="cn-card"
            style={{ maxWidth: 500, width: "90%", maxHeight: "70vh", overflowY: "auto", borderColor: "var(--brand-2)" }}
          >
            <h3 style={{ marginTop: 0, color: "var(--brand-2)" }}>{modal.title}</h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{modal.body}</div>
            <button onClick={() => setModal(null)} style={{ marginTop: 16, background: "var(--bg-3)" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 3, display: "flex", flexDirection: "column", padding: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search messages in this room"
            style={{ marginBottom: 10 }}
          />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              borderRadius: 10,
              background: "var(--bg-1)",
              border: "1px solid var(--border)",
              marginBottom: 10,
            }}
          >
            {shown.length === 0 && (
              <p style={{ color: "var(--text-faint)", fontSize: 13 }}>
                {q ? "No messages match your search." : "No messages yet — say hi!"}
              </p>
            )}

            {shown.map((msg, i) => {
              const isMe = msg.username === user?.username;
              const isAI = msg.username === "AI Assistant";
              const time =
                msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : "");

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "9px 12px",
                      borderRadius: 12,
                      background: isAI ? "#3b0764" : isMe ? "var(--brand)" : "var(--bg-2)",
                      border: isAI ? "1px solid var(--brand-2)" : "1px solid var(--border)",
                    }}
                  >
                    <strong style={{ fontSize: 11, opacity: 0.85 }}>
                      {isAI ? "✨ AI Assistant" : isMe ? "You" : msg.username || "System"}
                    </strong>
                    <div style={{ fontSize: 14 }}>{msg.message || msg.content}</div>
                    {time && <div style={{ fontSize: 10, opacity: 0.6 }}>{time}</div>}
                  </div>
                </div>
              );
            })}

            {aiTyping && (
              <p style={{ fontSize: 12, color: "var(--brand-2)" }}>✨ AI Assistant is thinking…</p>
            )}
            <div ref={bottomRef} />
          </div>

          {typingUser && typingUser !== user?.username && (
            <p style={{ fontSize: 12, marginBottom: 8, color: "var(--text-dim)" }}>
              {typingUser} is typing…
            </p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1 }}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (user?.username) socket.emit("typing", { roomId, username: user.username });
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask the group something… (try /ai <question> for the tutor)"
            />
            <button
              onClick={polish}
              disabled={polishing || !message.trim()}
              title="Rewrite my message with AI"
              style={{ background: "var(--brand-2)" }}
            >
              {polishing ? "…" : "✨ Polish"}
            </button>
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>

        {/* Online users */}
        <div
          style={{
            flex: 1,
            minWidth: 180,
            padding: 16,
            borderLeft: "1px solid var(--border)",
            background: "var(--bg-1)",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Online ({onlineUsers.length})</h3>
          {onlineUsers.map((u, i) => (
            <div
              key={i}
              style={{
                marginTop: 8,
                padding: 9,
                background: "var(--bg-2)",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <span style={{ marginRight: 8 }}>{u === user?.username ? "🟢" : "⚪"}</span>
              {u === user?.username ? "You" : u}
            </div>
          ))}
        </div>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
} as const;
