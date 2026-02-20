import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * DashboardPage — the root protected page.
 *
 * This is what authenticated users see after logging in.
 * Replace this placeholder with your real Notes UI once ready.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip-navigation link — visible only on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* Top navigation bar */}
      <nav
        aria-label="Primary navigation"
        className="border-b border-gray-200 bg-white"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">NoteVault</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              aria-label="Sign out of your account"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Page body */}
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        {/* Welcome card */}
        <div className="rounded-2xl bg-indigo-600 px-8 py-10 text-white shadow-md">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">
            Dashboard
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-2 text-indigo-200">
            You&apos;re securely authenticated. Your notes are ready.
          </p>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              label: "Account",
              value: user?.email,
              sub: "Verified",
            },
            {
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              label: "Notes",
              value: "Ready",
              sub: "POST /api/notes",
            },
            {
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              label: "Session",
              value: "JWT Active",
              sub: "Auto-expires in 7d",
            },
          ].map(({ icon, label, value, sub }) => (
            <div
              key={label}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {label}
              </p>
              <p
                className="mt-1 truncate text-sm font-bold text-gray-900"
                title={value}
              >
                {value}
              </p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Notes placeholder */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500">
            Notes UI coming soon
          </p>
          <p className="mt-1 text-xs text-gray-400">
            The backend CRUD API is live at{" "}
            <code className="rounded bg-gray-100 px-1 text-gray-600">
              /api/notes
            </code>
          </p>
        </div>
      </main>
    </div>
  );
}
