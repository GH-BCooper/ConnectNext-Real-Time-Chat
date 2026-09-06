import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const links = [
  { to: "/dashboard", label: "Rooms", icon: "💬" },
  { to: "/explore", label: "Explore", icon: "🧭" },
  { to: "/assistant", label: "Companion", icon: "🤖" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function NavBar({ username }: { username?: string }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    } finally {
      navigate("/login");
    }
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        flexWrap: "wrap",
      }}
    >
      <span
        className="cn-grad-text"
        style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}
      >
        ConnectNext
      </span>

      <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({ isActive }) => ({
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "white" : "var(--text-dim)",
              background: isActive ? "var(--brand)" : "transparent",
              border: "1px solid",
              borderColor: isActive ? "transparent" : "var(--border)",
            })}
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {username && (
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Hi, <strong style={{ color: "var(--text)" }}>{username}</strong>
          </span>
        )}
        <button onClick={logout} style={{ background: "var(--red)" }}>
          Logout
        </button>
      </div>
    </header>
  );
}
