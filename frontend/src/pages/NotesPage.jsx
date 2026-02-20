import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import Alert from "../components/ui/Alert";
import Pagination from "../components/ui/Pagination";
import CreateNoteForm from "../components/notes/CreateNoteForm";
import DeleteConfirmDialog from "../components/notes/DeleteConfirmDialog";
import EditNoteModal from "../components/notes/EditNoteModal";
import EmptyNotesState from "../components/notes/EmptyNotesState";
import NoteCard from "../components/notes/NoteCard";
import NoteSkeletons from "../components/notes/NoteSkeletons";

/**
 * NotesPage — the main protected dashboard.
 *
 * Layout:
 *   - Top navigation bar (brand + user info + sign-out)
 *   - Skip-nav link for keyboard users
 *   - Sticky page header with title and note count
 *   - CreateNoteForm (collapsible inline form)
 *   - 3-column responsive notes grid
 *   - Skeleton loading state while fetching
 *   - EmptyNotesState when there are no notes
 *   - Pagination controls
 *   - Edit modal (portal-like overlay)
 *   - Delete confirmation dialog
 *
 * Auth: only reachable via PrivateRoute; unauthenticated access bounces to /login.
 */
export default function NotesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state, actions } = useNotes();
  const { notes, total, pages, page, loading, saving, error } = state;
  const { createNote, updateNote, deleteNote, setPage, clearError } = actions;

  // Modal / dialog state
  const [editingNote, setEditingNote] = useState(null); // note object | null
  const [deletingNote, setDeletingNote] = useState(null); // note object | null

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = async (fields) => {
    const result = await createNote(fields);
    return result;
  };

  const handleUpdate = async (id, fields) => {
    const result = await updateNote(id, fields);
    return result;
  };

  const handleDelete = async () => {
    if (!deletingNote) return;
    const result = await deleteNote(deletingNote._id);
    if (result.success) setDeletingNote(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Skip navigation ────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* ── Top navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
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
            <span className="text-base font-bold text-gray-900 tracking-tight">
              NoteVault
            </span>
          </div>

          {/* User + sign-out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="max-w-[140px] truncate text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out of your account"
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ──────────────────────────────────────────────────── */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Page title + count */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              My Notes
            </h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-500">
                {total === 0
                  ? "No notes yet"
                  : `${total} note${total !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
        </div>

        {/* Global error banner */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onDismiss={clearError} />
          </div>
        )}

        {/* Create note form */}
        <div className="mb-6">
          <CreateNoteForm onSubmit={handleCreate} saving={saving} />
        </div>

        {/* Notes grid */}
        <section aria-label="Notes list">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <NoteSkeletons count={6} />
            ) : notes.length === 0 ? (
              <EmptyNotesState />
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={setEditingNote}
                  onDelete={setDeletingNote}
                  disabled={saving}
                />
              ))
            )}
          </div>
        </section>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="mt-8">
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        )}
      </main>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      <EditNoteModal
        note={editingNote}
        onSave={handleUpdate}
        onClose={() => setEditingNote(null)}
        saving={saving}
      />

      <DeleteConfirmDialog
        note={deletingNote}
        onConfirm={handleDelete}
        onCancel={() => setDeletingNote(null)}
        saving={saving}
      />
    </div>
  );
}
