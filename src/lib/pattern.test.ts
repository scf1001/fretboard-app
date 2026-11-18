import { describe, expect, it } from "vitest";
import { nextPatternCandidates } from "./pattern";
import { STANDARD_TUNING } from "./theory";

// For STANDARD_TUNING, frets 0-5, the notes E/G/A fall at:
//   string 0: 0, 3, 5    string 1: 0       string 2: 2, 5
//   string 3: 0, 2       string 4: 5       string 5: 0, 3, 5
const NOTES = ["E", "G", "A"];
const NUM_FRETS = 5;

function candidates(path: { stringIndex: number; fret: number }[]) {
  return nextPatternCandidates(path, STANDARD_TUNING, NUM_FRETS, NOTES);
}

describe("nextPatternCandidates", () => {
  it("offers every scale-tone position as a starting point when the path is empty", () => {
    expect(candidates([])).toHaveLength(12);
  });

  it("offers the nearest unused same-string neighbour and the adjacent string within range", () => {
    expect(candidates([{ stringIndex: 0, fret: 0 }])).toEqual(
      expect.arrayContaining([
        { stringIndex: 0, fret: 3 },
        { stringIndex: 1, fret: 0 },
      ]),
    );
    expect(candidates([{ stringIndex: 0, fret: 0 }])).toHaveLength(2);
  });

  it("offers both directions on the same string once there's room on both sides", () => {
    expect(
      candidates([
        { stringIndex: 0, fret: 0 },
        { stringIndex: 0, fret: 3 },
      ]),
    ).toEqual(
      expect.arrayContaining([
        { stringIndex: 0, fret: 5 },
        { stringIndex: 1, fret: 0 },
      ]),
    );
  });

  it("excludes an adjacent-string note that's out of reach", () => {
    // String 1's only scale tone is fret 0, which is 5 frets from fret 5 on string 0.
    expect(candidates([{ stringIndex: 0, fret: 5 }])).toEqual([
      { stringIndex: 0, fret: 3 },
    ]);
  });

  it("offers only the single nearest scale-tone per adjacent string, even when more than one is in reach", () => {
    // From E3 (string 2 fret 2), string 3 has both G3 (fret 0) and A3 (fret 2) within
    // physical reach. G3 is the nearer one in pitch (3 semitones vs 5), even though
    // it's further away in fret number (2 frets vs 0) — only G3 should be offered.
    const result = nextPatternCandidates(
      [{ stringIndex: 2, fret: 2 }],
      STANDARD_TUNING,
      9,
      NOTES,
    );
    expect(result).toEqual(
      expect.arrayContaining([
        { stringIndex: 2, fret: 5 },
        { stringIndex: 1, fret: 0 },
        { stringIndex: 3, fret: 0 },
      ]),
    );
    expect(result).toHaveLength(3);
    expect(result).not.toContainEqual({ stringIndex: 3, fret: 2 });
  });

  it("picks the pitch-nearest adjacent-string note, not the fret-nearest one", () => {
    // A2 (string 0 fret 5) -> C3 (string 0 fret 8) ascends. From C3, string 1 has both
    // D3 (fret 5, 3 frets away but only 2 semitones up) and E3 (fret 7, 1 fret away
    // but 4 semitones up) within reach — D3 is the closer step and should win.
    const path = [
      { stringIndex: 0, fret: 5 },
      { stringIndex: 0, fret: 8 },
    ];
    const result = nextPatternCandidates(path, STANDARD_TUNING, 12, [
      "A",
      "C",
      "D",
      "E",
      "G",
    ]);
    expect(result).toContainEqual({ stringIndex: 1, fret: 5 });
    expect(result).not.toContainEqual({ stringIndex: 1, fret: 7 });
  });

  it("never offers an already-used position again", () => {
    const path = [
      { stringIndex: 0, fret: 0 },
      { stringIndex: 0, fret: 3 },
      { stringIndex: 0, fret: 5 },
    ];
    expect(candidates(path)).not.toContainEqual({ stringIndex: 0, fret: 0 });
    expect(candidates(path)).not.toContainEqual({ stringIndex: 0, fret: 3 });
  });

  it("doesn't look past the lowest or highest string", () => {
    // String 5 is the highest string (no string above it).
    expect(candidates([{ stringIndex: 5, fret: 0 }])).toEqual([
      { stringIndex: 5, fret: 3 },
    ]);
  });

  describe("direction locking", () => {
    it("excludes a higher-pitch candidate once descending is established", () => {
      // A2 (string 1 fret 0) -> G2 (string 0 fret 3) descends. From G2, the higher-pitch
      // A2 (string 0 fret 5) must no longer be offered, even though E2 still is.
      const path = [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 0, fret: 3 },
      ];
      expect(candidates(path)).toEqual([{ stringIndex: 0, fret: 0 }]);
    });

    it("excludes lower-pitch candidates once ascending is established", () => {
      // A2 (string 1 fret 0) -> G3 (string 2 fret 5) ascends. From G3, only the
      // higher-pitch A3 options survive; the lower E3 options are excluded.
      const path = [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 2, fret: 5 },
      ];
      const result = nextPatternCandidates(path, STANDARD_TUNING, 9, NOTES);
      expect(result).toEqual(
        expect.arrayContaining([
          { stringIndex: 2, fret: 7 },
          { stringIndex: 3, fret: 2 },
        ]),
      );
      expect(result).toHaveLength(2);
    });
  });
});
