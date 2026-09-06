import { useNavigate } from "react-router-dom";

// NotFound Component - shown for any unknown route
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
      <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "24px" }}>
        This page doesn't exist.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 28px",
          background: "#2563eb",
          border: "none",
          borderRadius: "8px",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Go Home
      </button>
    </div>
  );
}
