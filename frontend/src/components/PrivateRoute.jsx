import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute — protects any route that requires authentication.
 *
 * Usage in the router:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *     <Route path="/notes"     element={<NotesPage />} />
 *   </Route>
 *
 * How it works:
 *  1. Reads the token from AuthContext (not directly from localStorage so the
 *     context remains the single source of truth).
 *  2. If no token → redirects to /login, preserving the originally requested
 *     path in `location.state.from` so LoginPage can redirect back after
 *     a successful login.
 *  3. If token is present → renders the nested route via <Outlet />.
 *
 * Note: this is a client-side guard only. The real security enforcement is on
 * the backend (JWT verification on every API request). Never rely solely on
 * frontend route guards.
 */
export default function PrivateRoute() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace // avoids adding the protected route to browser history
      />
    );
  }

  return <Outlet />;
}
