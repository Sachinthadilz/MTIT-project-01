/**
 * LandingPage â€” dark SaaS landing page for NoteVault.
 *
 * Design decisions
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * 1. DARK GRADIENT THEME  â€” hero-mesh radial gradients (indigo â†’ violet â†’ cyan)
 *    over a #07071a base give depth without a flat colour. Each section cycles
 *    through a slightly different gradient to create vertical motion as you scroll.
 *
 * 2. GLASSMORPHISM  â€” .glass / .glass-strong (index.css) use rgba bg +
 *    backdrop-filter blur + a thin rgba-white border. `isolation: isolate`
 *    prevents unintended blur compositing.
 *
 * 3. SCROLL REVEAL  â€” useReveal() wires a single IntersectionObserver that adds
 *    `.visible` to every `.reveal` element. The CSS transition does the fade-up.
 *    Delay variants (reveal-delay-N) stagger sibling cards with no JS.
 *
 * 4. STICKY NAV  â€” starts fully transparent; useNavScroll() adds `.nav-scrolled`
 *    after 60 px of scroll, applying a frosted-glass look without a React re-render.
 *
 * 5. NO EXTERNAL UI LIBRARIES  â€” every icon is an inline SVG path. Every card,
 *    button and badge is built from Tailwind utilities + index.css custom classes.
 *
 * 6. PERFORMANCE  â€” no images, no external fonts, no runtime animation library.
 *    All animations are CSS-only (GPU-composited transform + opacity).
 *
 * 7. ACCESSIBILITY  â€” landmarks, aria-labels, aria-hidden on decoratives, visible
 *    focus rings everywhere, skip-to-content link, semantic list roles.
 */

import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// â”€â”€â”€ Custom hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Scroll-triggered reveal: adds .visible to every .reveal inside containerRef. */
function useReveal(containerRef) {
  useEffect(() => {
    const root = containerRef?.current ?? document;
    const targets = root.querySelectorAll(".reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [containerRef]);
}

/** Adds .nav-scrolled to the nav element once user scrolls past 60 px. */
function useNavScroll(navRef) {
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const handler = () =>
      el.classList.toggle("nav-scrolled", window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [navRef]);
}

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ Feature data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEATURES = [
  {
    icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125",
    label: "Instant capture",
    colour: "from-indigo-500 to-violet-500",
    desc: "Open a note and start typing immediately â€” zero friction, zero nesting. Your ideas land exactly where you look.",
  },
  {
    icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z",
    label: "Grid overview",
    colour: "from-violet-500 to-purple-500",
    desc: "All notes laid out in a responsive 3-column grid. Scan titles and previews at a glance â€” no infinite scroll, no clutter.",
  },
  {
    icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
    label: "JWT auth",
    colour: "from-cyan-500 to-sky-500",
    desc: "Every note is ownership-fused to your account via JWT. bcrypt-hardened passwords. Tokens expire automatically.",
  },
  {
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
    label: "Focus editor",
    colour: "from-emerald-500 to-teal-500",
    desc: "A focused modal editor with focus-trap, Escape-to-close and an isDirty guard so you never lose unsaved work.",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Safe deletes",
    colour: "from-amber-500 to-orange-500",
    desc: "Accidental deletion is a real pain. A confirm alertdialog with keyboard focus gives you one deliberate chance to say yes.",
  },
  {
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    label: "Server pagination",
    colour: "from-rose-500 to-pink-500",
    desc: "Notes load in pages of nine. The API enforces page limits so the dashboard stays snappy even with hundreds of notes.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Register with an email and a strong password. We measure strength in real time and hash everything with bcrypt (cost factor 12) before it ever touches the database.",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
  {
    n: "02",
    title: "Write your first note",
    body: "Tap \u201cNew note\u201d, enter a title and body, hit save. The note is persisted in MongoDB under a compound index tied exclusively to your user ID \u2014 no one else can query it.",
    icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
  },
  {
    n: "03",
    title: "Access from any device",
    body: "Your 7-day JWT is stored locally. Open a browser anywhere, sign in once, and your entire notes library is right there \u2014 paginated, sorted, instantly editable.",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3",
  },
];

const SECURITY_STATS = [
  { value: "bcrypt", sub: "saltRounds 12", label: "Password hashing" },
  { value: "HS256", sub: "7-day expiry", label: "JWT algorithm" },
  { value: "10 rpm", sub: "auth routes", label: "Rate limiter" },
  { value: "Helmet", sub: "15 headers", label: "HTTP security" },
];

// â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TESTIMONIALS = [
  {
    quote:
      "I've tried every notes app. NoteVault is the first one that actually gets out of my way and lets me write.",
    name: "Amara O.",
    role: "Product designer",
    initials: "AO",
    ring: "ring-indigo-500/40",
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
  },
  {
    quote:
      "The password strength meter on signup and the confirm-before-delete dialog show the team sweats the details.",
    name: "James K.",
    role: "Backend engineer",
    initials: "JK",
    ring: "ring-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
  },
  {
    quote:
      "Grid layout + server pagination makes finding notes instant. It feels fast because it actually is fast.",
    name: "Priya R.",
    role: "UX researcher",
    initials: "PR",
    ring: "ring-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
  },
];

const TICKER_ITEMS = [
  "Bcrypt hashing",
  "JWT auth",
  "Rate limiting",
  "Ownership validation",
  "Input sanitisation",
  "CORS policy",
  "Helmet headers",
  "Password strength meter",
  "Confirm-before-delete",
  "Focus traps",
];

// â”€â”€â”€ Micro-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Icon({ d, className = "h-5 w-5", strokeWidth = 1.75 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
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
  );
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
      <span
        className="h-1.5 w-1.5 rounded-full bg-indigo-400"
        aria-hidden="true"
      />
      <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
        {children}
      </span>
    </div>
  );
}

