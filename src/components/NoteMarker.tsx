type NoteMarkerProps = {
  x: number;
  y: number;
  label: string;
  isRoot: boolean;
  tooltip: string;
  onClick?: () => void;
  /** A clickable next option in the pattern builder, not yet chosen — drawn as a dashed outline. */
  isCandidate?: boolean;
  /** An SVG filter reference, e.g. the board's knockout edge. */
  filter?: string;
};

/** Half the width of the root's square, the biggest marker. */
export const ROOT_MARKER_HALF_SIZE = 11;
export const MARKER_STROKE_WIDTH = 1.5;

/** A highlighted note on the fretboard. The root is a distinct shape, not just a colour. */
function NoteMarker({
  x,
  y,
  label,
  isRoot,
  tooltip,
  onClick,
  isCandidate = false,
  filter,
}: NoteMarkerProps) {
  const size = isRoot ? ROOT_MARKER_HALF_SIZE : 9;

  return (
    <g
      style={{ cursor: "pointer", pointerEvents: "all" }}
      filter={filter}
      onClick={onClick}
    >
      <title>{tooltip}</title>
      {isRoot ? (
        <rect
          x={x - size}
          y={y - size}
          width={size * 2}
          height={size * 2}
          rx={2}
          fill={isCandidate ? "var(--board-wood-centre)" : "var(--root-marker)"}
          stroke="var(--board-marker-outline)"
          strokeWidth={MARKER_STROKE_WIDTH}
          strokeDasharray={isCandidate ? "3 2" : undefined}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={isCandidate ? "var(--board-wood-centre)" : "var(--marker-bg)"}
          stroke="var(--board-marker-outline)"
          strokeWidth={MARKER_STROKE_WIDTH}
          strokeDasharray={isCandidate ? "3 2" : undefined}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill={isCandidate ? "var(--board-ink)" : "white"}
      >
        {label}
      </text>
    </g>
  );
}

export default NoteMarker;
