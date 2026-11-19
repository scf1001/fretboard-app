/** The fret position inlay styles the user can choose from. "none" leaves the board plain. */
export const INLAYS = [
  "dots",
  "blocks",
  "trapezoids",
  "sharktooth",
  "none",
] as const;

export type Inlay = (typeof INLAYS)[number];

export const DEFAULT_INLAY: Inlay = "dots";
