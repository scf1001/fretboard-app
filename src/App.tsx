import Fretboard from "./components/Fretboard";
import { scaleNotes, STANDARD_TUNING } from "./lib/theory";
import "./App.css";

function App() {
  const root = "A";
  const notes = scaleNotes(root, "minor pentatonic");

  return (
    <main>
      <h1>Fretboard</h1>
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
