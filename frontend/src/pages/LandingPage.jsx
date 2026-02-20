import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    ),
    title: "Write instantly",
    description:
      "Open a note and start typing — no setup, no folders to configure. Your thoughts land exactly where you want them.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
      />
    ),
    title: "Grid overview",
    description:
      "All your notes in a clean responsive grid. Scan titles and previews at a glance — no infinite scroll, no clutter.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    ),
    title: "Secured with JWT",
    description:
      "Every note is locked to your account. Industry-standard JSON Web Tokens and bcrypt hashing keep your data yours.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    ),
    title: "Edit anywhere",
    description:
      "Full inline editing with a focused modal. Change the title, rewrite the body, and save — all without leaving the page.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    title: "Confirmation before delete",
    description:
      "Accidentally deleting a note is a pain. A quick confirm dialog gives you one last chance before anything is gone.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
    title: "Paginated & fast",
    description:
      "Notes load in pages of nine. The server enforces limits so the API stays snappy even when you have hundreds of entries.",
  },
];

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I've tried every notes app. NoteVault is the first one that just gets out of my way.",
    name: "Amara O.",
    role: "Product designer",
    initials: "AO",
    color: "bg-violet-100 text-violet-700",
  },
  {
    quote:
      "The password strength meter on signup is a small detail that tells me the team cares about security.",
    name: "James K.",
    role: "Backend engineer",
    initials: "JK",
    color: "bg-blue-100 text-blue-700",
  },
  {
    quote:
      "Grid layout + fast pagination means I can actually find old notes. Huge quality of life upgrade.",
    name: "Priya R.",
    role: "UX researcher",
    initials: "PR",
    color: "bg-emerald-100 text-emerald-700",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-200">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
        <svg
          className="h-5 w-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role, initials, color }) {
  return (
    <figure className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {/* Stars */}
      <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="h-4 w-4 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Already authenticated — go straight to the app
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <a
            href="/"
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
            aria-label="NoteVault home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">
              NoteVault
            </span>
          </a>

          {/* Nav links */}
          <nav
            aria-label="Site navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            <a
              href="#features"
              className="text-sm text-gray-500 transition hover:text-gray-900"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm text-gray-500 transition hover:text-gray-900"
            >
              Testimonials
            </a>
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden bg-white px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32"
        >
          {/* Background gradient blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-violet-100 opacity-40 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <span
                className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"
                aria-hidden="true"
              />
              Free &amp; open to everyone
            </div>

            <h1
              id="hero-heading"
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            >
              Your ideas, always{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                within reach
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-gray-500 leading-relaxed">
              NoteVault is a fast, secure notes app built on a hardened JWT +
              bcrypt auth stack. Write, edit, and organise your notes — from any
              device, any time.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create a free account
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
              >
                Sign in to your account
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            {/* Social proof numbers */}
            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-gray-100 pt-10">
              {[
                { value: "100%", label: "Ownership validated" },
                { value: "JWT", label: "Stateless auth" },
                { value: "0", label: "Setup required" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-indigo-600 sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── App preview mockup ──────────────────────────────────────────── */}
        <section aria-hidden="true" className="bg-gray-50 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Browser chrome */}
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gray-300">
              {/* Title bar */}
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-200">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400 ring-1 ring-gray-200">
                  localhost:3000/dashboard
                </div>
              </div>

              {/* Fake app UI */}
              <div className="bg-white px-6 py-5">
                {/* Fake nav */}
                <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-600" />
                    <div className="h-3 w-20 rounded-full bg-gray-800" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100" />
                    <div className="h-7 w-16 rounded-lg bg-gray-100" />
                  </div>
                </div>

                {/* Fake note grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Create-note button */}
                  <div className="col-span-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-xs text-gray-400">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    New note
                  </div>

                  {/* Fake cards */}
                  {[
                    { title: "Meeting notes — Q1", lines: [3, 2] },
                    { title: "Book list 2026", lines: [2, 3] },
                    { title: "Project ideas", lines: [3, 1] },
                    { title: "Grocery run", lines: [2, 2] },
                    { title: "API design thoughts", lines: [3, 2] },
                    { title: "Weekend plan", lines: [1, 3] },
                  ].map(({ title, lines }, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white p-3.5 ring-1 ring-gray-200 shadow-sm"
                    >
                      <div
                        className="mb-2 h-2.5 rounded-full bg-gray-800"
                        style={{ width: `${60 + (i % 3) * 10}%` }}
                      />
                      <div className="space-y-1.5">
                        {Array.from({ length: lines[0] }).map((_, j) => (
                          <div
                            key={j}
                            className="h-1.5 rounded-full bg-gray-100"
                            style={{
                              width: j === lines[0] - 1 ? "60%" : "100%",
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-200" />
                        <div className="flex gap-1">
                          <div className="h-4 w-4 rounded bg-gray-100" />
                          <div className="h-4 w-4 rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="bg-white px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
                Everything you need
              </p>
              <h2
                id="features-heading"
                className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
              >
                Built for real use, not demos
              </h2>
              <p className="mt-3 mx-auto max-w-xl text-base text-gray-500">
                Every feature was designed with both the user experience and
                security model in mind from the first commit.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section
          aria-labelledby="how-heading"
          className="bg-gray-50 px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
              Three steps
            </p>
            <h2
              id="how-heading"
              className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            >
              Up and running in minutes
            </h2>

            <ol className="mt-12 grid gap-6 sm:grid-cols-3" role="list">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  description:
                    "Register with an email and a strong password. bcrypt hashing protects your credentials server-side.",
                },
                {
                  step: "02",
                  title: "Write your first note",
                  description:
                    'Hit "New note", type a title and body, and save. The note is stored in MongoDB and linked only to your account.',
                },
                {
                  step: "03",
                  title: "Access from anywhere",
                  description:
                    "Your JWT is stored locally and refreshed automatically. Sign in on any device and your notes are right there.",
                },
              ].map(({ step, title, description }) => (
                <li
                  key={step}
                  className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 text-left"
                >
                  <span className="mb-4 block text-4xl font-black text-indigo-100 leading-none">
                    {step}
                  </span>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────────── */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-heading"
          className="bg-white px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
                Loved by early users
              </p>
              <h2
                id="testimonials-heading"
                className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
              >
                What people are saying
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="relative overflow-hidden bg-indigo-600 px-4 py-20 sm:px-6"
        >
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-indigo-500 opacity-50 blur-3xl" />
            <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-violet-500 opacity-40 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              Ready to clear your head?
            </h2>
            <p className="mt-4 text-base text-indigo-200">
              Join NoteVault today — no credit card, no nonsense. Just notes.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-md transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600 sm:w-auto"
              >
                Start for free
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-indigo-400 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600 sm:w-auto"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600"
              aria-hidden="true"
            >
              <svg
                className="h-3.5 w-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">NoteVault</span>
          </div>

          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} NoteVault. Built with React,
            Express &amp; MongoDB.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs text-gray-400 transition hover:text-gray-600"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-xs text-gray-400 transition hover:text-gray-600"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
