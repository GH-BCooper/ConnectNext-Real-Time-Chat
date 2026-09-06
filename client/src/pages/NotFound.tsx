import { useNavigate } from "react-router-dom";

// Shown for any unknown route.
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="cn-page">
      <div
        className="cn-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1 className="cn-grad-text" style={{ fontSize: 84, margin: 0 }}>
          404
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-dim)", marginBottom: 24 }}>
          This page doesn't exist.
        </p>
        <button onClick={() => navigate("/")} style={{ padding: "12px 28px" }}>
          Go home
        </button>
      </div>

      <footer className="cn-footer">© 2026 Made by Brett Cooper</footer>
    </div>
  );
}
