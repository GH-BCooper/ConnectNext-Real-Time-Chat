import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
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
        {/* Home Landing Page */}
        <Route path="/home" element={<Home />} />

        {/* Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Chat Room Route */}
        <Route path="/chat" element={<RoomChat />} />
      </Routes>
    </BrowserRouter>
  );
}
