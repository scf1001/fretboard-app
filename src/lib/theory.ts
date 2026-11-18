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
