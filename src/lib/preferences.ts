import { DEFAULT_WOOD, WOODS, type Wood } from "./woods";

/**
 * Personal display preferences, kept in localStorage rather than the URL: they're about
 * how this user likes the app to look, not part of what a shared link should show.
 */
export type Preferences = {
  wood: Wood;
};

export const DEFAULT_PREFERENCES: Preferences = { wood: DEFAULT_WOOD };

const STORAGE_KEY = "fretboard-app:preferences";

function isWood(value: unknown): value is Wood {
  return WOODS.some((wood) => wood === value);
}

/**
 * Loads saved preferences, falling back to the defaults for anything missing or invalid.
 * Storage is untrusted (it may hold data from an older version, or be edited by hand), and
 * it can throw outright, e.g. when the browser blocks site data, so this never throws.
 */
export function loadPreferences(
  storage: Storage = window.localStorage,
): Preferences {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_PREFERENCES;
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== "object" || saved === null) {
      return DEFAULT_PREFERENCES;
    }
    const { wood } = saved as Record<string, unknown>;
    return { wood: isWood(wood) ? wood : DEFAULT_PREFERENCES.wood };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Saves preferences. If storage is unavailable the choice just won't be remembered. */
export function savePreferences(
  preferences: Preferences,
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage full or blocked: not worth interrupting the user over.
  }
}
