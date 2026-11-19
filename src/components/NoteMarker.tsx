type NoteMarkerProps = {
  x: number;
  y: number;
  label: string;
  isRoot: boolean;
  tooltip: string;
  onClick?: () => void;
  /** A clickable next option in the pattern builder, not yet chosen — drawn as a dashed outline. */
  isCandidate?: boolean;
};

/** A highlighted note on the fretboard. The root is a distinct shape, not just a colour. */
function NoteMarker({
  x,
  y,
  label,
  isRoot,
  tooltip,
  onClick,
  isCandidate = false,
}: NoteMarkerProps) {
  const size = isRoot ? 11 : 9;

  return (
    <g style={{ cursor: "pointer", pointerEvents: "all" }} onClick={onClick}>
      <title>{tooltip}</title>
      {isRoot ? (
        <rect
          x={x - size}
          y={y - size}
          width={size * 2}
          height={size * 2}
          rx={2}
          fill={isCandidate ? "none" : "var(--root-marker)"}
          stroke="var(--board-marker-outline)"
          strokeWidth={1.5}
          strokeDasharray={isCandidate ? "3 2" : undefined}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={isCandidate ? "none" : "var(--marker-bg)"}
          stroke="var(--board-marker-outline)"
          strokeWidth={1.5}
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
