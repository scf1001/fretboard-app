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
  /** An SVG filter reference for the inlays' material, e.g. mother of pearl. */
  inlayFilter?: string;
};

/** Gap between the sharktooth inlays and the outer strings. */
const INLAY_INSET = 6;
/**
 * How far blocks reach past the 2nd and 5th strings. A block edge exactly on a string
 * would hide the string's outline against it, so the string crosses just inside instead.
 */
const BLOCK_OVERHANG = 4;
/**
 * How much shorter a trapezoid's body-side edge is than its nut-side edge, as a share
 * of the inlay's height taken off each end. 0.1 makes the short edge 80% of the long one.
 */
const TRAPEZOID_TAPER = 0.1;

/**
 * The inlay shape for one marked fret, as an SVG polygon's points.
 * Sizes come from the fret's own geometry, so the shapes scale with the layout.
 * Trapezoids and sharktooth aren't symmetrical along the neck: both point towards the
 * body, which is the side this fret's wire is on. `wireX` is already mirrored in
 * left-handed mode, so these shapes mirror with it.
 */
function inlayPoints(
  inlay: "blocks" | "trapezoids" | "sharktooth",
  centerX: number,
  wireX: number,
  top: number,
  bottom: number,
  stringSpacing: number,
): string {
  // Positive towards the body: negative in left-handed mode, where the body is on the left.
  const halfWidth = (wireX - centerX) * 0.6;
  // Blocks span roughly the 2nd to the 5th string, like real block inlays. Trapezoids'
  // long edge stops halfway between the outer strings and the next ones in. The
  // sharktooth runs nearly the full width of the board.
  const inset =
    inlay === "blocks"
      ? stringSpacing - BLOCK_OVERHANG
      : inlay === "trapezoids"
        ? stringSpacing / 2
        : INLAY_INSET;
  const y1 = top + inset;
  const y2 = bottom - inset;
  const nutX = centerX - halfWidth;
  const bodyX = centerX + halfWidth;
  const taper = (y2 - y1) * TRAPEZOID_TAPER;

  const corners: [number, number][] =
    inlay === "blocks"
      ? [
          [nutX, y1],
          [bodyX, y1],
          [bodyX, y2],
          [nutX, y2],
        ]
      : inlay === "trapezoids"
        ? // Long edge on the nut side, short edge on the body side.
          [
            [nutX, y1],
            [bodyX, y1 + taper],
            [bodyX, y2 - taper],
            [nutX, y2],
          ]
        : [
            [bodyX, y1],
            [bodyX, y2],
            [nutX, y2],
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
  inlayFilter,
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
            filter={inlayFilter}
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
            filter={inlayFilter}
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
