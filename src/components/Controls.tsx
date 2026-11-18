import {
  CHORD_TYPES,
  ROOTS,
  SCALE_TYPES,
  TUNING_PRESETS,
  type Mode,
  type Tuning,
  type TuningPreset,
} from "../lib/theory";
import "./Controls.css";

type ControlsProps = {
  root: string;
  onRootChange: (root: string) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  type: string;
  onTypeChange: (type: string) => void;
  tuningPreset: TuningPreset;
  onTuningPresetChange: (preset: TuningPreset) => void;
  customTuning: Tuning;
  onCustomStringChange: (stringIndex: number, note: string) => void;
};

/** Dropdowns and toggles for choosing a root note, a scale or chord, and a tuning. */
function Controls({
  root,
  onRootChange,
  mode,
  onModeChange,
  type,
  onTypeChange,
  tuningPreset,
  onTuningPresetChange,
  customTuning,
  onCustomStringChange,
}: ControlsProps) {
  const types = mode === "scale" ? SCALE_TYPES : CHORD_TYPES;

  return (
    <div className="controls">
      <label>
        Root
        <select value={root} onChange={(e) => onRootChange(e.target.value)}>
          {ROOTS.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Scale or chord</legend>
        <label>
          <input
            type="radio"
            name="mode"
            value="scale"
            checked={mode === "scale"}
            onChange={() => onModeChange("scale")}
          />
          Scale
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="chord"
            checked={mode === "chord"}
            onChange={() => onModeChange("chord")}
          />
          Chord
        </label>
      </fieldset>

      <label>
        Type
        <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tuning
        <select
          value={tuningPreset}
          onChange={(e) => onTuningPresetChange(e.target.value as TuningPreset)}
        >
          {TUNING_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      {tuningPreset === "custom" && (
        <fieldset className="custom-tuning">
          <legend>Custom tuning (open string notes)</legend>
          {customTuning
            .map((_, stringIndex) => stringIndex)
            .reverse()
            .map((stringIndex) => (
              <label key={stringIndex}>
                String {customTuning.length - stringIndex}
                <input
                  type="text"
                  value={customTuning[stringIndex]}
                  onChange={(e) =>
                    onCustomStringChange(stringIndex, e.target.value)
                  }
                />
              </label>
            ))}
        </fieldset>
      )}
    </div>
  );
}

export default Controls;
