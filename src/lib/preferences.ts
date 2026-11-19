import { DEFAULT_INLAY, INLAYS, type Inlay } from "./inlays";
import { DEFAULT_WOOD, WOODS, type Wood } from "./woods";

/**
 * Personal preferences, kept in localStorage rather than the URL: they're about how this
 * user likes the app to look and sound, not part of what a shared link should show.
 */
export type Preferences = {
  wood: Wood;
  inlay: Inlay;
  /** How loud notes play, 0–100. */
  volume: number;
};

export const DEFAULT_PREFERENCES: Preferences = {
  wood: DEFAULT_WOOD,
  inlay: DEFAULT_INLAY,
  volume: 100,
};

const STORAGE_KEY = "fretboard-app:preferences";

function isWood(value: unknown): value is Wood {
  return WOODS.some((wood) => wood === value);
}

function isInlay(value: unknown): value is Inlay {
  return INLAYS.some((inlay) => inlay === value);
}

function isVolume(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
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
    // Each field is checked on its own, so one bad or missing value (e.g. preferences
    // saved before inlays existed) doesn't throw away the others.
    const { wood, inlay, volume } = saved as Record<string, unknown>;
    return {
      wood: isWood(wood) ? wood : DEFAULT_PREFERENCES.wood,
      inlay: isInlay(inlay) ? inlay : DEFAULT_PREFERENCES.inlay,
      volume: isVolume(volume) ? volume : DEFAULT_PREFERENCES.volume,
    };
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
