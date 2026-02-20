import axios from "axios";

/**
 * Pre-configured Axios instance.
 *
 * In development, Vite proxies /api → http://localhost:5000 (see vite.config.js),
 * so requests like GET /api/notes hit the backend without any CORS preflight.
 *
 * In production, set VITE_API_BASE_URL in your .env to point at the live API.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10-second network timeout
});

// ── Request interceptor — attach JWT on every outgoing request ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — global 401 handling ────────────────────────────────
// If any response comes back as 401 (expired / invalid token), clear local
// storage and redirect to the login page so the user can re-authenticate.
// This prevents ghost sessions where the UI looks logged in but all API calls fail.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Hard redirect — clears any in-memory React state as a side effect.
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
