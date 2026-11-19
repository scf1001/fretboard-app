import { useId } from "react";
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
import { DEFAULT_INLAY, type Inlay } from "../lib/inlays";
import { DEFAULT_WOOD, type Wood } from "../lib/woods";
import "./Fretboard.css";
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
/** How far the wood extends above the top string and below the bottom one. */
const BOARD_PADDING = 10;

type FretboardProps = {
  tuning: Tuning;
  numFrets: number;
  rootNote?: string;
  highlightedNotes?: string[];
  labelMode?: LabelMode;
  leftHanded?: boolean;
  /** Which wood to draw the board in. Picks a token set from Fretboard.css. */
  wood?: Wood;
  /** Which style of fret position inlay to draw. */
  inlay?: Inlay;
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
  wood = DEFAULT_WOOD,
  inlay = DEFAULT_INLAY,
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

  // SVG ids are global to the page, so make them unique per Fretboard instance.
  const id = useId();
  const woodId = `${id}-wood`;
  const grainId = `${id}-grain`;
  const knockoutId = `${id}-knockout`;
  const knockoutFilter = `url(#${knockoutId})`;
  const boardTop = fretboardTop - BOARD_PADDING;
  const boardHeight = fretboardBottom - fretboardTop + 2 * BOARD_PADDING;

  return (
    <svg
      role="img"
      aria-label={`Guitar fretboard, ${numStrings} strings, ${numFrets} frets.${describeHighlights(rootNote, highlightedNotes)}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      data-wood={wood}
      style={{ color: "var(--board-hardware)" }}
    >
      <defs>
        {/* Darker at the edges, lighter in the middle: reads as a slightly rounded neck. */}
        <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--board-wood-edge)" />
          <stop offset="50%" stopColor="var(--board-wood-centre)" />
          <stop offset="100%" stopColor="var(--board-wood-edge)" />
        </linearGradient>
        {/* Noise stretched along the neck (low x frequency, high y) looks like wood grain.
            The noise sets only the alpha of a flat grain colour, clipped to the board's shape. */}
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.004 0.3"
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 -0.2"
            result="grainAlpha"
          />
          <feFlood floodColor="var(--board-grain)" result="grainColour" />
          <feComposite
            in="grainColour"
            in2="grainAlpha"
            operator="in"
            result="grain"
          />
          <feComposite in="grain" in2="SourceGraphic" operator="in" />
        </filter>
        {/* "Knockout" edge: grows the shape's outline by 2px (feMorphology dilate) and fills
            that border with the wood colour, then draws the shape on top. On bare wood the
            border is invisible; over an inlay it cuts a channel of wood around the shape so
            it keeps its contrast. userSpaceOnUse makes the filter cover the whole board:
            the default region is the shape's bounding box, which for a horizontal string
            has zero height, and the string would vanish. */}
        <filter
          id={knockoutId}
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={width}
          height={height}
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={2}
            result="spread"
          />
          <feFlood floodColor="var(--board-wood-centre)" />
          <feComposite in2="spread" operator="in" result="edge" />
          <feMerge>
            <feMergeNode in="edge" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Decorative only. Not wrapped in a <g>, so `g` stays a reliable hook for note markers. */}
      <rect
        data-part="wood"
        x={Math.min(toX(MARGIN_LEFT), toX(fretboardRight))}
        y={boardTop}
        width={fretboardRight - MARGIN_LEFT}
        height={boardHeight}
        fill={`url(#${woodId})`}
      />
      <rect
        data-part="wood"
        x={Math.min(toX(MARGIN_LEFT), toX(fretboardRight))}
        y={boardTop}
        width={fretboardRight - MARGIN_LEFT}
        height={boardHeight}
        fill="black"
        filter={`url(#${grainId})`}
        opacity={0.35}
      />
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
            filter={knockoutFilter}
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
            inlay={inlay}
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
              filter={knockoutFilter}
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
