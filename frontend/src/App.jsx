import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";

/**
 * App — defines the client-side route tree.
 *
 * Public  routes:  /login  /register
 * Private routes:  /dashboard  (guarded by PrivateRoute)
 *
 * The root path "/" redirects to "/dashboard".
 * PrivateRoute then redirects unauthenticated users to "/login",
 * preserving the originally requested path so they bounce back after login.
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — PrivateRoute renders <Outlet /> only when authenticated */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
