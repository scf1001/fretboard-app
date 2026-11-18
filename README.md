# Fretboard

A fretboard visualizer for guitarists. Pick a root note and a scale or chord, and
the matching notes are highlighted across the neck, with the root shown as a
distinct shape rather than just a colour.

**[Live demo](https://scf1001.github.io/fretboard-app/)**

![Screenshot of the Fretboard app showing A minor pentatonic highlighted on a standard-tuned fretboard](docs/screenshot.png)

## Features

- Highlights the notes of any scale or chord for any root
- Note name or interval labels
- Standard, Drop D, DADGAD, or custom tunings
- Left-handed mode
- Settings are stored in the URL, so a configuration can be shared or bookmarked
- Responsive — the fretboard scrolls sideways on narrow screens
- Accessible — keyboard-navigable controls, ARIA labels describing what's
  highlighted, a live announcement when selections change, and
  colour-blind-safe highlighting (shape and label, not colour alone)

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tonal](https://github.com/tonaljs/tonal) for music theory (scales, chords, intervals, enharmonics)
- An SVG fretboard, no canvas or external rendering library
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for tests
- ESLint + Prettier
- Deployed as a static site via GitHub Actions + GitHub Pages

## Development

```bash
npm install
npm run dev       # start the dev server
npm test          # run tests (watch mode)
npm run lint      # lint
npm run format    # format with Prettier
npm run build     # typecheck and build for production
```

GitHub Actions runs lint, format checks, tests, and a production build on every
push.
