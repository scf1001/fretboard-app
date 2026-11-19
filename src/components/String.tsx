type StringProps = {
  y: number;
  x1: number;
  x2: number;
  thickness: number;
  /** An SVG filter reference, e.g. the board's knockout edge. */
  filter?: string;
};

/** A single horizontal guitar string. */
function String({ y, x1, x2, thickness, filter }: StringProps) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      stroke="currentColor"
      strokeWidth={thickness}
      filter={filter}
    />
  );
}

export default String;
