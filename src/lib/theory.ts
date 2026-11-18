import { Chord, Interval, Note, Scale } from "tonal";

/** Open-string notes, ordered from the lowest-pitched string to the highest. */
export type Tuning = string[];

export const STANDARD_TUNING: Tuning = ["E2", "A2", "D3", "G3", "B3", "E4"];
export const DROP_D_TUNING: Tuning = ["D2", "A2", "D3", "G3", "B3", "E4"];
export const DADGAD_TUNING: Tuning = ["D2", "A2", "D3", "G3", "A3", "D4"];

/** The note at a fretted position: the open string's note, up `fret` semitones, as a pitch class. */
export function noteAt(
  stringIndex: number,
  fret: number,
  tuning: Tuning,
): string {
  const openNote = tuning[stringIndex];
  const note = Note.transpose(openNote, Interval.fromSemitones(fret));
  return Note.get(note).pc;
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
