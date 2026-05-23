import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "../socket/socket";
import api from "../api/axios";

// Room Chat Component
export default function RoomChat() {
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

  // Refs
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch Room Name
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomName = async () => {
      const res = await api.get("/rooms");
      const room = res.data.find((r: any) => r.id == roomId);
      setRoomName(room?.name || "Chat Room");
    };

    fetchRoomName();
  }, [roomId]);

  // Auto Scroll To Latest Message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Logged In User
  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.get("/auth/me");
      setUser(res.data);
    };

    fetchUser();
  }, []);

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

    // Socket Event Listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("systemMessage", handleSystem);
    socket.on("roomUsers", handleUsers);

    // Cleanup Socket Listeners
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("systemMessage", handleSystem);
      socket.off("roomUsers", handleUsers);
    };
  }, [roomId, user]);

  // Fetch Previous Messages
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/messages/${roomId}`);
      setMessages(res.data);
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

  // UI Rendering
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >
      {/* Chat Section */}
      <div
        style={{
          flex: 3,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        {/* Room Title */}
        <h2 style={{ marginBottom: "10px" }}>{roomName || "Chat Room"}</h2>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
            borderRadius: "8px",
            background: "#020617",
          }}
        >
          {messages.map((msg, i) => {
            const isMe = msg.username === user?.username;

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
                    background: isMe ? "#2563eb" : "#1e293b",
                  }}
                >
                  {/* Message Sender */}
                  <strong style={{ fontSize: "12px" }}>
                    {msg.username === user?.username
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

          {/* Auto Scroll Reference */}
          <div ref={bottomRef}></div>
        </div>

        {/* Typing Indicator */}
        {typingUser && typingUser !== user?.username && (
          <p style={{ fontSize: "12px", marginTop: "5px" }}>
            {typingUser} is typing...
          </p>
        )}

        {/* Message Input Section */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {/* Message Input Field */}
          <input
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "none",
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
        }}
      >
        <h3>Online Users</h3>

        {/* Online Users List */}
        {onlineUsers.map((u, i) => (
          <div key={i} style={{ marginTop: "10px" }}>
            {u === user?.username ? "🟢 You" : u}
          </div>
        ))}
      </div>
    </div>
  );
}
