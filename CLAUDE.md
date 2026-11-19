# Fretboard App

A React web app for guitarists that shows notes, scales and chords on the fretboard. It's also a portfolio project to show employers, so the priority is a small, polished, finished version 1 rather than lots of features.

## Stack
- Vite + React + TypeScript
- ESLint and Prettier
- Vitest and React Testing Library
- Tonal (`tonal`) for music theory: scales, chords, intervals, enharmonics
- SVG for the fretboard
- No backend for v1. Deploy as a static site (Netlify, Vercel or GitHub Pages).
- GitHub Actions runs lint and tests on every push.

## Structure
- `src/lib/theory.ts`: plain functions with no React, fully unit tested
  - `noteAt(string, fret, tuning)`: the note at a position, `(open-string note + fret) mod 12`
  - `scaleNotes(root, type)` / `chordNotes(root, type)`: wrappers around Tonal
- `App`: state for root, scale or chord type, tuning, label mode (note names or intervals) and left-handed
- `Controls`: dropdowns and toggles
- `Fretboard` (SVG): renders `String`, `Fret` and `NoteMarker`

## v1 features
- A fretboard with 6 strings, 12–24 frets and fret markers
- Choose a root and a scale or chord, and the matching notes are highlighted, with the root shown differently
- Labels show note names or intervals
- Tunings: standard, drop D, DADGAD, or custom
- Left-handed mode
- Settings stored in the URL (e.g. `?root=A&scale=minor-pentatonic`)
- Responsive: on phones the fretboard scrolls sideways
- Accessible: keyboard navigation, ARIA labels, and colour-blind-safe highlighting that also uses shape or labels, not colour alone

## Later
1. **Sound on click** — play a note's pitch via Web Audio API or Tone.js when its marker is clicked/tapped
2. **Chord shapes / CAGED positions** — preset moveable fingering diagrams for common chord shapes
3. **Pattern builder** — layered on top of the current scale/chord selection: click a starting scale-tone, then click through connected notes to trace one playable fingering shape (2-notes-per-string, 3-notes-per-string, or any mix). Candidates are the nearest not-yet-used scale-tone up/down on the same string within 3 frets of the last note, or a scale-tone on an adjacent string from 1 fret below the lowest to 1 fret above the highest note played on the current string (where the hand already is). The traced path replaces the full-neck highlight; clicking an already-placed note removes it and everything after it; a "clear" action resets to the full scale highlight.
4. **Capo** — shift all fretted positions down by a capo offset
5. **7/8-string guitars** — variable string count
6. **Bass tunings** — 4/5/6-string bass presets
7. **Quiz mode** — test the user on notes/scales/intervals
8. **Favourites** — save specific root+scale/chord+tuning combos (a saved pattern-builder shape could be one kind of favourite)

## Milestones
1. Set up the project, write the theory functions and their tests
2. Draw a static SVG fretboard
3. Add the controls and highlight the notes
4. Add tunings, label modes and left-handed mode
5. Do an accessibility and mobile pass
6. Deploy, set up CI and write the README with a screenshot or GIF (this is v1)
7. Later features

## Commits
- Work in small steps: **one logical change per commit**.
- Use Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`). The subject line is imperative and under about 70 characters. Add a short body when the reason isn't obvious.
