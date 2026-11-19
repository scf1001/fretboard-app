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
 * The positions the user can click next while building a pattern: with an empty path,
 * every scale/chord tone on the neck (anywhere is a valid start). Otherwise:
 * - on the same string, the nearest not-yet-used scale-tone up and down, within
 *   `SAME_STRING_REACH` frets of the last note;
 * - on each neighbouring string, the single scale-tone nearest in pitch to the last note,
 *   between the lowest and highest frets played on the current string, widened by
 *   `STRING_CROSSING_SLACK` either side (never more than one per string).
 * From the second note on, the pitch direction between the first two notes locks
 * in: every later candidate must continue strictly that way, so the whole path traces one
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
  const lastPitch = pitchValue(last, tuning);
  const ascending =
    path.length >= 2
      ? pitchValue(path[1], tuning) >= pitchValue(path[0], tuning)
      : null;

  function isReachable(stringIndex: number, fret: number): boolean {
    if (used.has(stepKey({ stringIndex, fret }))) return false;
    if (ascending === null) return true;
    const pitch = pitchValue({ stringIndex, fret }, tuning);
    return ascending ? pitch > lastPitch : pitch < lastPitch;
  }

  const candidates: PatternStep[] = [];

  const sameStringFrets = scaleFretsOnString(
    last.stringIndex,
    tuning,
    numFrets,
    scaleNotes,
  ).filter((fret) => isReachable(last.stringIndex, fret));
  const nextAbove = sameStringFrets
    .filter((fret) => fret > last.fret && fret <= last.fret + SAME_STRING_REACH)
    .sort((a, b) => a - b)[0];
  const nextBelow = sameStringFrets
    .filter((fret) => fret < last.fret && fret >= last.fret - SAME_STRING_REACH)
    .sort((a, b) => b - a)[0];
  if (nextAbove !== undefined) {
    candidates.push({ stringIndex: last.stringIndex, fret: nextAbove });
  }
  if (nextBelow !== undefined) {
    candidates.push({ stringIndex: last.stringIndex, fret: nextBelow });
  }

  const handFrets = currentStringFrets(path);
  const lowestReach = Math.min(...handFrets) - STRING_CROSSING_SLACK;
  const highestReach = Math.max(...handFrets) + STRING_CROSSING_SLACK;

  for (const adjStringIndex of [last.stringIndex - 1, last.stringIndex + 1]) {
    if (adjStringIndex < 0 || adjStringIndex >= tuning.length) continue;
    // The fret range is a physical reach constraint; among frets within reach, the
    // "nearest" one is whichever is the smallest step in pitch, not fret number —
    // a fret 1 away can still be a bigger melodic leap than one 3 frets away.
    const frets = scaleFretsOnString(
      adjStringIndex,
      tuning,
      numFrets,
      scaleNotes,
    )
      .filter((fret) => fret >= lowestReach && fret <= highestReach)
      .filter((fret) => isReachable(adjStringIndex, fret))
      .sort(
        (a, b) =>
          Math.abs(
            pitchValue({ stringIndex: adjStringIndex, fret: a }, tuning) -
              lastPitch,
          ) -
          Math.abs(
            pitchValue({ stringIndex: adjStringIndex, fret: b }, tuning) -
              lastPitch,
          ),
      );
    const nearest = frets[0];
    if (nearest !== undefined) {
      candidates.push({ stringIndex: adjStringIndex, fret: nearest });
    }
  }

  return candidates;
}
