import { useCallback, useEffect, useReducer } from "react";
import api from "../api/axios";
import { extractApiError } from "../lib/api";

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  notes: [],
  total: 0,
  pages: 1,
  page: 1,
  loading: false, // initial fetch / page change
  saving: false, // create / update / delete in-flight
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        notes: action.payload.notes,
        total: action.payload.total,
        pages: action.payload.pages,
        page: action.payload.page,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SAVE_START":
      return { ...state, saving: true, error: null };
    case "SAVE_ERROR":
      return { ...state, saving: false, error: action.payload };

    // Optimistic add — server note replaces placeholder once resolved
    case "NOTE_CREATED":
      return {
        ...state,
        saving: false,
        notes: [action.payload, ...state.notes],
        total: state.total + 1,
      };
    case "NOTE_UPDATED":
      return {
        ...state,
        saving: false,
        notes: state.notes.map((n) =>
          n._id === action.payload._id ? action.payload : n,
        ),
      };
    case "NOTE_DELETED":
      return {
        ...state,
        saving: false,
        notes: state.notes.filter((n) => n._id !== action.payload),
        total: Math.max(0, state.total - 1),
      };

    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useNotes
 *
 * Encapsulates all Notes API interactions so pages stay thin.
 *
 * Returns:
 *   state    — { notes, total, pages, page, loading, saving, error }
 *   actions  — { fetchNotes, createNote, updateNote, deleteNote,
 *                setPage, clearError }
 */
export function useNotes() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Fetch a page of notes ─────────────────────────────────────────────────
  const fetchNotes = useCallback(async (page = 1, limit = 9) => {
    dispatch({ type: "FETCH_START" });
    try {
      const { data } = await api.get("/notes", { params: { page, limit } });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          notes: data.notes,
          total: data.total,
          pages: data.pages,
          page: data.page,
        },
      });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: extractApiError(
          err,
          "Failed to load notes. Please try again.",
        ),
      });
    }
  }, []);

  // Re-fetch whenever page changes
  useEffect(() => {
    fetchNotes(state.page);
  }, [state.page, fetchNotes]);

  // ── Create ────────────────────────────────────────────────────────────────
  const createNote = useCallback(async ({ title, content }) => {
    dispatch({ type: "SAVE_START" });
    try {
      const { data } = await api.post("/notes", { title, content });
      dispatch({ type: "NOTE_CREATED", payload: data.note });
      return { success: true };
    } catch (err) {
      const message = extractApiError(err, "Failed to create note.");
      dispatch({ type: "SAVE_ERROR", payload: message });
      return { success: false, message };
    }
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const updateNote = useCallback(async (id, { title, content }) => {
    dispatch({ type: "SAVE_START" });
    try {
      const { data } = await api.put(`/notes/${id}`, { title, content });
      dispatch({ type: "NOTE_UPDATED", payload: data.note });
      return { success: true };
    } catch (err) {
      const message = extractApiError(err, "Failed to update note.");
      dispatch({ type: "SAVE_ERROR", payload: message });
      return { success: false, message };
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteNote = useCallback(async (id) => {
    dispatch({ type: "SAVE_START" });
    try {
      await api.delete(`/notes/${id}`);
      dispatch({ type: "NOTE_DELETED", payload: id });
      return { success: true };
    } catch (err) {
      const message = extractApiError(err, "Failed to delete note.");
      dispatch({ type: "SAVE_ERROR", payload: message });
      return { success: false, message };
    }
  }, []);

  const setPage = useCallback(
    (p) => dispatch({ type: "SET_PAGE", payload: p }),
    [],
  );

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return {
    state,
    actions: {
      fetchNotes,
      createNote,
      updateNote,
      deleteNote,
      setPage,
      clearError,
    },
  };
}
