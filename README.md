# NoteVault

A full-stack MERN note management application with JWT authentication, protected routes, and a clean production-ready architecture.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Folder Structure — Backend](#folder-structure--backend)
6. [Folder Structure — Frontend](#folder-structure--frontend)
7. [API Endpoints](#api-endpoints)
8. [Authentication Flow](#authentication-flow)
9. [Installation Guide](#installation-guide)
10. [Environment Variables](#environment-variables)
11. [Running Locally](#running-locally)
12. [Production Considerations](#production-considerations)
13. [Refactoring & Code Quality](#refactoring--code-quality)
14. [Future Improvements](#future-improvements)
15. [License](#license)

---

## Project Overview

NoteVault is a full-stack web application that allows users to register, log in, and manage personal notes. It is built on the MERN stack (MongoDB, Express, React, Node.js) with a clear separation between frontend and backend concerns.

The backend exposes a RESTful JSON API secured with JSON Web Tokens. Every notes endpoint enforces ownership — users can only read and modify their own notes. The frontend is a React single-page application built with Vite and styled with Tailwind CSS v4.

The project was built with production-grade patterns in mind: fail-fast environment validation, structured error normalisation, rate limiting, CORS hardening, and a fully refactored component architecture.

---

## Features

### Authentication

- User registration with name, email, and password
- Secure login with JWT-based sessions (7-day expiry)
- Password hashing with bcryptjs (saltRounds = 12)
- Token invalidation on password change
- Client-side and server-side input validation with consistent rules
- Automatic redirect on expired or invalid token (global 401 handler)

### Notes

- Create, read, update, and delete personal notes
- Paginated notes list (9 per page, configurable)
- Optimistic UI updates for create/update/delete
- Skeleton loading state during data fetch
- Note ownership enforced on every operation — no cross-user access

### Security

- HTTP security headers via Helmet
- Rate limiting on authentication endpoints (10 requests / 15 min per IP)
- CORS restricted to a configurable allowlist of origins
- Body payload size capped at 10 KB (DoS protection)
- JWT secret and MongoDB URI guarded with fail-fast startup validation
- No stack traces exposed in production responses

### UI / UX

- Responsive layout (mobile → desktop)
- Accessible markup: ARIA labels, live regions, focus management, keyboard trap in modals
- Dark-theme landing page with glassmorphism and scroll-reveal animations
- Password strength meter on registration
- Real-time field validation with green/red state indicators
- Skip-navigation link for keyboard users
- Password visibility toggle

---

## Tech Stack

### Backend

| Package            | Version | Purpose                       |
| ------------------ | ------- | ----------------------------- |
| Node.js            | 18+     | Runtime                       |
| Express            | 5.2.1   | HTTP framework                |
| Mongoose           | 9.2.1   | MongoDB ODM                   |
| bcryptjs           | 3.0.3   | Password hashing              |
| jsonwebtoken       | 9.0.3   | JWT signing and verification  |
| helmet             | 8.1.0   | HTTP security headers         |
| express-rate-limit | 8.2.1   | Request rate limiting         |
| cors               | 2.8.6   | Cross-Origin Resource Sharing |
| dotenv             | 17.3.1  | Environment variable loading  |
| nodemon            | 3.1.11  | Development auto-restart      |

### Frontend

| Package          | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| React            | 19.2.0  | UI library                  |
| Vite             | 7.3.1   | Build tool and dev server   |
| Tailwind CSS     | 4.2.0   | Utility-first CSS framework |
| Axios            | 1.13.5  | HTTP client                 |
| React Router DOM | 7.13.0  | Client-side routing         |

---

## Architecture Overview

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────┐
│           Frontend (React)           │     │         Backend (Express)        │
│                                     │     │                                  │
│  Browser → Vite Dev Server          │     │  Port 5000                       │
│  Port 3000                          │     │                                  │
│                                     │     │  ┌──────────┐  ┌─────────────┐  │
│  ┌──────────┐  ┌─────────────────┐  │     │  │  routes  │  │ middlewares │  │
│  │  pages   │  │    components   │  │     │  └────┬─────┘  └──────┬──────┘  │
│  └────┬─────┘  └────────┬────────┘  │     │       │               │         │
│       │                 │           │     │  ┌────▼───────────────▼──────┐  │
│  ┌────▼─────────────────▼────────┐  │     │  │       controllers         │  │
│  │    hooks / context / lib      │  │     │  └────────────┬──────────────┘  │
│  └───────────────┬───────────────┘  │     │               │                 │
│                  │                  │     │  ┌────────────▼──────────────┐  │
│  ┌───────────────▼───────────────┐  │     │  │         models            │  │
│  │     api/axios.js (Axios)      │  │     │  └────────────┬──────────────┘  │
│  └───────────────┬───────────────┘  │     │               │                 │
└──────────────────┼──────────────────┘     │  ┌────────────▼──────────────┐  │
                   │  /api/*                │  │   MongoDB Atlas (cloud)    │  │
                   │  (proxied in dev)      │  └───────────────────────────┘  │
                   └────────────────────────┘                                  │
                                            └─────────────────────────────────┘
```

### Backend request lifecycle

```
Request → helmet → cors → body-parser → rate-limiter (auth only)
       → protect (notes only) → validate → controller → model → MongoDB
       → response  |  errorHandler (normalises all errors to JSON)
```

### Frontend data flow

```
Page Component
  → useNotes / useAuth (hooks — all API logic lives here)
    → api/axios.js (pre-configured Axios instance with JWT interceptor)
      → /api/* (proxied to backend in development)
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`, eliminating CORS preflights during development. In production, the frontend is served from a CDN or static host and talks directly to the deployed API URL.

---

## Folder Structure — Backend

```
backend/
├── .env                        # Environment variables (never committed)
├── .gitignore
├── package.json
└── src/
    ├── app.js                  # Express app entry point
    ├── config/
    │   ├── cors.js             # CORS origin allowlist configuration
    │   ├── db.js               # MongoDB connection
    │   └── rateLimiter.js      # Auth rate-limiter configuration
    ├── controllers/
    │   ├── authController.js   # register, login, getMe
    │   └── noteController.js   # createNote, getNotes, updateNote, deleteNote
    ├── middlewares/
    │   ├── authMiddleware.js   # JWT verification (protect)
    │   ├── errorHandler.js     # Global error normalisation
    │   └── validate.js         # Request body and param validation
    ├── models/
    │   ├── User.js             # User schema (bcrypt pre-save hook)
    │   └── Note.js             # Note schema (owner reference, compound index)
    └── routes/
        ├── authRoutes.js       # POST /register, POST /login, GET /me
        └── noteRoutes.js       # GET, POST, PUT /:id, DELETE /:id
```

---

## Folder Structure — Frontend

```
frontend/
├── .env                        # Frontend environment variables
├── index.html
├── vite.config.js              # Vite + Tailwind + dev proxy configuration
└── src/
    ├── App.jsx                 # Route tree
    ├── main.jsx                # React root (BrowserRouter + AuthProvider)
    ├── index.css               # Tailwind base + custom keyframes and utilities
    ├── api/
    │   └── axios.js            # Axios instance with JWT request interceptor
    │                           # and global 401 response interceptor
    ├── components/
    │   ├── PrivateRoute.jsx    # JWT-guarded route wrapper
    │   ├── notes/
    │   │   ├── CreateNoteForm.jsx      # Collapsible inline create form
    │   │   ├── DeleteConfirmDialog.jsx # Accessible confirmation dialog
    │   │   ├── EditNoteModal.jsx       # Focus-trapped edit overlay
    │   │   ├── EmptyNotesState.jsx     # Empty state illustration
    │   │   ├── NoteCard.jsx            # Individual note card
    │   │   └── NoteSkeletons.jsx       # Shimmer loading placeholders
    │   └── ui/
    │       ├── Alert.jsx       # Dismissible success / error banner
    │       ├── Input.jsx       # Controlled input with validation states
    │       ├── Pagination.jsx  # Page-number navigation with ellipsis
    │       └── Spinner.jsx     # Animated SVG loading indicator
    ├── context/
    │   └── AuthContext.jsx     # Auth state (user, token, login, logout, register)
    ├── hooks/
    │   ├── useFormFields.js    # Shared form state hook (fields, errors, touched)
    │   └── useNotes.js         # Notes data hook (reducer + all CRUD actions)
    ├── lib/
    │   ├── api.js              # extractApiError / extractFieldErrors utilities
    │   ├── constants.js        # Shared limits (NOTE_MAX_TITLE, NOTE_MAX_CONTENT)
    │   └── validators.js       # Client-side validation (mirrors backend rules)
    └── pages/
        ├── LandingPage.jsx     # Public marketing page
        ├── LoginPage.jsx       # Login form
        ├── NotesPage.jsx       # Main protected dashboard
        └── RegisterPage.jsx    # Registration form with password strength meter
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

All protected endpoints require the header:

```
Authorization: Bearer <token>
```

All responses follow the shape:

```json
{ "success": true | false, "message": "...", ...data }
```

---

### Auth

#### `POST /auth/register`

Creates a new user account.

**Request body**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Validation rules**

- `name` — 2–50 printable ASCII characters
- `email` — RFC 5321 compliant
- `password` — 8–128 characters; must contain uppercase, lowercase, and a digit

**Response `201`**

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "..."
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 409 | Email already in use |
| 422 | Validation failed (returns `errors: [{ field, message }]`) |

---

#### `POST /auth/login`

Validates credentials and returns a signed JWT.

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "..."
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 401 | Invalid email or password (single unified message — no user enumeration) |
| 422 | Validation failed |

---

#### `GET /auth/me` 🔒

Returns the currently authenticated user's profile.  
The `protect` middleware provides `req.user` — no additional database query is made.

**Response `200`**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "..."
  }
}
```

---

### Notes

All notes endpoints require a valid JWT.

#### `GET /notes`

Returns a paginated list of the authenticated user's notes.

**Query parameters**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 9 | Notes per page (max 50) |

**Response `200`**

```json
{
  "success": true,
  "notes": [
    { "_id": "...", "title": "...", "content": "...", "updatedAt": "..." }
  ],
  "total": 42,
  "pages": 5,
  "page": 1
}
```

---

#### `POST /notes`

Creates a new note owned by the authenticated user.

**Request body**

```json
{
  "title": "Meeting notes",
  "content": "Discussed Q2 roadmap…"
}
```

**Validation rules**

- `title` — 1–200 characters
- `content` — 1–10,000 characters

**Response `201`**

```json
{
  "success": true,
  "note": {
    "_id": "...",
    "title": "...",
    "content": "...",
    "user": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### `PUT /notes/:id` 🔒

Updates an existing note. Only the owner can update. Both `title` and `content` are optional — at least one must be supplied.

**Request body** (partial update supported)

```json
{
  "title": "Updated title"
}
```

**Response `200`**

```json
{
  "success": true,
  "note": {
    "_id": "...",
    "title": "Updated title",
    "content": "…",
    "updatedAt": "..."
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | `id` is not a valid MongoDB ObjectId |
| 404 | Note not found or does not belong to the user |

---

#### `DELETE /notes/:id` 🔒

Permanently deletes a note. Only the owner can delete.

**Response `200`**

```json
{
  "success": true,
  "message": "Note deleted"
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | `id` is not a valid MongoDB ObjectId |
| 404 | Note not found or does not belong to the user |

---

## Authentication Flow

```
┌──────────────┐          ┌──────────────────┐          ┌───────────────┐
│   Browser     │          │  Express Backend  │          │    MongoDB    │
└──────┬───────┘          └────────┬─────────┘          └───────┬───────┘
       │                           │                             │
       │  POST /api/auth/login     │                             │
       │  { email, password }      │                             │
       │ ─────────────────────────►│                             │
       │                           │  User.findOne({ email })    │
       │                           │ ───────────────────────────►│
       │                           │◄───────────────────────────-│
       │                           │  bcrypt.compare(password)   │
       │                           │  jwt.sign({ id }, secret)   │
       │◄─────────────────────────-│                             │
       │  { token, user }          │                             │
       │                           │                             │
       │  GET /api/notes           │                             │
       │  Authorization: Bearer …  │                             │
       │ ─────────────────────────►│                             │
       │                           │  jwt.verify(token, secret)  │
       │                           │  User.findById(decoded.id)  │
       │                           │ ───────────────────────────►│
       │                           │◄────────────────────────────│
       │                           │  Note.find({ user: id })    │
       │                           │ ───────────────────────────►│
       │◄─────────────────────────-│◄────────────────────────────│
       │  { notes, total, pages }  │                             │
```

### Token storage

The JWT is stored in `localStorage` for persistence across page refreshes. The Axios request interceptor automatically attaches it as a `Bearer` token on every outgoing request. The response interceptor catches any `401` response globally, clears localStorage, and redirects to `/login`.

### Password change invalidation

The `User` model tracks `passwordChangedAt`. The `protect` middleware compares the token's `iat` (issued-at) claim against `passwordChangedAt`. If the password was changed after the token was issued, the token is rejected with `401`, forcing the user to log in again.

---

## Installation Guide

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A MongoDB Atlas cluster (or a local MongoDB instance)

### Clone the repository

```bash
git clone <repository-url>
cd "MTIT project 1"
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Environment Variables

### Backend — `backend/.env`

```env
# MongoDB connection string (Atlas recommended)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/notevault?retryWrites=true&w=majority

# JWT signing secret — use a long, random string (minimum 32 characters)
JWT_SECRET=replace_with_a_strong_random_secret_at_least_32_chars

# JWT expiry duration (default: 7d)
JWT_EXPIRES_IN=7d

# Server port (default: 5000)
PORT=5000

# Node environment: development | production
NODE_ENV=development

# Comma-separated list of allowed CORS origins
# In development, the Vite proxy handles this — no header needed
ALLOWED_ORIGIN=http://localhost:3000
```

> **Security note:** `JWT_SECRET` must be long and random. Generate one with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```
>
> Never commit `.env` to version control.

### Frontend — `frontend/.env`

```env
# API base URL — leave empty to use the Vite dev proxy (/api)
# Set this in production: VITE_API_BASE_URL=https://api.yourapp.com/api
VITE_API_BASE_URL=
```

---

## Running Locally

Open **two terminals** — one for each service.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

The backend starts on **http://localhost:5000**.  
You should see: `[SERVER] development | port 5000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

The frontend starts on **http://localhost:3000**.  
Vite proxies all `/api/*` requests to `http://localhost:5000` automatically.

### Verify the API is reachable

```bash
curl http://localhost:5000/
# → {"success":true,"status":"ok"}
```

---

## Production Considerations

### Backend

| Concern               | Implementation                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `NODE_ENV=production` | Set in your hosting environment. Suppresses stack traces in error responses and database host logging.    |
| `JWT_SECRET`          | Inject via a secrets manager (AWS Secrets Manager, Railway secrets, etc.) — never hardcode.               |
| `ALLOWED_ORIGIN`      | Set to your production frontend URL. Comma-separate multiple values.                                      |
| Process manager       | Use **PM2** (`pm2 start src/app.js --name notevault-api`) or a managed runtime (Railway, Render, Fly.io). |
| HTTPS                 | Terminate TLS at the load balancer or reverse proxy (Nginx, Caddy, Cloudflare). The app itself runs HTTP. |
| MongoDB               | Use a production-grade Atlas cluster (M10+) with IP access lists and a dedicated database user.           |

### Frontend

Build the production bundle:

```bash
cd frontend
npm run build
```

The `dist/` folder is fully static. Deploy it to:

- **Vercel** — drag and drop `dist/`, set `VITE_API_BASE_URL` in project settings.
- **Netlify** — connect the repo, set build command to `npm run build` and publish directory to `dist`.
- **AWS S3 + CloudFront** — upload `dist/`, configure the distribution for SPA routing (return `index.html` for all routes).

Set the environment variable `VITE_API_BASE_URL` to your deployed backend URL before building:

```bash
VITE_API_BASE_URL=https://api.yourapp.com/api npm run build
```

---

## Refactoring & Code Quality

Several deliberate architectural decisions were made to keep the codebase maintainable:

### Backend

| Pattern                      | Decision                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fail-fast startup            | Missing `MONGO_URI` or `JWT_SECRET` exits the process immediately with a clear message. The server never starts in a broken state.                                             |
| Config separation            | CORS origin parsing (`config/cors.js`) and rate-limiter config (`config/rateLimiter.js`) are extracted from `app.js`, which now only wires middleware — it does not define it. |
| Route imports at top         | All `require()` calls for routes are at the top of `app.js`. No inline `require()` inside `app.use()`.                                                                         |
| Unified error handler        | `middlewares/errorHandler.js` normalises Mongoose `ValidationError` (422), duplicate key (409), `CastError` (400), and JWT errors (401) into consistent JSON.                  |
| No production console.log    | Database connection host is only logged when `NODE_ENV !== "production"`.                                                                                                      |
| `"use strict"` everywhere    | All CommonJS modules declare `"use strict"` for consistent scoping.                                                                                                            |
| Password-change invalidation | `User.changedPasswordAfter(iat)` rejects tokens issued before a password reset.                                                                                                |
| No user enumeration          | Login returns a single `401` for both wrong email and wrong password.                                                                                                          |

### Frontend

| Pattern                      | Decision                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/validators.js`          | `EMAIL_RE`, `PASSWORD_RE`, `PRINTABLE_RE`, and validate functions live in one place. They were previously duplicated across `LoginPage` and `RegisterPage`. |
| `lib/constants.js`           | `NOTE_MAX_TITLE` and `NOTE_MAX_CONTENT` were duplicated in `CreateNoteForm` and `EditNoteModal`. Now imported from one source.                              |
| `lib/api.js`                 | `extractApiError()` and `extractFieldErrors()` replace six instances of `err.response?.data?.message \|\| "..."` scattered across hooks and context.        |
| `hooks/useFormFields.js`     | Extracts shared form state (fields, errors, touched, submittingRef, handleChange, focusFirstError, markErrors, isValid) from auth pages.                    |
| `hooks/useNotes.js`          | All Notes CRUD logic lives in the hook. Pages stay thin — they only compose UI.                                                                             |
| No passthrough handlers      | `NotesPage` previously wrapped `createNote` and `updateNote` in single-line functions with no added logic. These are now passed directly as props.          |
| Global 401 interceptor       | The Axios response interceptor in `api/axios.js` handles session expiry globally — no repeated 401 logic in components.                                     |
| `useReducer` for notes state | Notes state uses a reducer (not multiple `useState` calls) to keep state transitions explicit and debuggable.                                               |

---

## Future Improvements

- **Search and filter** — full-text search across note title and content using MongoDB's `$text` index.
- **Tags / categories** — allow users to organise notes with custom labels.
- **Rich text editor** — replace the plain textarea with a TipTap or Quill editor for formatting.
- **Soft delete** — archive notes instead of permanently deleting them, with a trash bin view.
- **Refresh token flow** — replace `localStorage` JWT storage with an HttpOnly cookie + refresh-token endpoint to eliminate XSS exposure of the access token.
- **Email verification** — confirm ownership of the email address before activating an account.
- **Password reset** — self-service password reset via a time-limited, single-use email link.
- **Note sharing** — generate shareable read-only links for individual notes.
- **Automated tests** — backend integration tests with Vitest + Supertest; frontend component tests with React Testing Library.
- **CI / CD pipeline** — GitHub Actions workflow to run lint, tests, and deploy on every push to `main`.
- **Rate limiting on notes** — extend rate limiting beyond auth endpoints to all API routes.

---

## License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2026

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```
