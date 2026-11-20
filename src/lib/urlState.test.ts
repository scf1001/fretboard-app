import { describe, expect, it } from "vitest";
import { searchParamsToState, stateToSearchParams } from "./urlState";
import { STANDARD_TUNING } from "./theory";

const baseState = {
  root: "A",
  mode: "scale" as const,
  type: "minor pentatonic",
  tuningPreset: "standard" as const,
  customTuning: STANDARD_TUNING,
  labelMode: "name" as const,
};

describe("stateToSearchParams", () => {
  it("encodes the scale type under its own key, with spaces as hyphens", () => {
    const params = stateToSearchParams(baseState);
    expect(params.get("root")).toBe("A");
    expect(params.get("scale")).toBe("minor-pentatonic");
    expect(params.get("chord")).toBeNull();
  });

  it("encodes the chord type under its own key", () => {
    const params = stateToSearchParams({
      ...baseState,
      mode: "chord",
      type: "maj7",
    });
    expect(params.get("chord")).toBe("maj7");
    expect(params.get("scale")).toBeNull();
  });

  it("omits customTuning unless the tuning preset is custom", () => {
    expect(stateToSearchParams(baseState).get("customTuning")).toBeNull();
    const custom = stateToSearchParams({
      ...baseState,
      tuningPreset: "custom",
      customTuning: ["D2", "A2", "D3", "G3", "B3", "E4"],
    });
    expect(custom.get("customTuning")).toBe("D2,A2,D3,G3,B3,E4");
  });
});

describe("searchParamsToState", () => {
  it("round-trips a full state", () => {
    const params = stateToSearchParams({
      ...baseState,
      tuningPreset: "custom",
      customTuning: ["D2", "A2", "D3", "G3", "B3", "E4"],
    });
    expect(searchParamsToState(params)).toEqual({
      root: "A",
      mode: "scale",
      type: "minor pentatonic",
      tuningPreset: "custom",
      customTuning: ["D2", "A2", "D3", "G3", "B3", "E4"],
      labelMode: "name",
    });
  });

  it("ignores an invalid root rather than throwing", () => {
    const params = new URLSearchParams("root=Z");
    expect(searchParamsToState(params).root).toBeUndefined();
  });

  it("ignores an unknown scale type", () => {
    const params = new URLSearchParams("scale=bogus-scale");
    const result = searchParamsToState(params);
    expect(result.mode).toBeUndefined();
    expect(result.type).toBeUndefined();
  });

  it("ignores a custom tuning with the wrong number of strings", () => {
    const params = new URLSearchParams("customTuning=E2,A2,D3");
    expect(searchParamsToState(params).customTuning).toBeUndefined();
  });

  it("returns an empty-ish result for an empty query string", () => {
    const result = searchParamsToState(new URLSearchParams());
    expect(result.root).toBeUndefined();
    expect(result.mode).toBeUndefined();
    expect(result.tuningPreset).toBeUndefined();
  });
});
