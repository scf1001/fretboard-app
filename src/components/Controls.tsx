import { CHORD_TYPES, ROOTS, SCALE_TYPES, type Mode } from "../lib/theory";
import "./Controls.css";

type ControlsProps = {
  root: string;
  onRootChange: (root: string) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  type: string;
  onTypeChange: (type: string) => void;
};

/** Dropdowns and toggles for choosing a root note and a scale or chord. */
function Controls({
  root,
  onRootChange,
  mode,
  onModeChange,
  type,
  onTypeChange,
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
    </div>
  );
}

export default Controls;
