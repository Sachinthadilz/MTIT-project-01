import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../api/axios";

// ── Context definition ────────────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Single source of truth for authentication state.
 * Wraps the whole app so any component can call useAuth() to:
 *  - Read:    user, token, loading, error
 *  - Mutate:  register(), login(), logout()
 *
 * Token storage strategy:
 *  localStorage is used as required. Trade-off acknowledged: it is accessible
 *  to JS (XSS risk), but it survives page refreshes without a dedicated
 *  refresh-token server endpoint. For higher security, move to HttpOnly cookies
 *  with a refresh-token flow.
 */
export function AuthProvider({ children }) {
  // Initialise from localStorage so the user stays logged in on refresh.
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Private helper — persist auth state ──────────────────────────────────
  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post("/auth/register", {
          name,
          email,
          password,
        });
        persist(data.token, data.user);
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Registration failed. Please try again.";
        // Server may return per-field errors: [{ field, message }]
        const serverFieldErrors = err.response?.data?.errors ?? [];
        setError(message);
        return { success: false, message, fieldErrors: serverFieldErrors };
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post("/auth/login", { email, password });
        persist(data.token, data.user);
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Login failed. Please try again.";
        // Server may return per-field errors: [{ field, message }]
        const serverFieldErrors = err.response?.data?.errors ?? [];
        setError(message);
        return { success: false, message, fieldErrors: serverFieldErrors };
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // ── clearError — lets pages dismiss the error without triggering an auth call
  const clearError = useCallback(() => setError(null), []);

  // Memoised value — prevents child re-renders when an unrelated parent re-renders.
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      register,
      login,
      logout,
      clearError,
    }),
    [user, token, loading, error, register, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — convenience hook.
 * Throws a descriptive error if used outside an AuthProvider,
 * rather than silently returning undefined.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
