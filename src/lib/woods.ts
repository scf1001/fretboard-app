/** The fretboard woods the user can choose from. Each has a token set in Fretboard.css. */
export const WOODS = ["maple", "rosewood", "ebony"] as const;

export type Wood = (typeof WOODS)[number];

export const DEFAULT_WOOD: Wood = "maple";

/**
 * What each wood's inlays are made of. Maple necks usually have plain black dots; darker
 * boards usually have mother of pearl. A Record (rather than a list of pearl woods) makes
 * TypeScript insist that any new wood picks one.
 */
export const INLAY_MATERIAL: Record<Wood, "plain" | "pearl"> = {
  maple: "plain",
  rosewood: "pearl",
  ebony: "pearl",
};
