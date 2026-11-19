import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted runs before the vi.mock below (which Vitest moves to the top of the file),
// so the fake synth exists when the mocked module is built.
const fake = vi.hoisted(() => ({
  volume: { value: 0 },
  triggerAttackRelease: vi.fn(),
}));

// Replace Tone.js with a stand-in: jsdom has no Web Audio API, and the tests only need
// to see what playNote asks the synth to do.
vi.mock("tone", () => ({
  start: () => Promise.resolve(),
  gainToDb: (gain: number) => 20 * Math.log10(gain),
  Synth: class {
    volume = fake.volume;
    triggerAttackRelease = fake.triggerAttackRelease;
    toDestination() {
      return this;
    }
  },
}));

const { playNote, setVolume } = await import("./audio");

/** playNote waits for Tone.start(); let that promise settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

beforeEach(() => {
  fake.triggerAttackRelease.mockClear();
  fake.volume.value = 0;
  setVolume(100);
});

describe("playNote", () => {
  it("plays the note at full volume by default", async () => {
    playNote("A4");
    await settle();
    expect(fake.triggerAttackRelease).toHaveBeenCalledWith("A4", "8n");
    expect(fake.volume.value).toBeCloseTo(0);
  });

  it("plays at half amplitude, about -6 dB, at 50%", async () => {
    setVolume(50);
    playNote("A4");
    await settle();
    expect(fake.volume.value).toBeCloseTo(-6.02, 1);
  });

  it("plays nothing at 0%", async () => {
    setVolume(0);
    playNote("A4");
    await settle();
    expect(fake.triggerAttackRelease).not.toHaveBeenCalled();
  });

  it("clamps volumes outside 0–100", async () => {
    setVolume(150);
    playNote("A4");
    await settle();
    expect(fake.volume.value).toBeCloseTo(0);

    setVolume(-20);
    playNote("A4");
    await settle();
    expect(fake.triggerAttackRelease).toHaveBeenCalledTimes(1);
  });
});
