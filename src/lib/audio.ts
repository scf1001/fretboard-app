import * as Tone from "tone";

let synth: Tone.Synth | undefined;

function getSynth(): Tone.Synth {
  synth ??= new Tone.Synth().toDestination();
  return synth;
}

/** Plays a note's pitch (e.g. "A4") through the browser's speakers. */
export function playNote(note: string): void {
  void Tone.start().then(() => {
    getSynth().triggerAttackRelease(note, "8n");
  });
}
