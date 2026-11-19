type FretProps = {
  number: number;
  wireX: number;
  centerX: number;
  top: number;
  bottom: number;
  markerDots: number;
  showNumber: boolean;
};

/** A fret: its wire (right-hand boundary), and optional position markers and number. */
function Fret({
  number,
  wireX,
  centerX,
  top,
  bottom,
  markerDots,
  showNumber,
}: FretProps) {
  const middle = (top + bottom) / 2;
  const dotRadius = 5;
  const dotOffset = (bottom - top) / 4;

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
      {markerDots === 1 && (
        <circle
          cx={centerX}
          cy={middle}
          r={dotRadius}
          fill="var(--board-inlay)"
        />
      )}
      {markerDots === 2 && (
        <>
          <circle
            cx={centerX}
            cy={middle - dotOffset}
            r={dotRadius}
            fill="var(--board-inlay)"
          />
          <circle
            cx={centerX}
            cy={middle + dotOffset}
            r={dotRadius}
            fill="var(--board-inlay)"
          />
        </>
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
