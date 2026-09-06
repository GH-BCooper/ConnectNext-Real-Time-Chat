import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const links = [
  { to: "/dashboard", label: "Study Rooms", icon: "📚" },
  { to: "/explore", label: "Search", icon: "🔍" },
  { to: "/assistant", label: "AI Tutor", icon: "🧑‍🏫" },
  { to: "/profile", label: "Progress", icon: "📈" },
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
    <header className="cn-nav">
      <span className="cn-grad-text cn-nav__brand">ConnectNext</span>

      <nav className="cn-nav__links" aria-label="Primary">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              "cn-nav__link" + (isActive ? " active" : "")
            }
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="cn-nav__right">
        {username && (
          <span className="cn-nav__hi">
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
