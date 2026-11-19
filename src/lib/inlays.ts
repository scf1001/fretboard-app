/** The fret position inlay styles the user can choose from. "none" leaves the board plain. */
export const INLAYS = [
  "dots",
  "blocks",
  "trapezoids",
  "sharktooth",
  "none",
] as const;

export type Inlay = (typeof INLAYS)[number];

export const DEFAULT_INLAY: Inlay = "dots";

const SINGLE_MARKER_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKER_FRETS = new Set([12, 24]);
/** Block, trapezoid and sharktooth necks also mark the 1st fret; dot necks don't. */
const MARKS_FIRST_FRET: ReadonlySet<Inlay> = new Set([
  "blocks",
  "trapezoids",
  "sharktooth",
]);

/**
 * How many position markers a fret gets in an inlay style: 0, 1, or 2 (the octave
 * frets, where dots double up). "none" still reports the usual frets, so the fret
 * numbers under the board stay in place when the inlays are hidden.
 */
export function markerCount(fret: number, inlay: Inlay): 0 | 1 | 2 {
  if (DOUBLE_MARKER_FRETS.has(fret)) return 2;
  if (SINGLE_MARKER_FRETS.has(fret)) return 1;
  if (fret === 1 && MARKS_FIRST_FRET.has(inlay)) return 1;
  return 0;
}
