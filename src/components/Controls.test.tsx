import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Controls from "./Controls";
import { CHORD_TYPES, SCALE_TYPES } from "../lib/theory";

function renderControls(overrides = {}) {
  const props = {
    root: "A",
    onRootChange: vi.fn(),
    mode: "scale" as const,
    onModeChange: vi.fn(),
    type: SCALE_TYPES[0].value,
    onTypeChange: vi.fn(),
    ...overrides,
  };
  render(<Controls {...props} />);
  return props;
}

describe("Controls", () => {
  it("calls onRootChange when a new root is picked", async () => {
    const user = userEvent.setup();
    const props = renderControls();

    await user.selectOptions(screen.getByLabelText("Root"), "C");

    expect(props.onRootChange).toHaveBeenCalledWith("C");
  });

  it("calls onModeChange when switching from scale to chord", async () => {
    const user = userEvent.setup();
    const props = renderControls();

    await user.click(screen.getByLabelText("Chord"));

    expect(props.onModeChange).toHaveBeenCalledWith("chord");
  });

  it("lists scale types when in scale mode", () => {
    renderControls({ mode: "scale", type: SCALE_TYPES[0].value });

    for (const { label } of SCALE_TYPES) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("lists chord types when in chord mode", () => {
    renderControls({ mode: "chord", type: CHORD_TYPES[0].value });

    for (const { label } of CHORD_TYPES) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("calls onTypeChange when a new type is picked", async () => {
    const user = userEvent.setup();
    const props = renderControls();

    await user.selectOptions(screen.getByLabelText("Type"), "major");

    expect(props.onTypeChange).toHaveBeenCalledWith("major");
  });
});
