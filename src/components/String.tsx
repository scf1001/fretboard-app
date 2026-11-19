type StringProps = {
  y: number;
  x1: number;
  x2: number;
  thickness: number;
};

/** A single horizontal guitar string. */
function String({ y, x1, x2, thickness }: StringProps) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      stroke="currentColor"
      strokeWidth={thickness}
    />
  );
}

export default String;
