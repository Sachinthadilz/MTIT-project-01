import { useEffect, useRef, useState } from "react";
import Spinner from "../ui/Spinner";

const MAX_TITLE = 200;
const MAX_CONTENT = 10000;

/**
 * EditNoteModal
 *
 * Full-screen overlay modal for editing an existing note.
 * Traps focus inside and closes on Escape or backdrop click.
 *
 * Props:
 *  note      — { _id, title, content } — the note being edited, or null
 *  onSave    — async (id, { title, content }) => { success }
 *  onClose   — called to dismiss the modal
 *  saving    — bool: disables controls while save is in-flight
 */
export default function EditNoteModal({ note, onSave, onClose, saving }) {
  const [fields, setFields] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const modalRef = useRef(null);

  // Seed form when the note prop arrives
  useEffect(() => {
    if (note) {
      setFields({ title: note.title, content: note.content });
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [note]);

  // Keyboard handling: Escape closes, Tab traps focus
  useEffect(() => {
    if (!note) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [note, onClose]);

  if (!note) return null;

  const validate = () => {
    const errs = {};
    if (!fields.title.trim()) errs.title = "Title is required";
    else if (fields.title.trim().length > MAX_TITLE)
      errs.title = `Title must be ${MAX_TITLE} characters or fewer`;
    if (!fields.content.trim()) errs.content = "Content is required";
    else if (fields.content.trim().length > MAX_CONTENT)
      errs.content = `Content must be ${MAX_CONTENT} characters or fewer`;
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const result = await onSave(note._id, {
      title: fields.title.trim(),
      content: fields.content.trim(),
    });
    if (result?.success) onClose();
  };

  const isDirty =
    fields.title !== note.title || fields.content !== note.content;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2
            id="edit-modal-title"
            className="text-base font-semibold text-gray-900"
          >
            Edit note
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close edit modal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 px-6 py-5"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="edit-title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Title{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={titleRef}
              id="edit-title"
              name="title"
              type="text"
              maxLength={MAX_TITLE}
              value={fields.title}
              onChange={handleChange}
              disabled={saving}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "edit-title-error" : undefined}
              className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:opacity-50
                ${errors.title ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200"}`}
            />
            {errors.title && (
              <p
                id="edit-title-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="edit-content"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Content{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="edit-content"
              name="content"
              rows={8}
              maxLength={MAX_CONTENT}
              value={fields.content}
              onChange={handleChange}
              disabled={saving}
              aria-invalid={errors.content ? "true" : "false"}
              aria-describedby={
                errors.content ? "edit-content-error" : undefined
              }
              className={`block w-full resize-y rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:opacity-50
                ${errors.content ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200"}`}
            />
            {errors.content && (
              <p
                id="edit-content-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.content}
              </p>
            )}
            <p className="mt-1 text-right text-xs text-gray-400">
              {fields.content.length} / {MAX_CONTENT}
            </p>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !isDirty}
            aria-busy={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Spinner size="h-3.5 w-3.5" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
