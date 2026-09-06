import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import api from "../api/axios";

// Room Chat Component
export default function RoomChat() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  // State Management
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [polishing, setPolishing] = useState(false);

  // Single AI modal used for both summary and icebreakers
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);
  const [busy, setBusy] = useState<"" | "summary" | "icebreakers">("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auth check
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Room name
  useEffect(() => {
    if (!roomId) return;
    const fetchRoomName = async () => {
      try {
        const res = await api.get("/rooms");
        const room = res.data.find((r: any) => r.id == roomId);
        setRoomName(room?.name || "Chat Room");
      } catch (error) {
        console.error("Error fetching room name:", error);
      }
    };
    fetchRoomName();
  }, [roomId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket events
  useEffect(() => {
    if (!roomId || !user) return;

    socket.emit("joinRoom", { roomId, username: user.username });

    const handleReceiveMessage = (data: any) =>
      setMessages((prev) => [...prev, data]);
    const handleTyping = (data: any) => {
      setTypingUser(data.username);
      setTimeout(() => setTypingUser(""), 1000);
    };
    const handleSystem = (data: any) => setMessages((prev) => [...prev, data]);
    const handleUsers = (users: string[]) => setOnlineUsers(users);
    const handleAiTyping = (isTyping: boolean) => setAiTyping(isTyping);

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("systemMessage", handleSystem);
    socket.on("roomUsers", handleUsers);
    socket.on("aiTyping", handleAiTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("systemMessage", handleSystem);
      socket.off("roomUsers", handleUsers);
      socket.off("aiTyping", handleAiTyping);
    };
  }, [roomId, user]);

  // Previous messages
  useEffect(() => {
    if (!roomId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { roomId, message, username: user?.username });
    setMessage("");
  };

  const exitRoom = () => {
    socket.emit("leaveRoom", { roomId, username: user?.username });
    navigate("/dashboard");
  };

  // AI: summarize the conversation
  const summarize = async () => {
    if (!roomId) return;
    setBusy("summary");
    try {
      const res = await api.get(`/ai/summarize/${roomId}`);
      setModal({ title: "✨ Conversation Summary", body: res.data.summary });
    } catch {
      setModal({ title: "✨ Conversation Summary", body: "Failed to generate summary. Try again." });
    } finally {
      setBusy("");
    }
  };

  // AI: suggest conversation starters
  const icebreakers = async () => {
    if (!roomId) return;
    setBusy("icebreakers");
    try {
      const res = await api.get(`/ai/icebreakers/${roomId}`);
      setModal({ title: "💡 Conversation Starters", body: res.data.ideas });
    } catch {
      setModal({ title: "💡 Conversation Starters", body: "Failed to load ideas. Try again." });
    } finally {
      setBusy("");
    }
  };

  // AI: polish the current draft message
  const polish = async () => {
    if (!message.trim()) return;
    setPolishing(true);
    try {
      const res = await api.post("/ai/polish", { text: message });
      setMessage(res.data.polished);
    } catch {
      // keep the original draft on failure
    } finally {
      setPolishing(false);
    }
  };

  if (loading) {
    return (
      <div style={fullCenter}>
        <p>Loading...</p>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const shown = q
    ? messages.filter((m) =>
        (m.message || m.content || "").toLowerCase().includes(q),
      )
    : messages;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#1e293b",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2 style={{ margin: 0 }}>{roomName || "Chat Room"}</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={icebreakers} disabled={busy !== ""} style={hdrBtn("#0891b2")}>
            {busy === "icebreakers" ? "Thinking..." : "💡 Icebreakers"}
          </button>
          <button onClick={summarize} disabled={busy !== ""} style={hdrBtn("#7c3aed")}>
            {busy === "summary" ? "Summarizing..." : "✨ Summarize"}
          </button>
          <button onClick={exitRoom} style={hdrBtn("#dc2626")}>
            Exit Room
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {modal && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e293b",
              padding: "24px",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "70vh",
              overflowY: "auto",
              border: "1px solid #7c3aed",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#a78bfa" }}>{modal.title}</h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {modal.body}
            </div>
            <button onClick={() => setModal(null)} style={{ ...hdrBtn("#334155"), marginTop: "16px" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 3, display: "flex", flexDirection: "column", padding: "20px" }}>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search messages in this room"
            style={{
              padding: "9px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white",
              outline: "none",
            }}
          />

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              borderRadius: "8px",
              background: "#020617",
              marginBottom: "10px",
            }}
          >
            {shown.length === 0 && (
              <p style={{ color: "#64748b", fontSize: "13px" }}>
                {q ? "No messages match your search." : "No messages yet — say hi!"}
              </p>
            )}

            {shown.map((msg, i) => {
              const isMe = msg.username === user?.username;
              const isAI = msg.username === "AI Assistant";
              const time =
                msg.time ||
                (msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString()
                  : "");

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "60%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: isAI ? "#4c1d95" : isMe ? "#2563eb" : "#1e293b",
                      border: isAI ? "1px solid #a78bfa" : "none",
                    }}
                  >
                    <strong style={{ fontSize: "12px" }}>
                      {isAI
                        ? "✨ AI Assistant"
                        : isMe
                          ? "You"
                          : msg.username || "System"}
                    </strong>
                    <div>{msg.message || msg.content}</div>
                    {time && (
                      <div style={{ fontSize: "10px", opacity: 0.6 }}>{time}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {aiTyping && (
              <p style={{ fontSize: "12px", marginBottom: "10px", color: "#a78bfa" }}>
                ✨ AI Assistant is thinking...
              </p>
            )}

            <div ref={bottomRef}></div>
          </div>

          {typingUser && typingUser !== user?.username && (
            <p style={{ fontSize: "12px", marginBottom: "10px" }}>
              {typingUser} is typing...
            </p>
          )}

          {/* Input */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #334155",
                background: "#1e293b",
                color: "white",
                outline: "none",
              }}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (user?.username) {
                  socket.emit("typing", { roomId, username: user.username });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message... (try /ai <question>)"
            />
            <button
              onClick={polish}
              disabled={polishing || !message.trim()}
              title="Rewrite my message with AI"
              style={{ ...hdrBtn("#7c3aed"), opacity: polishing || !message.trim() ? 0.6 : 1 }}
            >
              {polishing ? "..." : "✨ Polish"}
            </button>
            <button onClick={sendMessage} style={hdrBtn("#2563eb")}>
              Send
            </button>
          </div>
        </div>

        {/* Online users */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            borderLeft: "1px solid #1e293b",
            background: "#020617",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Online Users ({onlineUsers.length})</h3>
          {onlineUsers.map((u, i) => (
            <div
              key={i}
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#1e293b",
                borderRadius: "6px",
              }}
            >
              <span style={{ marginRight: "8px" }}>
                {u === user?.username ? "🟢" : "⚪"}
              </span>
              {u === user?.username ? "You" : u}
            </div>
          ))}
        </div>
      </div>

      <footer
        style={{
          padding: "15px 20px",
          textAlign: "center",
          borderTop: "1px solid #334155",
          color: "#64748b",
          fontSize: "12px",
          background: "#1e293b",
        }}
      >
        © 2026 Made by Brett Cooper
      </footer>
    </div>
  );
}

const fullCenter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "#0f172a",
  color: "white",
} as const;

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
} as const;

const hdrBtn = (bg: string) => ({
  padding: "8px 14px",
  background: bg,
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold" as const,
});
