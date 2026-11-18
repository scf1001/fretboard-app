import {
  findMatchingNote,
  intervalFromRoot,
  noteAt,
  pitchAt,
  sameNote,
  type LabelMode,
  type Tuning,
} from "../lib/theory";
import { nextPatternCandidates, type PatternStep } from "../lib/pattern";
import Fret from "./Fret";
import NoteMarker from "./NoteMarker";
import String from "./String";

const SINGLE_MARKER_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKER_FRETS = new Set([12, 24]);

const MARGIN_LEFT = 40;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 30;
const FRET_WIDTH = 50;
const STRING_SPACING = 28;
const NUT_WIDTH = 6;
const OPEN_NOTE_X = 18;

type FretboardProps = {
  tuning: Tuning;
  numFrets: number;
  rootNote?: string;
  highlightedNotes?: string[];
  labelMode?: LabelMode;
  leftHanded?: boolean;
  onNoteClick?: (pitch: string) => void;
  /** While building a pattern: the notes placed so far. `null` means the builder is off. */
  patternPath?: PatternStep[] | null;
  onPatternStepAdd?: (step: PatternStep) => void;
  onPatternStepRemoveFrom?: (step: PatternStep) => void;
};

function fretCenterX(fret: number): number {
  return fret === 0 ? OPEN_NOTE_X : MARGIN_LEFT + FRET_WIDTH * (fret - 0.5);
}

/** The thinnest, highest-pitched string is drawn at the top; the thickest, lowest at the bottom. */
function stringY(stringIndex: number, numStrings: number): number {
  return MARGIN_TOP + STRING_SPACING * (numStrings - 1 - stringIndex);
}

/** A screen-reader-friendly description of what's highlighted, e.g. "A (root), C, D, E, G". */
function describeHighlights(
  rootNote: string | undefined,
  highlightedNotes: string[],
): string {
  if (highlightedNotes.length === 0) return "";
  const parts = highlightedNotes.map((note) =>
    rootNote !== undefined && sameNote(note, rootNote)
      ? `${note} (root)`
      : note,
  );
  return ` Highlighting: ${parts.join(", ")}.`;
}

type MarkerSpec = PatternStep & { isCandidate: boolean };

/** Which positions to render as markers: every highlighted note normally, or the
 * pattern-in-progress (placed notes plus the next clickable candidates) when building. */
function markersToRender(
  tuning: Tuning,
  numFrets: number,
  highlightedNotes: string[],
  patternPath: PatternStep[] | null | undefined,
): MarkerSpec[] {
  if (!patternPath) {
    const markers: MarkerSpec[] = [];
    for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
      for (let fret = 0; fret <= numFrets; fret++) {
        if (
          findMatchingNote(noteAt(stringIndex, fret, tuning), highlightedNotes)
        ) {
          markers.push({ stringIndex, fret, isCandidate: false });
        }
      }
    }
    return markers;
  }

  const placed = patternPath.map((step) => ({ ...step, isCandidate: false }));
  const candidates = nextPatternCandidates(
    patternPath,
    tuning,
    numFrets,
    highlightedNotes,
  ).map((step) => ({ ...step, isCandidate: true }));
  return [...placed, ...candidates];
}

/** A static SVG fretboard: its strings, frets, fret position markers, and any highlighted notes. */
function Fretboard({
  tuning,
  numFrets,
  rootNote,
  highlightedNotes = [],
  labelMode = "name",
  leftHanded = false,
  onNoteClick,
  patternPath = null,
  onPatternStepAdd,
  onPatternStepRemoveFrom,
}: FretboardProps) {
  const numStrings = tuning.length;
  const fretboardTop = MARGIN_TOP;
  const fretboardBottom = MARGIN_TOP + STRING_SPACING * (numStrings - 1);
  const fretboardRight = MARGIN_LEFT + FRET_WIDTH * numFrets;

  const width = fretboardRight + MARGIN_LEFT;
  const height = fretboardBottom + MARGIN_BOTTOM;

  // For left-handed mode, mirror x positions (the nut ends up on the right).
  // Labels stay upright since only positions are flipped, not the glyphs.
  const toX = (x: number) => (leftHanded ? width - x : x);

  return (
    <svg
      role="img"
      aria-label={`Guitar fretboard, ${numStrings} strings, ${numFrets} frets.${describeHighlights(rootNote, highlightedNotes)}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      <line
        x1={toX(MARGIN_LEFT)}
        x2={toX(MARGIN_LEFT)}
        y1={fretboardTop}
        y2={fretboardBottom}
        stroke="currentColor"
        strokeWidth={NUT_WIDTH}
      />
      {tuning.map((openNote, stringIndex) => {
        const thickness = 3.5 - (2.5 * stringIndex) / (numStrings - 1);
        return (
          <String
            key={openNote + stringIndex}
            y={stringY(stringIndex, numStrings)}
            x1={toX(MARGIN_LEFT)}
            x2={toX(fretboardRight)}
            thickness={thickness}
          />
        );
      })}
      {Array.from({ length: numFrets }, (_, i) => i + 1).map((fretNumber) => {
        const wireX = MARGIN_LEFT + FRET_WIDTH * fretNumber;
        const markerDots = DOUBLE_MARKER_FRETS.has(fretNumber)
          ? 2
          : SINGLE_MARKER_FRETS.has(fretNumber)
            ? 1
            : 0;
        return (
          <Fret
            key={fretNumber}
            number={fretNumber}
            wireX={toX(wireX)}
            centerX={toX(fretCenterX(fretNumber))}
            top={fretboardTop}
            bottom={fretboardBottom}
            markerDots={markerDots}
            showNumber={markerDots > 0}
          />
        );
      })}
      {markersToRender(tuning, numFrets, highlightedNotes, patternPath).map(
        ({ stringIndex, fret, isCandidate }) => {
          const matched = findMatchingNote(
            noteAt(stringIndex, fret, tuning),
            highlightedNotes,
          );
          if (!matched) return null;
          const interval =
            rootNote !== undefined
              ? intervalFromRoot(rootNote, matched)
              : undefined;
          const label =
            labelMode === "interval" && interval ? interval : matched;
          return (
            <NoteMarker
              key={`${stringIndex}-${fret}`}
              x={toX(fretCenterX(fret))}
              y={stringY(stringIndex, numStrings)}
              label={label}
              isRoot={rootNote !== undefined && sameNote(matched, rootNote)}
              tooltip={interval ? `${matched} (${interval})` : matched}
              isCandidate={isCandidate}
              onClick={() => {
                if (patternPath) {
                  if (isCandidate) {
                    onPatternStepAdd?.({ stringIndex, fret });
                  } else {
                    onPatternStepRemoveFrom?.({ stringIndex, fret });
                  }
                } else {
                  onNoteClick?.(pitchAt(stringIndex, fret, tuning));
                }
              }}
            />
          );
        },
      )}
    </svg>
  );
}

export default Fretboard;
