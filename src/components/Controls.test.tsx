import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Controls from "./Controls";
import { CHORD_TYPES, SCALE_TYPES, STANDARD_TUNING } from "../lib/theory";

function renderControls(overrides = {}) {
  const props = {
    root: "A",
    onRootChange: vi.fn(),
    mode: "scale" as const,
    onModeChange: vi.fn(),
    type: SCALE_TYPES[0].value,
    onTypeChange: vi.fn(),
    tuningPreset: "standard" as const,
    onTuningPresetChange: vi.fn(),
    customTuning: STANDARD_TUNING,
    onCustomStringChange: vi.fn(),
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

  it("calls onTuningPresetChange when a new tuning is picked", async () => {
    const user = userEvent.setup();
    const props = renderControls();

    await user.selectOptions(screen.getByLabelText("Tuning"), "dropD");

    expect(props.onTuningPresetChange).toHaveBeenCalledWith("dropD");
  });

  it("hides custom tuning inputs unless the custom preset is selected", () => {
    renderControls({ tuningPreset: "standard" });

    expect(screen.queryByText("Custom tuning (open string notes)")).toBeNull();
  });

  it("shows a custom tuning input per string, ordered highest to lowest", () => {
    renderControls({ tuningPreset: "custom" });

    const inputs = screen.getAllByRole("textbox");
    expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual(
      [...STANDARD_TUNING].reverse(),
    );
  });

  it("calls onCustomStringChange with the tuning array's index, not the display position", async () => {
    const user = userEvent.setup();
    const props = renderControls({ tuningPreset: "custom" });

    // "String 1" is the highest-pitched string: the last entry in a low-to-high tuning array.
    const stringOneInput = screen.getByLabelText("String 1");
    await user.clear(stringOneInput);

    expect(props.onCustomStringChange).toHaveBeenCalledWith(5, "");
  });
});
