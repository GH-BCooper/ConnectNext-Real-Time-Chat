import { useState } from "react";
import api from "../api/axios";

// Register Component
export default function Register() {
  // Form State Management
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Registration Submission Handler
  const submit = async () => {
    await api.post("/auth/register", form);
    window.location.href = "/dashboard";
  };

  // UI Rendering
  return (
    <div>
      <h1>Register</h1>

      {/* Username Input */}
      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

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

      {/* Register Button */}
      <button onClick={submit}>Register</button>
    </div>
  );
}
