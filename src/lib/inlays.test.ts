import { describe, expect, it } from "vitest";
import { INLAYS, markerCount } from "./inlays";

const markedFrets = (inlay: (typeof INLAYS)[number]) =>
  Array.from({ length: 24 }, (_, i) => i + 1).filter(
    (fret) => markerCount(fret, inlay) > 0,
  );

describe("markerCount", () => {
  it.each(["dots", "none"] as const)(
    "marks the usual frets for %s, starting at the 3rd",
    (inlay) => {
      expect(markedFrets(inlay)).toEqual([3, 5, 7, 9, 12, 15, 17, 19, 21, 24]);
    },
  );

  it.each(["blocks", "trapezoids", "sharktooth"] as const)(
    "also marks the 1st fret for %s",
    (inlay) => {
      expect(markedFrets(inlay)).toEqual([
        1, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24,
      ]);
    },
  );

  it.each(INLAYS)("doubles up on the octave frets for %s", (inlay) => {
    expect(markerCount(12, inlay)).toBe(2);
    expect(markerCount(24, inlay)).toBe(2);
    expect(markerCount(5, inlay)).toBe(1);
  });
});
