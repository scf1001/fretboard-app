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
Sound on click (Web Audio API or Tone.js), chord shapes and CAGED positions, capo, 7-string and bass, a quiz mode, favourites.

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
