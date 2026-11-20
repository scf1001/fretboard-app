import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Fretboard from "./Fretboard";
import { STANDARD_TUNING } from "../lib/theory";
import { INLAYS } from "../lib/inlays";
import { WOODS } from "../lib/woods";

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

  it("draws a wood background with a gradient and a grain layer", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    const [gradientRect, grainRect] =
      container.querySelectorAll('[data-part="wood"]');
    expect(gradientRect.getAttribute("fill")).toMatch(/^url\(#.+-wood\)$/);
    expect(grainRect.getAttribute("filter")).toMatch(/^url\(#.+-grain\)$/);
  });

  it("outlines every note marker, root and non-root, so it stands out from the wood", () => {
    const { container } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
      />,
    );
    const shapes = container.querySelectorAll("g > rect, g > circle");
    expect(shapes).toHaveLength(5);
    shapes.forEach((shape) =>
      expect(shape).toHaveAttribute("stroke", "var(--board-marker-outline)"),
    );
  });

  it("gives note markers, but not strings, the knockout edge", () => {
    const { container } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={2}
        rootNote="E"
        highlightedNotes={["E", "A"]}
      />,
    );
    const knockout = container.querySelector('filter[id$="-knockout"]');
    expect(knockout).not.toBeNull();
    const reference = `url(#${knockout!.id})`;

    const filtered = (selector: string) =>
      [...container.querySelectorAll(selector)].filter(
        (element) => element.getAttribute("filter") === reference,
      );
    expect(filtered("g")).toHaveLength(5);
    expect(filtered("line")).toHaveLength(0);
  });

  it.each(INLAYS.filter((inlay) => inlay !== "none"))(
    "draws %s inlays in the wood's inlay colour",
    (inlay) => {
      const { container } = render(
        <Fretboard tuning={STANDARD_TUNING} numFrets={12} inlay={inlay} />,
      );
      const inlays = container.querySelectorAll('[data-part="inlay"]');
      expect(inlays.length).toBeGreaterThan(0);
      inlays.forEach((shape) =>
        expect(shape).toHaveAttribute("fill", "var(--board-inlay)"),
      );
    },
  );

  it("draws dot inlays by default", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    const inlays = container.querySelectorAll('[data-part="inlay"]');
    expect(inlays).toHaveLength(4 * 1 + 1 * 2);
    inlays.forEach((shape) => expect(shape.tagName).toBe("circle"));
  });

  it.each(["blocks", "trapezoids", "sharktooth"] as const)(
    "draws one %s inlay on every marked fret, from the 1st to the 12th",
    (inlay) => {
      const { container, getByText } = render(
        <Fretboard tuning={STANDARD_TUNING} numFrets={12} inlay={inlay} />,
      );
      const inlays = container.querySelectorAll('[data-part="inlay"]');
      // Marked frets: 1, 3, 5, 7, 9 and 12.
      expect(inlays).toHaveLength(6);
      expect(getByText("1")).toBeInTheDocument();
      inlays.forEach((shape) => expect(shape.tagName).toBe("polygon"));
    },
  );

  it("spans block inlays from about the 2nd string to the 5th, not the full neck", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} inlay="blocks" />,
    );
    // String y positions, top (1st string) to bottom (6th).
    const stringYs = [...container.querySelectorAll("line")]
      .filter((line) => line.getAttribute("y1") === line.getAttribute("y2"))
      .map((line) => Number(line.getAttribute("y1")))
      .sort((a, b) => a - b);
    const [, second, , , fifth] = stringYs;
    const blockYs = container
      .querySelector('[data-part="inlay"]')!
      .getAttribute("points")!
      .split(" ")
      .map((point) => Number(point.split(",")[1]));

    const blockTop = Math.min(...blockYs);
    const blockBottom = Math.max(...blockYs);
    // Just past the 2nd and 5th strings, and well clear of the 1st and 6th.
    expect(blockTop).toBeLessThan(second);
    expect(blockTop).toBeGreaterThan(second - 8);
    expect(blockBottom).toBeGreaterThan(fifth);
    expect(blockBottom).toBeLessThan(fifth + 8);
  });

  it.each(["rosewood", "ebony"] as const)(
    "gives %s inlays a mother-of-pearl finish, in every style",
    (wood) => {
      for (const inlay of ["dots", "blocks"] as const) {
        const { container, unmount } = render(
          <Fretboard
            tuning={STANDARD_TUNING}
            numFrets={12}
            wood={wood}
            inlay={inlay}
          />,
        );
        const pearl = container.querySelector('filter[id$="-pearl"]');
        expect(pearl).not.toBeNull();
        container
          .querySelectorAll('[data-part="inlay"]')
          .forEach((shape) =>
            expect(shape).toHaveAttribute("filter", `url(#${pearl!.id})`),
          );
        unmount();
      }
    },
  );

  it("keeps maple's inlays plain", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} wood="maple" />,
    );
    container
      .querySelectorAll('[data-part="inlay"]')
      .forEach((shape) => expect(shape).not.toHaveAttribute("filter"));
  });

  it.each([
    [false, "right"],
    [true, "left"],
  ] as const)(
    "points trapezoids towards the body, with the shorter edge on the body side (left-handed: %s)",
    (leftHanded, bodySide) => {
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={12}
          inlay="trapezoids"
          leftHanded={leftHanded}
        />,
      );
      const points = container
        .querySelector('[data-part="inlay"]')!
        .getAttribute("points")!
        .split(" ")
        .map((point) => point.split(",").map(Number));
      const xs = points.map(([x]) => x);
      const edgeLength = (x: number) => {
        const ys = points.filter(([px]) => px === x).map(([, y]) => y);
        expect(ys).toHaveLength(2); // the parallel edges run across the neck
        return Math.abs(ys[1] - ys[0]);
      };
      const rightEdge = edgeLength(Math.max(...xs));
      const leftEdge = edgeLength(Math.min(...xs));
      const [bodyEdge, nutEdge] =
        bodySide === "right" ? [rightEdge, leftEdge] : [leftEdge, rightEdge];
      expect(bodyEdge).toBeLessThan(nutEdge);
    },
  );

  it.each(["trapezoids", "sharktooth"] as const)(
    "ends the long edge of %s halfway between the outer strings and the next ones in",
    (inlay) => {
      const { container } = render(
        <Fretboard tuning={STANDARD_TUNING} numFrets={12} inlay={inlay} />,
      );
      const [first, second, , , fifth, sixth] = [
        ...container.querySelectorAll("line"),
      ]
        .filter((line) => line.getAttribute("y1") === line.getAttribute("y2"))
        .map((line) => Number(line.getAttribute("y1")))
        .sort((a, b) => a - b);
      const ys = container
        .querySelector('[data-part="inlay"]')!
        .getAttribute("points")!
        .split(" ")
        .map((point) => Number(point.split(",")[1]));

      expect(Math.min(...ys)).toBeCloseTo((first + second) / 2);
      expect(Math.max(...ys)).toBeCloseTo((fifth + sixth) / 2);
    },
  );

  it("draws fret numbers in the page's text colour, so they show in dark mode too", () => {
    const { getByText } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    for (const number of ["3", "5", "7", "9", "12"]) {
      expect(getByText(number)).toHaveAttribute("fill", "var(--text)");
    }
  });

  it("keeps fret numbers clear of note markers on the bottom string", () => {
    // A is the root at the 5th fret on the low E string: the biggest marker, right above "5".
    const { container, getByText } = render(
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={12}
        rootNote="A"
        highlightedNotes={["A"]}
      />,
    );
    const rootSquares = [...container.querySelectorAll("g > rect")];
    const markerBottom = Math.max(
      ...rootSquares.map(
        (rect) =>
          Number(rect.getAttribute("y")) + Number(rect.getAttribute("height")),
      ),
    );
    const KNOCKOUT_AND_OUTLINE = 2 + 0.75;
    const DIGIT_HEIGHT = 9; // 12px digits
    const numberTop = Number(getByText("5").getAttribute("y")) - DIGIT_HEIGHT;
    expect(numberTop).toBeGreaterThan(markerBottom + KNOCKOUT_AND_OUTLINE);

    // And the numbers still fit inside the SVG.
    const svgHeight = Number(
      container.querySelector("svg")!.getAttribute("height"),
    );
    expect(Number(getByText("5").getAttribute("y"))).toBeLessThanOrEqual(
      svgHeight,
    );
  });

  it.each(INLAYS.filter((inlay) => inlay !== "none"))(
    "draws strings on top of %s inlays and fret wires, and note markers on top of strings",
    (inlay) => {
      const { container } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={12}
          inlay={inlay}
          rootNote="A"
          highlightedNotes={["A"]}
        />,
      );
      const lines = [...container.querySelectorAll("line")];
      const strings = lines.filter(
        (line) => line.getAttribute("y1") === line.getAttribute("y2"),
      );
      const wires = lines.filter(
        (line) => line.getAttribute("x1") === line.getAttribute("x2"),
      );
      const inlays = [...container.querySelectorAll('[data-part="inlay"]')];
      const markers = [...container.querySelectorAll("g")];
      // SVG paints in document order, so "on top" means "later in the markup".
      const isAfter = (later: Element, earlier: Element) =>
        Boolean(
          earlier.compareDocumentPosition(later) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        );

      expect(strings).toHaveLength(STANDARD_TUNING.length);
      for (const string of strings) {
        for (const below of [...inlays, ...wires]) {
          expect(isAfter(string, below)).toBe(true);
        }
        for (const marker of markers) {
          expect(isAfter(marker, string)).toBe(true);
        }
      }
    },
  );

  it("draws no inlays when none is chosen, but keeps the fret numbers", () => {
    const { container, getByText } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} inlay="none" />,
    );
    expect(container.querySelectorAll('[data-part="inlay"]')).toHaveLength(0);
    expect(getByText("12")).toBeInTheDocument();
  });

  it("mirrors the sharktooth in left-handed mode", () => {
    const pointsOf = (leftHanded: boolean) => {
      const { container, unmount } = render(
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={12}
          inlay="sharktooth"
          leftHanded={leftHanded}
        />,
      );
      const width = Number(
        container.querySelector("svg")!.getAttribute("width"),
      );
      const points = container
        .querySelector('[data-part="inlay"]')!
        .getAttribute("points")!
        .split(" ")
        .map((point) => point.split(",").map(Number));
      unmount();
      return { width, points };
    };
    const right = pointsOf(false);
    const left = pointsOf(true);
    left.points.forEach(([x, y], i) => {
      expect(x).toBeCloseTo(right.width - right.points[i][0]);
      expect(y).toBeCloseTo(right.points[i][1]);
    });
  });

  it.each(WOODS)("draws the board in %s when chosen", (wood) => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} wood={wood} />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("data-wood", wood);
  });

  it("draws the board in maple by default", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-wood",
      "maple",
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
    // (The wood background is also drawn with rects, so leave those out of the count.)
    expect(
      container.querySelectorAll('rect:not([data-part="wood"])'),
    ).toHaveLength(3);
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
    // The nut, normally at x=36, mirrors to width - 36.
    expect(nut.getAttribute("x1")).toBe(String(width - 36));
  });

  it("keeps the nut on the left when not left-handed", () => {
    const { container } = render(
      <Fretboard tuning={STANDARD_TUNING} numFrets={12} />,
    );
    const nut = container.querySelector("line")!;
    expect(nut.getAttribute("x1")).toBe("36");
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
      const candidates = container.querySelectorAll("[stroke-dasharray]");
      expect(candidates).toHaveLength(5);
      // Solid, not hollow: the label must stay readable over an inlay as well as bare wood.
      candidates.forEach((shape) =>
        expect(shape).toHaveAttribute("fill", "var(--board-wood-centre)"),
      );
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
