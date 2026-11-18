type NoteMarkerProps = {
  x: number;
  y: number;
  label: string;
  isRoot: boolean;
};

/** A highlighted note on the fretboard. The root is a distinct shape, not just a colour. */
function NoteMarker({ x, y, label, isRoot }: NoteMarkerProps) {
  const size = isRoot ? 11 : 9;

  return (
    <g>
      {isRoot ? (
        <rect
          x={x - size}
          y={y - size}
          width={size * 2}
          height={size * 2}
          rx={2}
          fill="var(--root-marker)"
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={size}
          fill="var(--marker-bg)"
          stroke="var(--accent)"
          strokeWidth={1.5}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill="white"
      >
        {label}
      </text>
    </g>
  );
}

export default NoteMarker;
