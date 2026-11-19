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

  it("closes when Done is pressed", () => {
    renderOpen();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
