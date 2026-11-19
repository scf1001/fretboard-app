/** The fretboard woods the user can choose from. Each has a token set in Fretboard.css. */
export const WOODS = ["maple", "rosewood", "ebony"] as const;

export type Wood = (typeof WOODS)[number];

export const DEFAULT_WOOD: Wood = "maple";
