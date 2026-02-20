import { useEffect, useRef, useState } from "react";
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

// Real-time password strength scoring (0–5)
function scorePassword(p) {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[@$!%*?&]/.test(p)) score++;
  return score;
}

const STRENGTH_CONFIG = [
  { label: "", color: "bg-gray-200" }, // 0 — empty
  { label: "Very weak", color: "bg-red-500" }, // 1
  { label: "Weak", color: "bg-orange-400" }, // 2
  { label: "Fair", color: "bg-yellow-400" }, // 3
  { label: "Good", color: "bg-lime-500" }, // 4
  { label: "Strong", color: "bg-green-500" }, // 5
];

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
  const [touched, setTouched] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Prevent double-submit
  const submittingRef = useRef(false);

  // Already logged in — redirect immediately
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) clearError();
  };

  const focusFirstError = (errors) => {
    const firstKey = Object.keys(errors)[0];
    document.getElementById(firstKey)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || loading) return;

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.keys(errors).map((k) => [k, true])),
      }));
      focusFirstError(errors);
      return;
    }

    submittingRef.current = true;
    try {
      // confirmPassword is a UI-only field — never sent to the API
      const { confirmPassword: _unused, ...payload } = fields;
      // Trim whitespace from name and email before sending
      payload.name = payload.name.trim();
      payload.email = payload.email.trim();

      const result = await register(payload);
      if (result.success) {
        setSuccessMsg("Account created! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 800);
      } else if (result.fieldErrors?.length) {
        const mapped = {};
        result.fieldErrors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
        focusFirstError(mapped);
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const strength = scorePassword(fields.password);
  const strengthConfig = STRENGTH_CONFIG[strength];
  // A field is "valid" when touched, has a value, and is error-free
  const isValid = (name) => touched[name] && fields[name] && !fieldErrors[name];
  // Real-time confirm-password match (only show when both have values)
  const confirmMatch =
    fields.confirmPassword && fields.password === fields.confirmPassword;

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
        <div className="rounded-2xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-200 sm:px-8">
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
            aria-label="Create account form"
          >
            <Input
              autoFocus
              label="Full name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={fields.name}
              onChange={handleChange}
              error={fieldErrors.name}
              valid={isValid("name")}
              disabled={loading}
              placeholder="Jane Smith"
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
              valid={isValid("email")}
              disabled={loading}
              placeholder="you@example.com"
            />

            {/* Password with strength meter */}
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
                aria-describedby="password-hint password-strength"
              />

              {/* Accessible strength meter */}
              {fields.password && (
                <div className="pt-1">
                  <div
                    role="meter"
                    aria-label="Password strength"
                    aria-valuenow={strength}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuetext={strengthConfig.label || "empty"}
                    id="password-strength"
                    className="flex items-center gap-2"
                  >
                    <div className="flex flex-1 gap-1" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                            i <= strength ? strengthConfig.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className="w-16 text-right text-xs text-gray-500"
                      aria-hidden="true"
                    >
                      {strengthConfig.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password with live match indicator */}
            <div className="space-y-1">
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
                valid={!!confirmMatch}
                disabled={loading}
              />
              {/* Real-time match hint — only visible when passwords match (before form submit) */}
              {confirmMatch && !fieldErrors.confirmPassword && (
                <p
                  className="flex items-center gap-1 text-xs text-green-600"
                  aria-live="polite"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

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
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
