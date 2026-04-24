export const PRESETS = {
  idle:      { baseSpeed: 0.03, reactivity: 0.5, turbulence: 0.03, breathAmt: 0.02, drift: 0.8 },
  calm:      { baseSpeed: 0.04, reactivity: 1.2, turbulence: 0.04, breathAmt: 0.02, drift: 0.5 },
  energetic: { baseSpeed: 0.1,  reactivity: 3.5, turbulence: 0.1,  breathAmt: 0.005, drift: 1.5 },
  reactive:  { baseSpeed: 0.08, reactivity: 5.0, turbulence: 0.12, breathAmt: 0.005, drift: 1.2 },
};

export const TUNER_PRESETS = {
  idle:      { baseSpeed: 0.03, reactivity: 0.3, turbulence: 0.02, breathAmt: 0.015, drift: 0.4, sizeContrast: 10 },
  calm:      { baseSpeed: 0.04, reactivity: 0.6, turbulence: 0.03, breathAmt: 0.015, drift: 0.5, sizeContrast: 8 },
  energetic: { baseSpeed: 0.1,  reactivity: 2.0, turbulence: 0.06, breathAmt: 0.005, drift: 1.0, sizeContrast: 6 },
  breathing: { baseSpeed: 0.025,reactivity: 0.5, turbulence: 0.015,breathAmt: 0.04, breathSpeed: 0.15, drift: 0.3, sizeContrast: 9 },
  reactive:  { baseSpeed: 0.08, reactivity: 3.0, turbulence: 0.08, breathAmt: 0.005, drift: 0.8, sizeContrast: 7 },
};
