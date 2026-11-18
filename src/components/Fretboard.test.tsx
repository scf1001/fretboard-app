import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Fretboard from "./Fretboard";
import { STANDARD_TUNING } from "../lib/theory";

describe("Fretboard", () => {
  it("renders a line for each string", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    // One line per string, plus one for the nut.
    expect(container.querySelectorAll("line")).toHaveLength(
      STANDARD_TUNING.length + 12 + 1,
    );
  });

  it("renders a single-dot marker on fret 5 and a double-dot marker on fret 12", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(
      // Single markers: 3, 5, 7, 9. Double markers: 12.
      4 * 1 + 1 * 2,
    );
  });

  it("exposes an accessible label describing the fretboard", () => {
    const { getByRole } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    expect(
      getByRole("img", { name: "Guitar fretboard, 6 strings, 12 frets" }),
    ).toBeInTheDocument();
  });
});
