import { useState } from "react";
import api from "../api/axios";

// Login Component
export default function Login() {
  // Form State Management
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Login Submission Handler
  const submit = async () => {
    await api.post("/auth/login", form);
    window.location.href = "/dashboard";
  };

  // UI Rendering
  return (
    <div>
      <h1>Login</h1>

      {/* Email Input */}
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* Password Input */}
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      {/* Login Button */}
      <button onClick={submit}>Login</button>
    </div>
  );
}
