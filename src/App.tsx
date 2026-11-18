import { useState } from "react";
import Controls from "./components/Controls";
import Fretboard from "./components/Fretboard";
import {
  chordNotes,
  CHORD_TYPES,
  scaleNotes,
  SCALE_TYPES,
  STANDARD_TUNING,
  TUNING_PRESETS,
  type LabelMode,
  type Mode,
  type Tuning,
  type TuningPreset,
} from "./lib/theory";
import "./App.css";

function App() {
  const [root, setRoot] = useState("A");
  const [mode, setMode] = useState<Mode>("scale");
  const [type, setType] = useState(SCALE_TYPES[0].value);
  const [tuningPreset, setTuningPreset] = useState<TuningPreset>("standard");
  const [customTuning, setCustomTuning] = useState<Tuning>(STANDARD_TUNING);
  const [labelMode, setLabelMode] = useState<LabelMode>("name");
  const [leftHanded, setLeftHanded] = useState(false);

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setType(newMode === "scale" ? SCALE_TYPES[0].value : CHORD_TYPES[0].value);
  }

  const tuning =
    tuningPreset === "custom"
      ? customTuning
      : TUNING_PRESETS.find((preset) => preset.value === tuningPreset)!.tuning!;

  function handleTuningPresetChange(newPreset: TuningPreset) {
    if (newPreset === "custom") {
      setCustomTuning(tuning);
    }
    setTuningPreset(newPreset);
  }

  function handleCustomStringChange(stringIndex: number, note: string) {
    setCustomTuning((prev) =>
      prev.map((n, i) => (i === stringIndex ? note : n)),
    );
  }

  const notes =
    mode === "scale" ? scaleNotes(root, type) : chordNotes(root, type);

  return (
    <main>
      <h1>Fretboard</h1>
      <Controls
        root={root}
        onRootChange={setRoot}
        mode={mode}
        onModeChange={handleModeChange}
        type={type}
        onTypeChange={setType}
        tuningPreset={tuningPreset}
        onTuningPresetChange={handleTuningPresetChange}
        customTuning={customTuning}
        onCustomStringChange={handleCustomStringChange}
        labelMode={labelMode}
        onLabelModeChange={setLabelMode}
        leftHanded={leftHanded}
        onLeftHandedChange={setLeftHanded}
      />
      <div className="fretboard-scroll">
        <Fretboard
          tuning={tuning}
          numFrets={15}
          rootNote={root}
          highlightedNotes={notes}
          labelMode={labelMode}
          leftHanded={leftHanded}
        />
      </div>
    </main>
  );
}

export default App;
