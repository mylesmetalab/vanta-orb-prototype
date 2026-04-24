// Single source of truth for the tuning sliders. Both the fullscreen Tuner
// and the inline SettingsPanel on the mobile prototype render from this list.
//
// `toggle` — optional. When set to a key in params, the panel renders a
// round on/off switch next to the slider. When toggled off, useOrb passes 0
// for the related uniform regardless of the slider value.
// `rb` — rebuild: geometry must be recreated when this slider changes.

export const SLIDERS = [
  { k: "particleCount", label: "Particles", min: 500, max: 8000, step: 100, rb: true },
  { k: "particleBaseline", label: "Baseline visible", min: 0, max: 1, step: 0.02 },
  { k: "size", label: "Overall Size", min: 0.3, max: 4, step: 0.1 },
  { k: "sizeContrast", label: "Size Contrast", min: 1, max: 15, step: 0.5 },
  { k: "sizeMax", label: "Largest Particle", min: 0.2, max: 3, step: 0.1 },
  { k: "baseSpeed", label: "Orbit Speed", min: 0.005, max: 0.15, step: 0.002 },
  { k: "drift", label: "Speed Drift", min: 0, max: 1.5, step: 0.05 },
  { k: "turbulence", label: "Turbulence", min: 0, max: 0.15, step: 0.002 },
  { k: "turbFreq", label: "Turb Frequency", min: 0.5, max: 5, step: 0.1 },
  { k: "turbSpeed", label: "Turb Speed", min: 0, max: 0.3, step: 0.005 },

  { k: "reactivity", label: "Voice Reactivity (master)", min: 0, max: 6, step: 0.1 },
  { k: "reactSpeed", label: "→ Speed", min: 0, max: 4, step: 0.05, toggle: "enableReactSpeed" },
  { k: "reactTurb", label: "→ Turbulence", min: 0, max: 4, step: 0.05, toggle: "enableReactTurb" },
  { k: "reactSize", label: "→ Particle size", min: 0, max: 1, step: 0.02, toggle: "enableReactSize" },
  { k: "reactBass", label: "→ Bass boost", min: 0, max: 2, step: 0.05, toggle: "enableReactBass" },
  { k: "reactRadius", label: "→ Fly outward", min: 0, max: 2, step: 0.02, toggle: "enableReactRadius" },
  { k: "reactScale", label: "→ Whole-orb pulse", min: 0, max: 0.6, step: 0.01, toggle: "enableReactScale" },
  { k: "reactCount", label: "→ Particle count", min: 0, max: 1, step: 0.02, toggle: "enableReactCount" },

  { k: "smoothing", label: "Audio Smoothing", min: 0.8, max: 0.99, step: 0.005 },
  { k: "breathSpeed", label: "Breath Speed", min: 0, max: 0.8, step: 0.02 },
  { k: "breathAmt", label: "Breath Depth", min: 0, max: 0.05, step: 0.001 },
  { k: "hollow", label: "Hollow center (idle only)", min: 0, max: 1, step: 0.02 },
  { k: "opacity", label: "Opacity", min: 0.3, max: 1, step: 0.05 },
];

export const TUNER_EXTRA_SLIDERS = [
  { k: "smallSizeScale", label: "Small Size Scale", min: 0.2, max: 1.2, step: 0.05 },
  { k: "smallAudioScale", label: "Small Audio Scale", min: 0.0, max: 1.0, step: 0.05 },
  { k: "r", label: "Red", min: 0, max: 1, step: 0.01 },
  { k: "g", label: "Green", min: 0, max: 1, step: 0.01 },
  { k: "b", label: "Blue", min: 0, max: 1, step: 0.01 },
];
