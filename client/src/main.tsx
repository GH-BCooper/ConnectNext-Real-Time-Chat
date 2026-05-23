import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// React Application Rendering
createRoot(document.getElementById("root")!).render(
  // Strict Mode Wrapper
  <StrictMode>
    <App />
  </StrictMode>,
);
