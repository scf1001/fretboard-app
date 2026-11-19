import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
} from "./preferences";

const KEY = "fretboard-app:preferences";

/** A Storage whose every method throws, like a browser with site data blocked. */
const blockedStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
} as unknown as Storage;

beforeEach(() => {
  localStorage.clear();
});

describe("loadPreferences", () => {
  it("returns the defaults when nothing has been saved", () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("round-trips what savePreferences stored", () => {
    savePreferences({ wood: "ebony" });
    expect(loadPreferences()).toEqual({ wood: "ebony" });
  });

  it("falls back to the default wood for an unknown wood", () => {
    localStorage.setItem(KEY, JSON.stringify({ wood: "balsa" }));
    expect(loadPreferences().wood).toBe(DEFAULT_PREFERENCES.wood);
  });

  it.each(["not json", "null", "42", '"rosewood"'])(
    "falls back to the defaults for malformed data: %s",
    (raw) => {
      localStorage.setItem(KEY, raw);
      expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    },
  );

  it("falls back to the defaults when storage throws", () => {
    expect(loadPreferences(blockedStorage)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("savePreferences", () => {
  it("does not throw when storage throws", () => {
    expect(() =>
      savePreferences({ wood: "maple" }, blockedStorage),
    ).not.toThrow();
  });
});
