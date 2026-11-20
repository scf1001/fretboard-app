import { Note } from "tonal";
import { findMatchingNote, noteAt, pitchAt, type Tuning } from "./theory";

/** One fretted position in a hand-built fingering pattern. */
export type PatternStep = {
  stringIndex: number;
  fret: number;
};

/** How far past the last note the hand can stretch along the same string. */
const SAME_STRING_REACH = 3;
/**
 * How far outside the frets already played on a string the hand can reach when it
 * crosses to a neighbouring one: e.g. after 5, 7 and 9 on one string, frets 4–10 on the
 * next. The fingers are already spread over that span, so this is the natural range.
 */
const STRING_CROSSING_SLACK = 1;

function stepKey(step: PatternStep): string {
  return `${step.stringIndex}-${step.fret}`;
}

function pitchValue(step: PatternStep, tuning: Tuning): number {
  return Note.get(pitchAt(step.stringIndex, step.fret, tuning)).midi!;
}

function scaleFretsOnString(
  stringIndex: number,
  tuning: Tuning,
  numFrets: number,
  scaleNotes: string[],
): number[] {
  const frets: number[] = [];
  for (let fret = 0; fret <= numFrets; fret++) {
    if (findMatchingNote(noteAt(stringIndex, fret, tuning), scaleNotes)) {
      frets.push(fret);
    }
  }
  return frets;
}

function allScalePositions(
  tuning: Tuning,
  numFrets: number,
  scaleNotes: string[],
): PatternStep[] {
  const positions: PatternStep[] = [];
  for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
    for (const fret of scaleFretsOnString(
      stringIndex,
      tuning,
      numFrets,
      scaleNotes,
    )) {
      positions.push({ stringIndex, fret });
    }
  }
  return positions;
}

/**
 * The frets of the notes played on the path's current string: the run of steps at the
 * end of the path that share the last step's string. This is where the hand is.
 */
function currentStringFrets(path: PatternStep[]): number[] {
  const { stringIndex } = path[path.length - 1];
  const frets: number[] = [];
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i].stringIndex !== stringIndex) break;
    frets.push(path[i].fret);
  }
  return frets;
}

/**
 * The pitches (as MIDI numbers) of the scale tones immediately above and below `pitch`:
 * the next step up and down the scale, octave included. E.g. from A2 in A minor, G2 and B2.
 */
function neighbouringScalePitches(
  pitch: number,
  scaleNotes: string[],
): { above: number; below: number } {
  const chromas = new Set(scaleNotes.map((note) => Note.chroma(note)));
  const inScale = (midi: number) => chromas.has(((midi % 12) + 12) % 12);
  let above = pitch + 1;
  while (!inScale(above)) above++;
  let below = pitch - 1;
  while (!inScale(below)) below--;
  return { above, below };
}

/**
 * The positions the user can click next while building a pattern: with an empty path,
 * every scale/chord tone on the neck (anywhere is a valid start). Otherwise, the next
 * scale tone up and the next one down from the last note (never a jump past one),
 * wherever the hand can play them:
 * - on the same string, within `SAME_STRING_REACH` frets of the last note;
 * - on a neighbouring string, between the lowest and highest frets played on the
 *   current string, widened by `STRING_CROSSING_SLACK` either side.
 * The same note can be offered in two places, e.g. on the same string or the next one,
 * which is how the user picks between 2 and 3 notes per string.
 * From the second note on, the pitch direction between the first two notes locks
 * in: only the next scale tone that way is offered, so the whole path traces one
 * continuous ascending or descending run.
 */
export function nextPatternCandidates(
  path: PatternStep[],
  tuning: Tuning,
  numFrets: number,
  scaleNotes: string[],
): PatternStep[] {
  if (path.length === 0) {
    return allScalePositions(tuning, numFrets, scaleNotes);
  }

  const last = path[path.length - 1];
  const used = new Set(path.map(stepKey));
  const ascending =
    path.length >= 2
      ? pitchValue(path[1], tuning) >= pitchValue(path[0], tuning)
      : null;

  const { above, below } = neighbouringScalePitches(
    pitchValue(last, tuning),
    scaleNotes,
  );
  const targets =
    ascending === null ? [above, below] : ascending ? [above] : [below];

  const handFrets = currentStringFrets(path);
  const lowestReach = Math.min(...handFrets) - STRING_CROSSING_SLACK;
  const highestReach = Math.max(...handFrets) + STRING_CROSSING_SLACK;

  function inReach(stringIndex: number, fret: number): boolean {
    if (stringIndex === last.stringIndex) {
      return Math.abs(fret - last.fret) <= SAME_STRING_REACH;
    }
    return fret >= lowestReach && fret <= highestReach;
  }

  const candidates: PatternStep[] = [];
  for (const stringIndex of [
    last.stringIndex,
    last.stringIndex - 1,
    last.stringIndex + 1,
  ]) {
    if (stringIndex < 0 || stringIndex >= tuning.length) continue;
    const openPitch = pitchValue({ stringIndex, fret: 0 }, tuning);
    for (const target of targets) {
      // A given pitch is at exactly one fret on a string (if it's there at all).
      const step = { stringIndex, fret: target - openPitch };
      if (
        step.fret >= 0 &&
        step.fret <= numFrets &&
        !used.has(stepKey(step)) &&
        inReach(stringIndex, step.fret)
      ) {
        candidates.push(step);
      }
    }
  }

  return candidates;
}
