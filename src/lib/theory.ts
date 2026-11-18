import { Chord, Interval, Note, Scale } from "tonal";

/** Open-string notes, ordered from the lowest-pitched string to the highest. */
export type Tuning = string[];

export const STANDARD_TUNING: Tuning = ["E2", "A2", "D3", "G3", "B3", "E4"];
export const DROP_D_TUNING: Tuning = ["D2", "A2", "D3", "G3", "B3", "E4"];
export const DADGAD_TUNING: Tuning = ["D2", "A2", "D3", "G3", "A3", "D4"];

export type TuningPreset = "standard" | "dropD" | "dadgad" | "custom";

/** Built-in tuning presets; "custom" has no fixed tuning, the user supplies their own. */
export const TUNING_PRESETS: {
  value: TuningPreset;
  label: string;
  tuning: Tuning | null;
}[] = [
  { value: "standard", label: "Standard", tuning: STANDARD_TUNING },
  { value: "dropD", label: "Drop D", tuning: DROP_D_TUNING },
  { value: "dadgad", label: "DADGAD", tuning: DADGAD_TUNING },
  { value: "custom", label: "Custom", tuning: null },
];

export const ROOTS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type Mode = "scale" | "chord";

export type LabelMode = "name" | "interval";

const INTERVAL_LABELS = [
  "R",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7",
];

/** The interval of `note` above `root`, as a short label (e.g. "R", "b3", "5"). */
export function intervalFromRoot(root: string, note: string): string {
  const semitones = (Note.chroma(note)! - Note.chroma(root)! + 12) % 12;
  return INTERVAL_LABELS[semitones];
}

/** A curated set of scale types, good enough for v1 without listing every scale Tonal knows. */
export const SCALE_TYPES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "major pentatonic", label: "Major pentatonic" },
  { value: "minor pentatonic", label: "Minor pentatonic" },
  { value: "blues", label: "Blues" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
  { value: "harmonic minor", label: "Harmonic minor" },
];

/** A curated set of chord types, good enough for v1 without listing every chord Tonal knows. */
export const CHORD_TYPES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "7", label: "Dominant 7th" },
  { value: "maj7", label: "Major 7th" },
  { value: "min7", label: "Minor 7th" },
  { value: "dim", label: "Diminished" },
  { value: "aug", label: "Augmented" },
  { value: "sus2", label: "Suspended 2nd" },
  { value: "sus4", label: "Suspended 4th" },
];

/** The exact pitch at a fretted position, including octave (e.g. "A4") — the open string's note, up `fret` semitones. */
export function pitchAt(
  stringIndex: number,
  fret: number,
  tuning: Tuning,
): string {
  const openNote = tuning[stringIndex];
  return Note.transpose(openNote, Interval.fromSemitones(fret));
}

/** The note at a fretted position: the open string's note, up `fret` semitones, as a pitch class. */
export function noteAt(
  stringIndex: number,
  fret: number,
  tuning: Tuning,
): string {
  return Note.get(pitchAt(stringIndex, fret, tuning)).pc;
}

/** The pitch classes in a scale, e.g. scaleNotes("C", "major") => ["C", "D", "E", "F", "G", "A", "B"]. */
export function scaleNotes(root: string, type: string): string[] {
  return Scale.get([root, type]).notes;
}

/** The pitch classes in a chord, e.g. chordNotes("C", "maj7") => ["C", "E", "G", "B"]. */
export function chordNotes(root: string, type: string): string[] {
  return Chord.getChord(type, root).notes;
}

/** Whether two notes share the same pitch class, ignoring octave and spelling (e.g. "A" and "A2", or "Bb" and "A#"). */
export function sameNote(a: string, b: string): boolean {
  return Note.chroma(a) === Note.chroma(b);
}

/**
 * The candidate with the same pitch class as `note`, if any. Used to display a fretted
 * note with a candidate's preferred spelling, e.g. matching a scale's "Bb" instead of
 * showing the "A#" a raw semitone count would produce.
 */
export function findMatchingNote(
  note: string,
  candidates: string[],
): string | undefined {
  return candidates.find((candidate) => sameNote(note, candidate));
}
