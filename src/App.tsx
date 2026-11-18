import Fretboard from "./components/Fretboard";
import { STANDARD_TUNING } from "./lib/theory";
import "./App.css";

function App() {
  return (
    <main>
      <h1>Fretboard</h1>
      <Fretboard tuning={STANDARD_TUNING} numFrets={15} />
    </main>
  );
}

export default App;
