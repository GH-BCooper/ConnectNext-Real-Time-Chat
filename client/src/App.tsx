import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import RoomChat from "./pages/RoomChat";
import Profile from "./pages/Profile";
import Assistant from "./pages/Assistant";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";
import "./styles/global.css";

// Main Application Component
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* App Routes (protected via useAuth inside each page) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<RoomChat />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
