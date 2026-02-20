import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";

/**
 * Render order (outer → inner):
 *  BrowserRouter  — provides routing context (location, history)
 *    AuthProvider — provides authentication context (token, user, actions)
 *      App        — defines the route tree
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
