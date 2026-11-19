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
    // A2 (string 0 fret 5) -> C3 (string 0 fret 8): the hand spans frets 5–8, so string 1
    // frets 4–9 are in reach, which holds both D3 (fret 5) and E3 (fret 7). Only one of
    // them (the nearer in pitch, see the next test) should be offered.
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
    expect(result.filter((step) => step.stringIndex === 1)).toHaveLength(1);
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

  describe("reach from the hand's position", () => {
    const A_MAJOR = ["A", "B", "C#", "D", "E", "F#", "G#"];
    // A major, ascending A2, B2, C#3 on the low E string (frets 5, 7, 9).
    const run = [
      { stringIndex: 0, fret: 5 },
      { stringIndex: 0, fret: 7 },
      { stringIndex: 0, fret: 9 },
    ];

    it("crosses to the next string anywhere from 1 below the lowest note played to 1 above the highest", () => {
      // The next note up, D3, is at A-string fret 5: 4 frets from the last note, but the
      // index finger is already there from fret 5 on the E string.
      const result = nextPatternCandidates(run, STANDARD_TUNING, 15, A_MAJOR);
      expect(result).toContainEqual({ stringIndex: 1, fret: 5 });
    });

    it("stops the crossing window 1 fret beyond the notes played", () => {
      // Hand span frets 5–9, so the A string is in reach up to fret 10. Swap the next
      // note up between G (A-string fret 10, just in reach) and G# (fret 11, just out).
      const inReach = nextPatternCandidates(run, STANDARD_TUNING, 15, [
        "A",
        "B",
        "C#",
        "G",
      ]);
      expect(inReach).toContainEqual({ stringIndex: 1, fret: 10 });

      const outOfReach = nextPatternCandidates(run, STANDARD_TUNING, 15, [
        "A",
        "B",
        "C#",
        "G#",
      ]);
      expect(outOfReach.filter((step) => step.stringIndex === 1)).toEqual([]);
    });

    it("reaches up to 3 frets past the last note on the same string", () => {
      // D3 on the E string is at fret 10, 1 past C#3 at fret 9.
      const result = nextPatternCandidates(run, STANDARD_TUNING, 15, A_MAJOR);
      expect(result).toContainEqual({ stringIndex: 0, fret: 10 });
    });

    it("doesn't offer a same-string note more than 3 frets past the last one", () => {
      // An A–E fifth: from A2 at E-string fret 5, the next E is at fret 12, 7 frets away.
      const result = nextPatternCandidates(
        [{ stringIndex: 0, fret: 5 }],
        STANDARD_TUNING,
        15,
        ["A", "E"],
      );
      expect(result).not.toContainEqual({ stringIndex: 0, fret: 12 });
    });

    it("measures from the notes on the current string only, as the hand moves with the string", () => {
      // After crossing to D3 at A-string fret 5, that's the only note on the new string,
      // so the next crossing looks at D-string frets 4–6, not the E-string span as well.
      const path = [...run, { stringIndex: 1, fret: 5 }];
      const result = nextPatternCandidates(path, STANDARD_TUNING, 15, A_MAJOR);
      const dString = result.filter((step) => step.stringIndex === 2);
      expect(dString.every((step) => step.fret >= 4 && step.fret <= 6)).toBe(
        true,
      );
    });
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
      // A2 (string 1 fret 0) -> G3 (string 2 fret 5) ascends. From G3, the higher A3
      // (string 2 fret 7) is offered, but not the lower E3 (string 2 fret 2).
      const path = [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 2, fret: 5 },
      ];
      const result = nextPatternCandidates(path, STANDARD_TUNING, 9, NOTES);
      expect(result).toEqual([{ stringIndex: 2, fret: 7 }]);
    });
  });
});
