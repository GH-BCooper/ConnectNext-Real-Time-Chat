import { useState } from "react";
import api from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const submit = async () => {
    const res = await api.post("/auth/login", form);
    window.location.href = "/dashboard";
  };

  return (
    <div>
      <h1>Login</h1>

      <input placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input placeholder="Password" type="password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <button onClick={submit}>Login</button>
    </div>
  );
}