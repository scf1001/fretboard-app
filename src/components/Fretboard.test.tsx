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

  it("highlights every matching note, using a distinct shape for the root", () => {
    const { container, getAllByText } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
      />,
    );
    // E appears at (string 0, fret 0), (string 2, fret 2) and (string 5, fret 0).
    expect(getAllByText("E")).toHaveLength(3);
    // A appears at (string 1, fret 0) and (string 3, fret 2).
    expect(getAllByText("A")).toHaveLength(2);
    // The root (E) is drawn as a square; the non-root (A) as a circle.
    expect(container.querySelectorAll("rect")).toHaveLength(3);
    expect(container.querySelectorAll("circle")).toHaveLength(2);
    // No other note letters should appear.
    expect(container.querySelectorAll("text")).toHaveLength(5);
  });

  it("highlights nothing when given no notes", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={2} />,
    );
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("labels notes with their interval from the root when labelMode is interval", () => {
    const { getAllByText, queryAllByText } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
        labelMode="interval"
      />,
    );
    // E (the root) appears at 3 positions, A (a perfect fourth above E) at 2.
    expect(getAllByText("R")).toHaveLength(3);
    expect(getAllByText("4")).toHaveLength(2);
    expect(queryAllByText("E")).toHaveLength(0);
    expect(queryAllByText("A")).toHaveLength(0);
  });
});
