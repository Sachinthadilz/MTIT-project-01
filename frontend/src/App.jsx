import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotesPage from "./pages/NotesPage";
import PrivateRoute from "./components/PrivateRoute";

/**
 * App — defines the client-side route tree.
 *
 * Public  routes:  /login  /register
 * Private routes:  /dashboard  (guarded by PrivateRoute → NotesPage)
 *
 * The root path "/" redirects to "/dashboard".
 * PrivateRoute bounces unauthenticated users to "/login",
 * preserving the originally requested path for post-login redirect.
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<NotesPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
