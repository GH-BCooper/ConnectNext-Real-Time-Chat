import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import api from "../api/axios";

// Room Chat Component
export default function RoomChat() {
  // Navigation Hook
  const navigate = useNavigate();

  // URL Parameters
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
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  // Refs
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Check Authentication and Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        // Not logged in, redirect to login
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch Room Name
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

  // Auto Scroll To Latest Message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket Room Join And Event Listeners
  useEffect(() => {
    if (!roomId || !user) return;

    // Join Chat Room
    socket.emit("joinRoom", {
      roomId,
      username: user.username,
    });

    // Receive Incoming Messages
    const handleReceiveMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    // Typing Indicator Handler
    const handleTyping = (data: any) => {
      setTypingUser(data.username);
      setTimeout(() => setTypingUser(""), 1000);
    };

    // System Message Handler
    const handleSystem = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    // Online Users Handler
    const handleUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    // AI Typing Handler
    const handleAiTyping = (isTyping: boolean) => {
      setAiTyping(isTyping);
    };

    // Socket Event Listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("systemMessage", handleSystem);
    socket.on("roomUsers", handleUsers);
    socket.on("aiTyping", handleAiTyping);

    // Cleanup Socket Listeners
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("systemMessage", handleSystem);
      socket.off("roomUsers", handleUsers);
      socket.off("aiTyping", handleAiTyping);
    };
  }, [roomId, user]);

  // Fetch Previous Messages
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

  // Send Message Handler
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      roomId,
      message,
      username: user?.username,
    });

    setMessage("");
  };

  // Exit Room Handler
  const exitRoom = () => {
    socket.emit("leaveRoom", { roomId, username: user?.username });
    navigate("/dashboard");
  };

  // AI Summarize Handler
  const summarizeConversation = async () => {
    if (!roomId) return;

    setSummarizing(true);
    setSummary(null);

    try {
      const res = await api.get(`/ai/summarize/${roomId}`);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f172a",
          color: "white",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // UI Rendering
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
        }}
      >
        <h2 style={{ margin: 0 }}>{roomName || "Chat Room"}</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={summarizeConversation}
            disabled={summarizing}
            style={{
              padding: "8px 16px",
              background: "#7c3aed",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: summarizing ? "default" : "pointer",
              fontWeight: "bold",
              opacity: summarizing ? 0.7 : 1,
            }}
          >
            {summarizing ? "Summarizing..." : "✨ Summarize"}
          </button>
          <button
            onClick={exitRoom}
            style={{
              padding: "8px 16px",
              background: "#dc2626",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Exit Room
          </button>
        </div>
      </div>

      {/* AI Summary Modal */}
      {summary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setSummary(null)}
        >
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
            <h3 style={{ marginTop: 0, color: "#a78bfa" }}>
              ✨ Conversation Summary
            </h3>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {summary}
            </div>
            <button
              onClick={() => setSummary(null)}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                background: "#334155",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Chat Section */}
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          {/* Messages Container */}
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
            {messages.map((msg, i) => {
              const isMe = msg.username === user?.username;
              const isAI = msg.username === "AI Assistant";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  {/* Individual Message Bubble */}
                  <div
                    style={{
                      maxWidth: "60%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: isAI
                        ? "#4c1d95"
                        : isMe
                          ? "#2563eb"
                          : "#1e293b",
                      border: isAI ? "1px solid #a78bfa" : "none",
                    }}
                  >
                    {/* Message Sender */}
                    <strong style={{ fontSize: "12px" }}>
                      {isAI
                        ? "✨ AI Assistant"
                        : msg.username === user?.username
                          ? "You"
                          : msg.username || "System"}
                    </strong>

                    {/* Message Content */}
                    <div>{msg.message || msg.content}</div>

                    {/* Message Timestamp */}
                    {msg.time && (
                      <div style={{ fontSize: "10px", opacity: 0.6 }}>
                        {msg.time}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {aiTyping && (
              <p style={{ fontSize: "12px", marginBottom: "10px", color: "#a78bfa" }}>
                ✨ AI Assistant is thinking...
              </p>
            )}

            {/* Auto Scroll Reference */}
            <div ref={bottomRef}></div>
          </div>

          {/* Typing Indicator */}
          {typingUser && typingUser !== user?.username && (
            <p style={{ fontSize: "12px", marginBottom: "10px" }}>
              {typingUser} is typing...
            </p>
          )}

          {/* Message Input Section */}
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {/* Message Input Field */}
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
                  socket.emit("typing", {
                    roomId,
                    username: user.username,
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type a message... (try /ai <question>)"
            />

            {/* Send Message Button */}
            <button
              style={{
                padding: "10px 15px",
                background: "#2563eb",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>

        {/* Online Users Section */}
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

          {/* Online Users List */}
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

      {/* Footer with Copyright */}
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
