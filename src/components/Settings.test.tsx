import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import Settings from "./Settings";

/** Renders Settings with harmless defaults, overridden per test, and opens the dialog. */
function renderOpen(props: Partial<ComponentProps<typeof Settings>> = {}) {
  render(
    <Settings
      wood="maple"
      onWoodChange={() => {}}
      inlay="dots"
      onInlayChange={() => {}}
      volume={100}
      onVolumeChange={() => {}}
      leftHanded={false}
      onLeftHandedChange={() => {}}
      {...props}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /settings/i }));
}

describe("Settings", () => {
  it("keeps the dialog closed until the Settings button is pressed", () => {
    render(
      <Settings
        wood="maple"
        onWoodChange={() => {}}
        inlay="dots"
        onInlayChange={() => {}}
        volume={100}
        onVolumeChange={() => {}}
        leftHanded={false}
        onLeftHandedChange={() => {}}
      />,
    );
    // Closed dialogs are hidden from the accessibility tree.
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /settings/i }));
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
  });

  it("offers each wood in a dropdown, with the current one selected", () => {
    renderOpen({ wood: "rosewood" });

    const select = screen.getByRole("combobox", { name: /fretboard wood/i });
    expect(select).toHaveValue("rosewood");
    expect(
      within(select)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Maple", "Rosewood", "Ebony"]);
  });

  it("reports a newly chosen wood", () => {
    const onWoodChange = vi.fn();
    renderOpen({ onWoodChange });

    fireEvent.change(
      screen.getByRole("combobox", { name: /fretboard wood/i }),
      { target: { value: "ebony" } },
    );
    expect(onWoodChange).toHaveBeenCalledWith("ebony");
  });

  it("offers each inlay style in a dropdown, with the current one selected", () => {
    renderOpen({ inlay: "blocks" });

    const select = screen.getByRole("combobox", { name: /fret inlays/i });
    expect(select).toHaveValue("blocks");
    expect(
      within(select)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Dots", "Blocks", "Trapezoids", "Sharktooth", "None"]);
  });

  it("reports a newly chosen inlay style", () => {
    const onInlayChange = vi.fn();
    renderOpen({ onInlayChange });

    fireEvent.change(screen.getByRole("combobox", { name: /fret inlays/i }), {
      target: { value: "sharktooth" },
    });
    expect(onInlayChange).toHaveBeenCalledWith("sharktooth");
  });

  it("shows the current volume on a 0–100% slider", () => {
    renderOpen({ volume: 40 });

    const slider = screen.getByRole("slider", { name: /volume/i });
    expect(slider).toHaveValue("40");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("aria-valuetext", "40%");
  });

  it("reports a newly chosen volume as a number", () => {
    const onVolumeChange = vi.fn();
    renderOpen({ onVolumeChange });

    fireEvent.change(screen.getByRole("slider", { name: /volume/i }), {
      target: { value: "25" },
    });
    expect(onVolumeChange).toHaveBeenCalledWith(25);
  });

  it("shows whether left-handed mode is on", () => {
    renderOpen({ leftHanded: true });

    expect(screen.getByRole("checkbox", { name: "Left-handed" })).toBeChecked();
  });

  it("reports left-handed mode being switched on", () => {
    const onLeftHandedChange = vi.fn();
    renderOpen({ onLeftHandedChange });

    fireEvent.click(screen.getByRole("checkbox", { name: "Left-handed" }));
    expect(onLeftHandedChange).toHaveBeenCalledWith(true);
  });

  it("closes when Done is pressed", () => {
    renderOpen();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
