import { describe, expect, it } from "vitest";
import {
  CHORD_TYPES,
  chordNotes,
  DADGAD_TUNING,
  DROP_D_TUNING,
  findMatchingNote,
  intervalFromRoot,
  noteAt,
  sameNote,
  scaleNotes,
  SCALE_TYPES,
  STANDARD_TUNING,
  TUNING_PRESETS,
} from "./theory";

describe("noteAt", () => {
  it("returns the open string's note at fret 0", () => {
    expect(noteAt(0, 0, STANDARD_TUNING)).toBe("E");
    expect(noteAt(1, 0, STANDARD_TUNING)).toBe("A");
  });

  it("wraps around the octave past fret 12", () => {
    expect(noteAt(0, 12, STANDARD_TUNING)).toBe("E");
    expect(noteAt(0, 13, STANDARD_TUNING)).toBe("F");
  });

  it("counts semitones up from the open string", () => {
    // Low E string: E F F# G G# A ...
    expect(noteAt(0, 1, STANDARD_TUNING)).toBe("F");
    expect(noteAt(0, 3, STANDARD_TUNING)).toBe("G");
    expect(noteAt(0, 5, STANDARD_TUNING)).toBe("A");
  });

  it("supports drop D tuning", () => {
    expect(noteAt(0, 0, DROP_D_TUNING)).toBe("D");
    expect(noteAt(0, 2, DROP_D_TUNING)).toBe("E");
  });

  it("supports DADGAD tuning", () => {
    expect(noteAt(0, 0, DADGAD_TUNING)).toBe("D");
    expect(noteAt(4, 0, DADGAD_TUNING)).toBe("A");
  });
});

describe("scaleNotes", () => {
  it("returns the notes of a major scale", () => {
    expect(scaleNotes("C", "major")).toEqual([
      "C",
      "D",
      "E",
      "F",
      "G",
      "A",
      "B",
    ]);
  });

  it("returns the notes of a minor pentatonic scale", () => {
    expect(scaleNotes("A", "minor pentatonic")).toEqual([
      "A",
      "C",
      "D",
      "E",
      "G",
    ]);
  });

  it("transposes to a different root", () => {
    expect(scaleNotes("G", "major")).toEqual([
      "G",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F#",
    ]);
  });
});

describe("chordNotes", () => {
  it("returns the notes of a major triad", () => {
    expect(chordNotes("C", "major")).toEqual(["C", "E", "G"]);
  });

  it("returns the notes of a minor seventh chord", () => {
    expect(chordNotes("D", "min7")).toEqual(["D", "F", "A", "C"]);
  });

  it("returns the notes of a dominant seventh chord", () => {
    expect(chordNotes("G", "7")).toEqual(["G", "B", "D", "F"]);
  });
});

describe("sameNote", () => {
  it("treats enharmonic spellings as the same note", () => {
    expect(sameNote("A#", "Bb")).toBe(true);
  });

  it("ignores octave", () => {
    expect(sameNote("E2", "E4")).toBe(true);
  });

  it("returns false for different pitch classes", () => {
    expect(sameNote("C", "D")).toBe(false);
  });
});

describe("findMatchingNote", () => {
  it("returns the candidate with the same pitch class", () => {
    expect(findMatchingNote("A#", ["Bb", "D", "F"])).toBe("Bb");
  });

  it("returns undefined when there is no match", () => {
    expect(findMatchingNote("C", ["D", "E"])).toBeUndefined();
  });
});

describe("SCALE_TYPES", () => {
  it.each(SCALE_TYPES)("$label resolves to notes", ({ value }) => {
    expect(scaleNotes("C", value).length).toBeGreaterThan(0);
  });
});

describe("CHORD_TYPES", () => {
  it.each(CHORD_TYPES)("$label resolves to notes", ({ value }) => {
    expect(chordNotes("C", value).length).toBeGreaterThan(0);
  });
});

describe("TUNING_PRESETS", () => {
  it("gives every built-in preset a 6-note tuning", () => {
    const builtIns = TUNING_PRESETS.filter(
      (preset) => preset.value !== "custom",
    );
    for (const preset of builtIns) {
      expect(preset.tuning).toHaveLength(6);
    }
  });

  it("leaves custom with no fixed tuning", () => {
    const custom = TUNING_PRESETS.find((preset) => preset.value === "custom");
    expect(custom?.tuning).toBeNull();
  });
});

describe("intervalFromRoot", () => {
  it("labels the root itself as R", () => {
    expect(intervalFromRoot("A", "A")).toBe("R");
  });

  it("labels a minor third", () => {
    expect(intervalFromRoot("A", "C")).toBe("b3");
  });

  it("labels a perfect fifth", () => {
    expect(intervalFromRoot("A", "E")).toBe("5");
  });

  it("labels a minor seventh", () => {
    expect(intervalFromRoot("A", "G")).toBe("b7");
  });

  it("ignores octave and enharmonic spelling", () => {
    expect(intervalFromRoot("A2", "E4")).toBe("5");
    expect(intervalFromRoot("C", "Db")).toBe("b2");
  });
});
