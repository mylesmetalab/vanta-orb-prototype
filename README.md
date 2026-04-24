# Vanta Orb Prototype

Interactive mobile prototype for Vanta — a voice recording app where a live particle orb responds to the user's voice in real time.

## Routes

- `/` — Mobile prototype (idle → recording → paused flow)
- `/tuner` — Fullscreen parameter tuner with sliders, dual-orb preview, presets, and JSON export

## Stack

Vite + React 19 + Three.js. Web Audio API for mic analysis, Web Speech API for live transcription.

## Run

```
npm install
npm run dev
```

Open `http://localhost:5173/` in Chrome and allow mic access.

## Structure

- `src/shaders/` — GLSL for the orbital particle system
- `src/components/ParticleOrb.jsx` — Three.js particle geometry + material
- `src/hooks/useAudio.js` — Web Audio mic analyser
- `src/hooks/useSpeech.js` — Web Speech API transcription
- `src/hooks/useOrb.js` — per-frame scene update
- `src/pages/Prototype.jsx` — mobile app
- `src/pages/Tuner.jsx` — parameter tuner
- `src/config/orbDefaults.json` — shared defaults exported from the tuner
