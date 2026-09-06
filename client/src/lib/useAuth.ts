import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

// Shared auth guard for protected pages.
// Redirects to /login when the session is missing.
export function useAuth(redirect = true) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/auth/me")
      .then((res) => alive && setUser(res.data))
      .catch(() => {
        if (alive && redirect) navigate("/login");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [navigate, redirect]);

  return { user, loading };
}
