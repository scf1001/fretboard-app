import { useEffect, useState } from "react";
import Controls from "./components/Controls";
import Fretboard from "./components/Fretboard";
import { playNote } from "./lib/audio";
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
import { searchParamsToState, stateToSearchParams } from "./lib/urlState";
import "./App.css";

function App() {
  const initial = searchParamsToState(
    new URLSearchParams(window.location.search),
  );

  const [root, setRoot] = useState(initial.root ?? "A");
  const [mode, setMode] = useState<Mode>(initial.mode ?? "scale");
  const [type, setType] = useState(initial.type ?? SCALE_TYPES[0].value);
  const [tuningPreset, setTuningPreset] = useState<TuningPreset>(
    initial.tuningPreset ?? "standard",
  );
  const [customTuning, setCustomTuning] = useState<Tuning>(
    initial.customTuning ?? STANDARD_TUNING,
  );
  const [labelMode, setLabelMode] = useState<LabelMode>(
    initial.labelMode ?? "name",
  );
  const [leftHanded, setLeftHanded] = useState(initial.leftHanded ?? false);

  useEffect(() => {
    const params = stateToSearchParams({
      root,
      mode,
      type,
      tuningPreset,
      customTuning,
      labelMode,
      leftHanded,
    });
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [root, mode, type, tuningPreset, customTuning, labelMode, leftHanded]);

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

  const typeLabel =
    (mode === "scale" ? SCALE_TYPES : CHORD_TYPES).find((t) => t.value === type)
      ?.label ?? type;
  const announcement = `Showing ${root} ${typeLabel} ${mode}, ${TUNING_PRESETS.find((p) => p.value === tuningPreset)?.label} tuning.`;

  return (
    <>
      <main>
        <h1>Fretboard</h1>
        <p className="visually-hidden" aria-live="polite">
          {announcement}
        </p>
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
            onNoteClick={playNote}
          />
        </div>
      </main>
      <footer>
        <a
          href="https://github.com/scf1001/fretboard-app"
          target="_blank"
          rel="noreferrer"
        >
          View source on GitHub
        </a>
      </footer>
    </>
  );
}

export default App;