// â”€â”€â”€ Section: Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32 text-center sm:px-6"
    >
      {/* Floating orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="animate-float-rev absolute right-[6%] top-[30%] h-64 w-64 rounded-full bg-violet-600/18 blur-3xl" />
        <div className="animate-float absolute bottom-[12%] left-[40%] h-56 w-56 rounded-full bg-cyan-500/12 blur-3xl" />
        <div
          className="animate-spin-slow absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/10"
          style={{ borderStyle: "dashed" }}
        />
        <div
          className="animate-spin-rev  absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/8"
          style={{ borderStyle: "dashed" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Live badge */}
        <div className="pulse-ring mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-indigo-400"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-indigo-300">
            Free &amp; open â€” no card required
          </span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Your thoughts,{" "}
          <span className="gradient-text animate-gradient">
            secured and&nbsp;synced
          </span>
        </h1>

        {/* Sub-heading */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          NoteVault is a fast, hardened notes app built on a JWT + bcrypt auth
          stack. Write, edit and organise from any device â€” with ownership
          validation on every single request.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="btn-shimmer group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto"
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
            Start writing for free
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto"
          >
            Sign in
            <svg
              className="h-4 w-4 opacity-60"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <dl className="mt-16 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm sm:grid-cols-3">
          {[
            { v: "100%", l: "Ownership verified" },
            { v: "JWT", l: "Stateless sessions" },
            { v: "0", l: "Setup steps" },
          ].map(({ v, l }) => (
            <div key={l} className="flex flex-col items-center gap-1 px-4 py-6">
              <dt className="order-2 text-xs text-slate-500">{l}</dt>
              <dd className="order-1 text-2xl font-extrabold text-white stat-glow sm:text-3xl">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Scroll cue */}
      <a
        href="#features"
        aria-label="Scroll to features"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 transition hover:text-slate-400 focus:outline-none focus-visible:text-slate-300"
      >
        <span className="text-[10px] uppercase tracking-widest">Explore</span>
        <svg
          className="h-4 w-4 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </a>
    </section>
  );
}

// â”€â”€â”€ Section: Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FeatureCard({ icon, label, desc, colour, delay }) {
  return (
    <div
      className={`glass gradient-border glass-hover inner-glow reveal ${delay} rounded-2xl p-6 transition`}
    >
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colour} shadow-lg`}
      >
        <Icon d={icon} className="h-5 w-5 text-white" strokeWidth={1.75} />
      </div>
      <h3 className="mb-2 text-sm font-bold text-white">{label}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

function Features() {
  const delays = [
    "",
    "reveal-delay-1",
    "reveal-delay-2",
    "reveal-delay-3",
    "reveal-delay-4",
    "reveal-delay-5",
  ];
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative bg-[#080818] px-4 py-24 sm:px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#07071a] to-transparent"
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center reveal">
          <SectionLabel>Everything you need</SectionLabel>
          <h2
            id="features-heading"
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Built for real work,{" "}
            <span className="gradient-text">not just demos</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-400">
            Every feature was designed with both the user experience and the
            security surface in mind â€” from the first commit.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} delay={delays[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// â”€â”€â”€ Section: How It Works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="relative overflow-hidden px-4 py-24 sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%), #07071a",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center reveal">
          <SectionLabel>Three steps</SectionLabel>
          <h2
            id="how-heading"
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Up and running in <span className="gradient-text">minutes</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 lg:block"
          />

          <ol
            className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
            role="list"
          >
            {STEPS.map(({ n, title, body, icon }, i) => (
              <li
                key={n}
                className={`glass gradient-border inner-glow reveal reveal-delay-${i + 1} rounded-2xl p-8`}
              >
                <div className="mb-5 flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white shadow-md shadow-indigo-500/30">
                    {n}
                  </span>
                  <div
                    className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Icon d={icon} className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// â”€â”€â”€ Section: Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Security() {
  return (
    <section
      aria-labelledby="security-heading"
      className="relative overflow-hidden bg-[#080818] px-4 py-24 sm:px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="glass-strong gradient-border inner-glow reveal rounded-3xl p-8 lg:p-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Copy */}
            <div className="lg:flex-1">
              <SectionLabel>Security first</SectionLabel>
              <h2
                id="security-heading"
                className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                Hardened from the{" "}
                <span className="gradient-text">ground up</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Security is not a checkbox at the end. Every layer of NoteVault
                was threat-modelled during development â€” from bcrypt cost
                factors and JWT expiry windows down to CORS policies, rate
                limiter thresholds and request body size caps.
              </p>
              <ul className="mt-6 space-y-2.5" role="list">
                {[
                  "IDOR prevention via ownership fusion on every query",
                  "Mass-assignment protection through strict field allowlisting",
                  "bcrypt password cap (128 chars) to prevent DoS",
                  "passwordChangedAt token invalidation",
                  "Helmet.js â€” 15 security-hardening HTTP headers",
                  "10 req / 15 min rate limiter on all auth routes",
                  "10 kb body size cap to prevent payload attacks",
                  "CORS multi-origin Set with callback(null, false) rejection",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 lg:w-72 lg:shrink-0">
              {SECURITY_STATS.map(({ value, sub, label }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-2xl bg-white/4 p-5 ring-1 ring-white/8 transition hover:ring-indigo-500/30"
                >
                  <span className="text-2xl font-black text-white stat-glow">
                    {value}
                  </span>
                  <span className="text-xs text-indigo-300">{sub}</span>
                  <span className="mt-1 text-xs text-slate-500">{label}</span>
                </div>
              ))}
              {/* Shield icon */}
              <div className="col-span-2 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 p-6 ring-1 ring-indigo-500/20">
                <svg
                  className="h-16 w-16 text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.25}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker strip */}
        <div
          aria-hidden="true"
          className="mt-8 overflow-hidden rounded-2xl border border-white/6 bg-white/3 py-3"
        >
          <div className="flex w-max animate-ticker gap-12 whitespace-nowrap px-6">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"
              >
                <span className="h-1 w-1 rounded-full bg-indigo-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€â”€ Section: Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TestimonialCard({
  quote,
  name,
  role,
  initials,
  ring,
  bg,
  text,
  delay,
}) {
  return (
    <figure
      className={`glass gradient-border glass-hover inner-glow reveal ${delay} flex flex-col rounded-2xl p-6 transition`}
    >
      <Stars />
      <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/6 pt-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ${ring} ${bg} ${text}`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Testimonials() {
  const delays = ["", "reveal-delay-2", "reveal-delay-4"];
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative px-4 py-24 sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 60%), #07071a",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center reveal">
          <SectionLabel>Loved by early users</SectionLabel>
          <h2
            id="testimonials-heading"
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            What people are <span className="gradient-text">saying</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} {...t} delay={delays[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// â”€â”€â”€ Section: CTA Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CTABanner() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-[#080818] px-4 py-24 sm:px-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent" />
        <div className="animate-float absolute -left-12 top-8 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="animate-float-rev absolute -right-12 bottom-8 h-64 w-64 rounded-full bg-violet-600/12 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl text-center reveal">
        <SectionLabel>Get started today</SectionLabel>
        <h2
          id="cta-heading"
          className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
        >
          Ready to clear your head?
        </h2>
        <p className="mt-4 text-base text-slate-400">
          Join NoteVault today â€” no credit card, no nonsense. Just notes,
          locked to you.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="btn-shimmer group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 hover:shadow-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto"
          >
            Create a free account
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

// â”€â”€â”€ Section: Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/6 bg-[#060614] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a
              href="/"
              aria-label="NoteVault home"
              className="mb-4 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600"
                aria-hidden="true"
              >
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">NoteVault</span>
            </a>
            <p className="text-xs leading-relaxed text-slate-600">
              A secure notes app built with React, Express, MongoDB and a
              hardened JWT + bcrypt auth stack.
            </p>
          </div>

          {/* App links */}
          <nav aria-label="App links">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              App
            </p>
            <ul className="space-y-2" role="list">
              {[
                { to: "/register", l: "Register" },
                { to: "/login", l: "Sign in" },
                { to: "/dashboard", l: "Dashboard" },
              ].map(({ to, l }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:text-indigo-400"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Stack */}
          <nav aria-label="Tech stack">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Stack
            </p>
            <ul className="space-y-2" role="list">
              {[
                "React 19 + Vite",
                "Express 5",
                "MongoDB + Mongoose",
                "Tailwind CSS v4",
                "JWT + bcrypt",
              ].map((item) => (
                <li key={item} className="text-xs text-slate-500">
                  {item}
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <nav aria-label="Page sections">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Sections
            </p>
            <ul className="space-y-2" role="list">
              {[
                { href: "#features", l: "Features" },
                { href: "#testimonials", l: "Testimonials" },
              ].map(({ href, l }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:text-indigo-400"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Legal */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/6 pt-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {year} NoteVault. Built with React, Express &amp; MongoDB.
          </p>
          <p className="text-xs text-slate-700">
            No cookies tracked &bull; No third-party analytics
          </p>
        </div>
      </div>
    </footer>
  );
}

// â”€â”€â”€ Root page component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const navRef = useRef(null);

  // Already authenticated â†’ skip landing
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  // Scroll-driven behaviours (no re-renders needed)
  useReveal(pageRef);
  useNavScroll(navRef);

  return (
    <div
      ref={pageRef}
      className="landing-page min-h-screen"
      style={{ background: "#07071a", color: "#f1f5f9" }}
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header
        ref={navRef}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{ background: "transparent" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a
            href="/"
            aria-label="NoteVault home"
            className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">NoteVault</span>
          </a>

          <nav
            aria-label="Site navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            {[
              { href: "#features", l: "Features" },
              { href: "#testimonials", l: "Testimonials" },
            ].map(({ href, l }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-slate-400 transition hover:text-white focus:outline-none focus-visible:text-indigo-400"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3.5 py-1.5 text-sm font-medium text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn-shimmer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main id="main-content">
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <Testimonials />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
