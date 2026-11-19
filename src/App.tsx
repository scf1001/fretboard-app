import { useEffect, useState } from "react";
import Controls from "./components/Controls";
import Fretboard from "./components/Fretboard";
import Settings from "./components/Settings";
import { playNote } from "./lib/audio";
import { type PatternStep } from "./lib/pattern";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./lib/preferences";
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
  const [patternPath, setPatternPath] = useState<PatternStep[] | null>(null);
  // Passing the function itself (not calling it) means it only runs on the first render.
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  /** Applies and saves a change to one or more display preferences. */
  function updatePreferences(changes: Partial<Preferences>) {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    savePreferences(next);
  }

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

  const tuning =
    tuningPreset === "custom"
      ? customTuning
      : TUNING_PRESETS.find((preset) => preset.value === tuningPreset)!.tuning!;

  // The pattern path's positions are only meaningful for the scale/chord/tuning they
  // were built against — changing any of those invalidates it, so each handler below
  // that changes root, mode, type, or tuning also clears the in-progress pattern.
  function handleRootChange(newRoot: string) {
    setRoot(newRoot);
    setPatternPath(null);
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setType(newMode === "scale" ? SCALE_TYPES[0].value : CHORD_TYPES[0].value);
    setPatternPath(null);
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    setPatternPath(null);
  }

  function handleTuningPresetChange(newPreset: TuningPreset) {
    if (newPreset === "custom") {
      setCustomTuning(tuning);
    }
    setTuningPreset(newPreset);
    setPatternPath(null);
  }

  function handleCustomStringChange(stringIndex: number, note: string) {
    setCustomTuning((prev) =>
      prev.map((n, i) => (i === stringIndex ? note : n)),
    );
    setPatternPath(null);
  }

  function handlePatternStepAdd(step: PatternStep) {
    setPatternPath((prev) => (prev ? [...prev, step] : [step]));
  }

  function handlePatternStepRemoveFrom(step: PatternStep) {
    setPatternPath((prev) => {
      if (!prev) return prev;
      const index = prev.findIndex(
        (p) => p.stringIndex === step.stringIndex && p.fret === step.fret,
      );
      return index === -1 ? prev : prev.slice(0, index);
    });
  }

  const notes =
    mode === "scale" ? scaleNotes(root, type) : chordNotes(root, type);

  const typeLabel =
    (mode === "scale" ? SCALE_TYPES : CHORD_TYPES).find((t) => t.value === type)
      ?.label ?? type;
  const patternStatus =
    patternPath === null
      ? ""
      : ` Building a pattern: ${patternPath.length} note${patternPath.length === 1 ? "" : "s"} placed.`;
  const announcement = `Showing ${root} ${typeLabel} ${mode}, ${TUNING_PRESETS.find((p) => p.value === tuningPreset)?.label} tuning.${patternStatus}`;

  return (
    <>
      <main>
        <h1>Fretboard</h1>
        {/* After the heading in the DOM so screen readers meet the page title first;
            CSS places it in the top-right corner. */}
        <div className="app-settings">
          <Settings
            wood={preferences.wood}
            onWoodChange={(wood) => updatePreferences({ wood })}
            inlay={preferences.inlay}
            onInlayChange={(inlay) => updatePreferences({ inlay })}
          />
        </div>
        <p className="visually-hidden" aria-live="polite">
          {announcement}
        </p>
        <Controls
          root={root}
          onRootChange={handleRootChange}
          mode={mode}
          onModeChange={handleModeChange}
          type={type}
          onTypeChange={handleTypeChange}
          tuningPreset={tuningPreset}
          onTuningPresetChange={handleTuningPresetChange}
          customTuning={customTuning}
          onCustomStringChange={handleCustomStringChange}
          labelMode={labelMode}
          onLabelModeChange={setLabelMode}
          leftHanded={leftHanded}
          onLeftHandedChange={setLeftHanded}
        />
        <div className="pattern-builder-bar">
          {patternPath === null ? (
            <button type="button" onClick={() => setPatternPath([])}>
              Build a pattern
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setPatternPath(null)}>
                Clear pattern
              </button>
              <span className="pattern-builder-hint">
                {patternPath.length === 0
                  ? "Click a note to start your pattern."
                  : "Click a dashed note to continue, or a placed note to remove it and everything after."}
              </span>
            </>
          )}
        </div>
        <div className="fretboard-scroll">
          <Fretboard
            tuning={tuning}
            numFrets={15}
            rootNote={root}
            highlightedNotes={notes}
            labelMode={labelMode}
            leftHanded={leftHanded}
            wood={preferences.wood}
            inlay={preferences.inlay}
            onNoteClick={playNote}
            patternPath={patternPath}
            onPatternStepAdd={handlePatternStepAdd}
            onPatternStepRemoveFrom={handlePatternStepRemoveFrom}
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
