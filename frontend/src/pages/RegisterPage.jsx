import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";

// ── Client-side validation — mirrors backend rules exactly ────────────────────
const EMAIL_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,128}$/;

const PRINTABLE_RE = /^[\x20-\x7E]+$/;

function validate(fields) {
  const errors = {};
  const name = fields.name.trim();
  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2 || name.length > 50) {
    errors.name = "Name must be 2–50 characters";
  } else if (!PRINTABLE_RE.test(name)) {
    errors.name = "Name contains invalid characters";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!fields.password) {
    errors.password = "Password is required";
  } else if (!PASSWORD_RE.test(fields.password)) {
    errors.password =
      "Password must be 8–128 characters with uppercase, lowercase, and a number";
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError, token } = useAuth();

  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Already logged in — redirect immediately
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // confirmPassword is a UI-only field — never sent to the API
    const { confirmPassword: _unused, ...payload } = fields;
    const result = await register(payload);
    if (result.success) {
      setSuccessMsg("Account created! Redirecting to dashboard…");
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    }
  };

  // Real-time password strength indicator
  const strength = (() => {
    const p = fields.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[@$!%*?&]/.test(p)) score++;
    return score; // 0–5
  })();

  const strengthConfig = [
    { label: "", color: "bg-gray-200" }, // 0 — empty
    { label: "Very weak", color: "bg-red-500" }, // 1
    { label: "Weak", color: "bg-orange-400" }, // 2
    { label: "Fair", color: "bg-yellow-400" }, // 3
    { label: "Good", color: "bg-lime-500" }, // 4
    { label: "Strong", color: "bg-green-500" }, // 5
  ][strength];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Start managing your notes today
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200">
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Full name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={fields.name}
              onChange={handleChange}
              error={fieldErrors.name}
              disabled={loading}
            />

            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={handleChange}
              error={fieldErrors.email}
              disabled={loading}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={fields.password}
                onChange={handleChange}
                error={fieldErrors.password}
                disabled={loading}
                hint="Min 8 chars · uppercase · lowercase · number"
              />
              {/* Strength bar */}
              {fields.password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthConfig.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {strengthConfig.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={fields.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner size="h-4 w-4" />
                  <span>Creating account…</span>
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
