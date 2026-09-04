/**
 * YojanaSetu — localStorage Utilities
 *
 * Centralised access to all browser storage so components never call
 * localStorage directly. This makes it easy to swap in a different
 * persistence layer (e.g. IndexedDB, sessionStorage) later.
 *
 * Scope:
 *  - Saved / bookmarked scheme codes
 *  - Local cache of the last-submitted citizen profile
 */

import type { ProfileData } from "@/services/api/types";

// ---------------------------------------------------------------------------
// Keys (never use magic strings in components)
// ---------------------------------------------------------------------------
const KEY_SAVED_SCHEMES = "yojanasetu_saved_schemes";
const KEY_LOCAL_PROFILE = "yojanasetu_local_profile";
const KEY_DOCUMENT_READY = "yojanasetu_document_ready";

// ---------------------------------------------------------------------------
// Saved / bookmarked schemes  (localStorage — backend endpoint not yet available)
// ---------------------------------------------------------------------------

/** Returns the set of saved scheme codes. */
export function getSavedSchemes(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_SAVED_SCHEMES);
    const parsed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

/** Adds a scheme code to the saved set. Returns the updated set. */
export function saveScheme(schemeCode: string): Set<string> {
  const saved = getSavedSchemes();
  saved.add(schemeCode);
  persistSavedSchemes(saved);
  return saved;
}

/** Removes a scheme code from the saved set. Returns the updated set. */
export function unsaveScheme(schemeCode: string): Set<string> {
  const saved = getSavedSchemes();
  saved.delete(schemeCode);
  persistSavedSchemes(saved);
  return saved;
}

/** Returns true if the given scheme code is saved. */
export function isSchemeaved(schemeCode: string): boolean {
  return getSavedSchemes().has(schemeCode);
}

/** Toggles a scheme between saved and unsaved. Returns the updated set. */
export function toggleSavedScheme(schemeCode: string): Set<string> {
  return isSchemeaved(schemeCode)
    ? unsaveScheme(schemeCode)
    : saveScheme(schemeCode);
}

function persistSavedSchemes(saved: Set<string>): void {
  try {
    localStorage.setItem(KEY_SAVED_SCHEMES, JSON.stringify([...saved]));
  } catch {
    // Storage quota exceeded — silently fail
  }
}

// ---------------------------------------------------------------------------
// Local profile cache  (used to pre-fill forms; synced to backend on submit)
// ---------------------------------------------------------------------------

/** Returns the locally cached ProfileData, or null if none has been saved. */
export function getLocalProfile(): ProfileData | null {
  try {
    const raw = localStorage.getItem(KEY_LOCAL_PROFILE);
    return raw ? (JSON.parse(raw) as ProfileData) : null;
  } catch {
    return null;
  }
}

/**
 * Saves a partial or full ProfileData to localStorage.
 * Deep-merges with any existing cached data so partial updates don't wipe fields.
 */
export function setLocalProfile(updates: Partial<ProfileData>): ProfileData {
  const existing = getLocalProfile() ?? {};
  const merged: ProfileData = { ...existing, ...updates };
  try {
    localStorage.setItem(KEY_LOCAL_PROFILE, JSON.stringify(merged));
  } catch {
    // Storage quota exceeded — silently fail
  }
  return merged;
}

/** Clears the locally cached profile (e.g. on logout or reset). */
export function clearLocalProfile(): void {
  localStorage.removeItem(KEY_LOCAL_PROFILE);
}

/** Local-only readiness tracker; this is not document verification. */
export function getReadyDocuments(schemeCode: string): Set<string> {
  try {
    const all = JSON.parse(localStorage.getItem(KEY_DOCUMENT_READY) ?? "{}") as Record<string, string[]>;
    return new Set(all[schemeCode] ?? []);
  } catch { return new Set(); }
}

export function toggleReadyDocument(schemeCode: string, name: string): Set<string> {
  const ready = getReadyDocuments(schemeCode);
  if (ready.has(name)) ready.delete(name);
  else ready.add(name);
  try {
    const all = JSON.parse(localStorage.getItem(KEY_DOCUMENT_READY) ?? "{}") as Record<string, string[]>;
    all[schemeCode] = [...ready];
    localStorage.setItem(KEY_DOCUMENT_READY, JSON.stringify(all));
  } catch { /* availability is best effort only */ }
  return ready;
}
