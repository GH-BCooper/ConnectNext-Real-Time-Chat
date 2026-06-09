import { useNavigate } from "react-router-dom";

// Home Component - Landing Page
export default function Home() {
  // Navigation Hook
  const navigate = useNavigate();

  // UI Rendering
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        justifyContent: "space-between",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        {/* Logo/Title */}
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "20px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ConnectNext
        </h1>

        {/* Tagline */}
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "20px",
            fontWeight: "300",
            color: "#cbd5e1",
          }}
        >
          Connect. Chat. Collaborate.
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "18px",
            maxWidth: "500px",
            lineHeight: "1.6",
            color: "#94a3b8",
            marginBottom: "40px",
          }}
        >
          Join our vibrant community and connect with people around the world.
          Share ideas, chat in real-time, and build meaningful connections.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Login Button */}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 40px",
              fontSize: "16px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = "translateY(-2px)";
              target.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.3)";
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = "translateY(0)";
              target.style.boxShadow = "none";
            }}
          >
            Sign In
          </button>

          {/* Register Button */}
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "14px 40px",
              fontSize: "16px",
              fontWeight: "bold",
              background: "transparent",
              border: "2px solid #3b82f6",
              borderRadius: "8px",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = "#3b82f6";
              target.style.color = "white";
              target.style.transform = "translateY(-2px)";
              target.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.3)";
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = "transparent";
              target.style.color = "#3b82f6";
              target.style.transform = "translateY(0)";
              target.style.boxShadow = "none";
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Footer with Copyright */}
      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #334155",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        © 2026 Made by Brett Cooper
      </footer>
    </div>
  );
}
