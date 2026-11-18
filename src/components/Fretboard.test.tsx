import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
      getByRole("img", { name: "Guitar fretboard, 6 strings, 12 frets." }),
    ).toBeInTheDocument();
  });

  it("describes the highlighted notes in the accessible label, marking the root", () => {
    const { getByRole } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={12}
        rootNote="A"
        highlightedNotes={["A", "C", "D", "E", "G"]}
      />,
    );
    expect(
      getByRole("img", {
        name: "Guitar fretboard, 6 strings, 12 frets. Highlighting: A (root), C, D, E, G.",
      }),
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

  it("calls onNoteClick with the exact pitch, including octave, when a marker is clicked", () => {
    const onNoteClick = vi.fn();
    const { container } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
        onNoteClick={onNoteClick}
      />,
    );
    // The first marker in document order is string 0 (low E), fret 0.
    const firstMarker = container.querySelector("g")!;
    fireEvent.click(firstMarker);
    expect(onNoteClick).toHaveBeenCalledWith("E2");
  });

  it("is not clickable when no onNoteClick handler is given", () => {
    const { container } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
      />,
    );
    const firstMarker = container.querySelector("g")!;
    expect(() => fireEvent.click(firstMarker)).not.toThrow();
  });

  it("gives each marker a tooltip with both its note name and interval", () => {
    const { container } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
      />,
    );
    const titles = Array.from(container.querySelectorAll("title")).map(
      (title) => title.textContent,
    );
    expect(titles).toContain("E (R)");
    expect(titles).toContain("A (4)");
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

  it("mirrors the nut towards the right edge in left-handed mode", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} leftHanded />,
    );
    const svg = container.querySelector("svg")!;
    const nut = container.querySelector("line")!;
    const width = Number(svg.getAttribute("width"));
    // The nut, normally at x=40, mirrors to width - 40.
    expect(nut.getAttribute("x1")).toBe(String(width - 40));
  });

  it("keeps the nut on the left when not left-handed", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    const nut = container.querySelector("line")!;
    expect(nut.getAttribute("x1")).toBe("40");
  });

  describe("pattern builder", () => {
    // For this fixture, E and A fall at (0,0) (1,0) (2,2) (3,2) (5,0) — 5 positions.
    it("shows every highlighted note as a candidate when the path is empty", () => {
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={2}
          rootNote="E"
          highlightedNotes={["E", "A"]}
          patternPath={[]}
        />,
      );
      expect(container.querySelectorAll("g")).toHaveLength(5);
      expect(container.querySelectorAll("[stroke-dasharray]")).toHaveLength(5);
    });

    it("narrows to the placed note plus its candidates once the path has a start", () => {
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={2}
          rootNote="E"
          highlightedNotes={["E", "A"]}
          patternPath={[{ stringIndex: 0, fret: 0 }]}
        />,
      );
      // Placed: (0,0). Candidate: (1,0) — the only scale tone within reach.
      expect(container.querySelectorAll("g")).toHaveLength(2);
      expect(container.querySelectorAll("[stroke-dasharray]")).toHaveLength(1);
    });

    it("calls onPatternStepAdd with the clicked candidate's position, and does not play a sound", () => {
      const onPatternStepAdd = vi.fn();
      const onNoteClick = vi.fn();
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={2}
          rootNote="E"
          highlightedNotes={["E", "A"]}
          patternPath={[{ stringIndex: 0, fret: 0 }]}
          onPatternStepAdd={onPatternStepAdd}
          onNoteClick={onNoteClick}
        />,
      );
      const candidate = container
        .querySelector("[stroke-dasharray]")!
        .closest("g")!;
      fireEvent.click(candidate);
      expect(onPatternStepAdd).toHaveBeenCalledWith({
        stringIndex: 1,
        fret: 0,
      });
      expect(onNoteClick).not.toHaveBeenCalled();
    });

    it("calls onPatternStepRemoveFrom with a placed note's position when it's clicked, and does not play a sound", () => {
      const onPatternStepRemoveFrom = vi.fn();
      const onNoteClick = vi.fn();
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={2}
          rootNote="E"
          highlightedNotes={["E", "A"]}
          patternPath={[{ stringIndex: 0, fret: 0 }]}
          onPatternStepRemoveFrom={onPatternStepRemoveFrom}
          onNoteClick={onNoteClick}
        />,
      );
      const placed = Array.from(container.querySelectorAll("g")).find(
        (g) => !g.querySelector("[stroke-dasharray]"),
      )!;
      fireEvent.click(placed);
      expect(onPatternStepRemoveFrom).toHaveBeenCalledWith({
        stringIndex: 0,
        fret: 0,
      });
      expect(onNoteClick).not.toHaveBeenCalled();
    });
  });
});
