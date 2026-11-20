import {
  CHORD_TYPES,
  ROOTS,
  SCALE_TYPES,
  TUNING_PRESETS,
  type LabelMode,
  type Mode,
  type Tuning,
  type TuningPreset,
} from "./theory";

export type AppState = {
  root: string;
  mode: Mode;
  type: string;
  tuningPreset: TuningPreset;
  customTuning: Tuning;
  labelMode: LabelMode;
};

function slugify(type: string): string {
  return type.replace(/ /g, "-");
}

function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

/** Serializes app state into URL search params, e.g. ?root=A&scale=minor-pentatonic. */
export function stateToSearchParams(state: AppState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("root", state.root);
  params.set(state.mode, slugify(state.type));
  params.set("tuning", state.tuningPreset);
  if (state.tuningPreset === "custom") {
    params.set("customTuning", state.customTuning.join(","));
  }
  params.set("labels", state.labelMode);
  return params;
}

/**
 * Parses URL search params into a partial app state, keeping only values that are
 * actually valid (the URL is user-editable, untrusted input) — callers should merge
 * this over their own defaults for anything left unset.
 */
export function searchParamsToState(
  params: URLSearchParams,
): Partial<AppState> {
  const result: Partial<AppState> = {};

  const root = params.get("root");
  if (root && ROOTS.includes(root)) {
    result.root = root;
  }

  const scale = params.get("scale");
  const chord = params.get("chord");
  if (scale !== null) {
    const type = unslugify(scale);
    if (SCALE_TYPES.some((t) => t.value === type)) {
      result.mode = "scale";
      result.type = type;
    }
  } else if (chord !== null) {
    const type = unslugify(chord);
    if (CHORD_TYPES.some((t) => t.value === type)) {
      result.mode = "chord";
      result.type = type;
    }
  }

  const tuning = params.get("tuning");
  if (tuning && TUNING_PRESETS.some((preset) => preset.value === tuning)) {
    result.tuningPreset = tuning as TuningPreset;
  }

  const customTuning = params.get("customTuning");
  if (customTuning) {
    const notes = customTuning.split(",");
    if (notes.length === 6) {
      result.customTuning = notes;
    }
  }

  const labels = params.get("labels");
  if (labels === "name" || labels === "interval") {
    result.labelMode = labels;
  }

  return result;
}
