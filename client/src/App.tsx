import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RoomChat from "./pages/RoomChat";
import "./styles/global.css";

// Main Application Component
export default function App() {
  // Application Routing
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Chat Room Route */}
        <Route path="/chat" element={<RoomChat />} />
      </Routes>
    </BrowserRouter>
  );
}
