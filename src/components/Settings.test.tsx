import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Settings from "./Settings";

describe("Settings", () => {
  it("keeps the dialog closed until the Settings button is pressed", () => {
    render(<Settings wood="maple" onWoodChange={() => {}} />);
    // Closed dialogs are hidden from the accessibility tree.
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /settings/i }));
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
  });

  it("offers each wood in a dropdown, with the current one selected", () => {
    render(<Settings wood="rosewood" onWoodChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));

    const select = screen.getByRole("combobox", { name: /fretboard wood/i });
    expect(select).toHaveValue("rosewood");
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Maple", "Rosewood", "Ebony"]);
  });

  it("reports a newly chosen wood", () => {
    const onWoodChange = vi.fn();
    render(<Settings wood="maple" onWoodChange={onWoodChange} />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));

    fireEvent.change(
      screen.getByRole("combobox", { name: /fretboard wood/i }),
      { target: { value: "ebony" } },
    );
    expect(onWoodChange).toHaveBeenCalledWith("ebony");
  });

  it("closes when Done is pressed", () => {
    render(<Settings wood="maple" onWoodChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
