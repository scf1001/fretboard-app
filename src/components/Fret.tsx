import type { Inlay } from "../lib/inlays";

type FretProps = {
  number: number;
  wireX: number;
  centerX: number;
  top: number;
  bottom: number;
  /** How many position markers this fret gets: 0, 1, or 2 (the octave frets). */
  markerDots: number;
  showNumber: boolean;
  inlay: Inlay;
  /** Vertical distance between neighbouring strings. Blocks are sized from it. */
  stringSpacing: number;
};

/** Gap between the trapezoid and sharktooth inlays and the outer strings. */
const INLAY_INSET = 6;
/**
 * How far blocks reach past the 2nd and 5th strings. A block edge exactly on a string
 * would hide the string's outline against it, so the string crosses just inside instead.
 */
const BLOCK_OVERHANG = 4;

/**
 * The inlay shape for one marked fret, as an SVG polygon's points.
 * Sizes come from the fret's own geometry, so the shapes scale with the layout. The
 * sharktooth is the one asymmetric shape: its upright edge sits on the wire side, and
 * because `wireX` is already mirrored in left-handed mode, the tooth mirrors with it.
 */
function inlayPoints(
  inlay: "blocks" | "trapezoids" | "sharktooth",
  centerX: number,
  wireX: number,
  top: number,
  bottom: number,
  stringSpacing: number,
): string {
  const halfWidth = (wireX - centerX) * 0.6; // negative in left-handed mode
  // Blocks span roughly the 2nd to the 5th string, like real block inlays; the other
  // shapes run nearly the full width of the board.
  const inset =
    inlay === "blocks" ? stringSpacing - BLOCK_OVERHANG : INLAY_INSET;
  const y1 = top + inset;
  const y2 = bottom - inset;
  const left = centerX - halfWidth;
  const right = centerX + halfWidth;

  const corners: [number, number][] =
    inlay === "blocks"
      ? [
          [left, y1],
          [right, y1],
          [right, y2],
          [left, y2],
        ]
      : inlay === "trapezoids"
        ? [
            [centerX - halfWidth * 0.6, y1],
            [centerX + halfWidth * 0.6, y1],
            [right, y2],
            [left, y2],
          ]
        : [
            [right, y1],
            [right, y2],
            [left, y2],
          ];
  return corners.map(([x, y]) => `${x},${y}`).join(" ");
}

/** A fret: its wire (right-hand boundary), and optional position markers and number. */
function Fret({
  number,
  wireX,
  centerX,
  top,
  bottom,
  markerDots,
  showNumber,
  inlay,
  stringSpacing,
}: FretProps) {
  const middle = (top + bottom) / 2;
  const dotRadius = 5;
  const dotOffset = (bottom - top) / 4;
  // Dots double up on the octave frets; the larger shapes are drawn once on every marked fret.
  const dotYs =
    markerDots === 2
      ? [middle - dotOffset, middle + dotOffset]
      : markerDots === 1
        ? [middle]
        : [];

  return (
    <>
      <line
        x1={wireX}
        x2={wireX}
        y1={top}
        y2={bottom}
        stroke="currentColor"
        strokeWidth={2}
      />
      {inlay === "dots" &&
        dotYs.map((y) => (
          <circle
            key={y}
            data-part="inlay"
            cx={centerX}
            cy={y}
            r={dotRadius}
            fill="var(--board-inlay)"
          />
        ))}
      {markerDots > 0 &&
        (inlay === "blocks" ||
          inlay === "trapezoids" ||
          inlay === "sharktooth") && (
          <polygon
            data-part="inlay"
            points={inlayPoints(
              inlay,
              centerX,
              wireX,
              top,
              bottom,
              stringSpacing,
            )}
            fill="var(--board-inlay)"
          />
        )}
      {showNumber && (
        <text x={centerX} y={bottom + 20} textAnchor="middle" fontSize={12}>
          {number}
        </text>
      )}
    </>
  );
}

export default Fret;
