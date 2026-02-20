import { useRef, useState } from "react";
import Spinner from "../ui/Spinner";

const MAX_TITLE = 200;
const MAX_CONTENT = 10000;

/**
 * CreateNoteForm
 *
 * Collapsible inline form at the top of the notes grid.
 * Pressing "New note" button expands it; Cancel or successful submit collapses it.
 *
 * Props:
 *  onSubmit  — async (fields) => { success, message? }
 *  saving    — bool: disables controls while API call is in-flight
 */
export default function CreateNoteForm({ onSubmit, saving }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);

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

  const handleOpen = () => {
    setOpen(true);
    // Defer focus until the input is rendered
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setOpen(false);
    setFields({ title: "", content: "" });
    setErrors({});
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
    const result = await onSubmit({
      title: fields.title.trim(),
      content: fields.content.trim(),
    });
    if (result?.success) {
      setFields({ title: "", content: "" });
      setErrors({});
      setOpen(false);
    }
  };

  // Collapsed state — just a button
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-5 text-sm font-medium text-gray-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Add a new note"
      >
        <svg
          className="h-5 w-5"
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
        New note
      </button>
    );
  }

  // Expanded state — form card
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-2 ring-indigo-400 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Create note"
        className="space-y-3"
      >
        {/* Title */}
        <div>
          <label htmlFor="note-title" className="sr-only">
            Title
          </label>
          <input
            ref={titleRef}
            id="note-title"
            name="title"
            type="text"
            placeholder="Note title…"
            maxLength={MAX_TITLE}
            value={fields.title}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "note-title-error" : undefined}
            className={`block w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:opacity-50
              ${errors.title ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-indigo-200"}`}
          />
          {errors.title && (
            <p
              id="note-title-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="note-content" className="sr-only">
            Content
          </label>
          <textarea
            id="note-content"
            name="content"
            placeholder="Write your note…"
            rows={5}
            maxLength={MAX_CONTENT}
            value={fields.content}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={errors.content ? "true" : "false"}
            aria-describedby={errors.content ? "note-content-error" : undefined}
            className={`block w-full resize-y rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:opacity-50
              ${errors.content ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-indigo-200"}`}
          />
          {errors.content && (
            <p
              id="note-content-error"
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

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Spinner size="h-3.5 w-3.5" />
                Saving…
              </>
            ) : (
              "Save note"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
