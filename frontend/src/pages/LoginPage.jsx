import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { useFormFields } from "../hooks/useFormFields";
import { validateLogin } from "../lib/validators";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError, token } = useAuth();

  const [successMsg, setSuccessMsg] = useState("");
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    fields,
    fieldErrors,
    submittingRef,
    handleChange,
    focusFirstError,
    markErrors,
    isValid,
  } = useFormFields({ email: "", password: "" }, clearError);

  // Already logged in — redirect immediately
  useEffect(() => {
    if (token) navigate(from, { replace: true });
  }, [token, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || loading) return;

    const errors = validateLogin(fields);
    if (Object.keys(errors).length > 0) {
      markErrors(errors);
      focusFirstError(errors);
      return;
    }

    submittingRef.current = true;
    try {
      const result = await login({
        email: fields.email.trim(),
        password: fields.password,
      });

      if (result.success) {
        setSuccessMsg("Login successful! Redirecting…");
        setTimeout(() => navigate(from, { replace: true }), 800);
      } else if (result.fieldErrors?.length) {
        const mapped = Object.fromEntries(
          result.fieldErrors.map(({ field, message }) => [field, message]),
        );
        markErrors(mapped);
        focusFirstError(mapped);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-200 sm:px-8">
          {/* Live-region alerts */}
          {successMsg && (
            <Alert type="success" message={successMsg} className="mb-6" />
          )}
          {error && (
            <Alert
              type="error"
              message={error}
              onDismiss={clearError}
              className="mb-6"
            />
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            aria-label="Sign in form"
          >
            <Input
              autoFocus
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={handleChange}
              error={fieldErrors.email}
              valid={isValid("email")}
              disabled={loading}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={fields.password}
              onChange={handleChange}
              error={fieldErrors.password}
              valid={isValid("password")}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner size="h-4 w-4" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
