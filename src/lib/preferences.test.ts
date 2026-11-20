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
    savePreferences({
      wood: "ebony",
      inlay: "sharktooth",
      volume: 40,
      leftHanded: true,
    });
    expect(loadPreferences()).toEqual({
      wood: "ebony",
      inlay: "sharktooth",
      volume: 40,
      leftHanded: true,
    });
  });

  it("falls back to the default wood for an unknown wood", () => {
    localStorage.setItem(KEY, JSON.stringify({ wood: "balsa" }));
    expect(loadPreferences().wood).toBe(DEFAULT_PREFERENCES.wood);
  });

  it("falls back to the default inlay for an unknown inlay, keeping a valid wood", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ wood: "ebony", inlay: "stars" }),
    );
    expect(loadPreferences()).toEqual({
      ...DEFAULT_PREFERENCES,
      wood: "ebony",
    });
  });

  it("loads preferences saved before inlays existed, using the default inlay", () => {
    localStorage.setItem(KEY, JSON.stringify({ wood: "rosewood" }));
    expect(loadPreferences()).toEqual({
      ...DEFAULT_PREFERENCES,
      wood: "rosewood",
    });
  });

  it("keeps a saved volume of 0, rather than treating it as missing", () => {
    localStorage.setItem(KEY, JSON.stringify({ volume: 0 }));
    expect(loadPreferences().volume).toBe(0);
  });

  it.each([150, -5, "loud", null])(
    "falls back to the default volume for an invalid volume: %s",
    (volume) => {
      localStorage.setItem(
        KEY,
        JSON.stringify({ wood: "ebony", inlay: "blocks", volume }),
      );
      expect(loadPreferences()).toEqual({
        wood: "ebony",
        inlay: "blocks",
        volume: DEFAULT_PREFERENCES.volume,
        leftHanded: DEFAULT_PREFERENCES.leftHanded,
      });
    },
  );

  it.each(["yes", 1, null])(
    "falls back to right-handed for a non-boolean leftHanded: %s",
    (leftHanded) => {
      localStorage.setItem(KEY, JSON.stringify({ leftHanded }));
      expect(loadPreferences().leftHanded).toBe(false);
    },
  );

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
      savePreferences(DEFAULT_PREFERENCES, blockedStorage),
    ).not.toThrow();
  });
});
