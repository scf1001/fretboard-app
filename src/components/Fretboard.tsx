import type { Tuning } from "../lib/theory";
import Fret from "./Fret";
import String from "./String";

const SINGLE_MARKER_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKER_FRETS = new Set([12, 24]);

const MARGIN_LEFT = 24;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 30;
const FRET_WIDTH = 50;
const STRING_SPACING = 28;
const NUT_WIDTH = 6;

type FretboardProps = {
  tuning: Tuning;
  numFrets: number;
};

/** A static SVG fretboard: its strings, frets, and fret position markers. */
function Fretboard({ tuning, numFrets }: FretboardProps) {
  const numStrings = tuning.length;
  const fretboardTop = MARGIN_TOP;
  const fretboardBottom = MARGIN_TOP + STRING_SPACING * (numStrings - 1);
  const fretboardRight = MARGIN_LEFT + FRET_WIDTH * numFrets;

  const width = fretboardRight + MARGIN_LEFT;
  const height = fretboardBottom + MARGIN_BOTTOM;

  return (
    <svg
      role="img"
      aria-label={`Guitar fretboard, ${numStrings} strings, ${numFrets} frets`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      <line
        x1={MARGIN_LEFT}
        x2={MARGIN_LEFT}
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
            y={MARGIN_TOP + STRING_SPACING * stringIndex}
            x1={MARGIN_LEFT}
            x2={fretboardRight}
            thickness={thickness}
          />
        );
      })}
      {Array.from({ length: numFrets }, (_, i) => i + 1).map((fretNumber) => {
        const wireX = MARGIN_LEFT + FRET_WIDTH * fretNumber;
        const centerX = wireX - FRET_WIDTH / 2;
        const markerDots = DOUBLE_MARKER_FRETS.has(fretNumber)
          ? 2
          : SINGLE_MARKER_FRETS.has(fretNumber)
            ? 1
            : 0;
        return (
          <Fret
            key={fretNumber}
            number={fretNumber}
            wireX={wireX}
            centerX={centerX}
            top={fretboardTop}
            bottom={fretboardBottom}
            markerDots={markerDots}
            showNumber={markerDots > 0}
          />
        );
      })}
    </svg>
  );
}

export default Fretboard;
