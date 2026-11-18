import { useState } from "react";
import Controls from "./components/Controls";
import Fretboard from "./components/Fretboard";
import {
  chordNotes,
  CHORD_TYPES,
  scaleNotes,
  SCALE_TYPES,
  STANDARD_TUNING,
  type Mode,
} from "./lib/theory";
import "./App.css";

function App() {
  const [root, setRoot] = useState("A");
  const [mode, setMode] = useState<Mode>("scale");
  const [type, setType] = useState(SCALE_TYPES[0].value);

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setType(newMode === "scale" ? SCALE_TYPES[0].value : CHORD_TYPES[0].value);
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
      />
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={15}
        rootNote={root}
        highlightedNotes={notes}
      />
    </main>
  );
}

export default App;
