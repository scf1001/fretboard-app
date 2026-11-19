import * as Tone from "tone";

let synth: Tone.Synth | undefined;
/** 0–100. Kept here and applied when a note plays, so setting it never starts audio. */
let volumePercent = 100;

function getSynth(): Tone.Synth {
  synth ??= new Tone.Synth().toDestination();
  return synth;
}

/**
 * Sets how loud notes play, from 0 (silent) to 100 (full). Values outside that range
 * are clamped.
 */
export function setVolume(percent: number): void {
  volumePercent = Math.min(100, Math.max(0, percent));
}

/** Plays a note's pitch (e.g. "A4") through the browser's speakers. */
export function playNote(note: string): void {
  if (volumePercent === 0) return;
  void Tone.start().then(() => {
    const instrument = getSynth();
    // Treat the percentage as amplitude: 50% is half as loud in signal terms (about
    // -6 dB), which fades more evenly than mapping the slider straight onto decibels.
    instrument.volume.value = Tone.gainToDb(volumePercent / 100);
    instrument.triggerAttackRelease(note, "8n");
  });
}
