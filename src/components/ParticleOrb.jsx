import * as THREE from "three";
import vertexShader from "../shaders/orb.vert.glsl?raw";
import fragmentShader from "../shaders/orb.frag.glsl?raw";
import DEFAULTS from "../config/orbDefaults.json";

export function makeParticles(count, uniforms) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const inclinations = new Float32Array(count);
  const nodes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const sizes = new Float32Array(count);
  const drifts = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    inclinations[i] = Math.acos(2 * Math.random() - 1);
    nodes[i] = Math.random() * Math.PI * 2;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.pow(Math.random(), 1.5) * 1.6;
    radii[i] = 0.9 + Math.random() * 0.2;
    drifts[i] = Math.random() * 100;
    sizes[i] = Math.random();

    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    positions[i * 3] = Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = Math.cos(phi);
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aInclination", new THREE.BufferAttribute(inclinations, 1));
  geo.setAttribute("aNode", new THREE.BufferAttribute(nodes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geo.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aDrift", new THREE.BufferAttribute(drifts, 1));

  const u = uniforms || {
    uTime: { value: 0 },
    uAudioLevel: { value: 0 },
    uAudioBass: { value: 0 },
    uAudioTreble: { value: 0 },
    uBaseSpeed: { value: DEFAULTS.baseSpeed },
    uReactivity: { value: DEFAULTS.reactivity },
    uTurbulence: { value: DEFAULTS.turbulence },
    uTurbFreq: { value: DEFAULTS.turbFreq },
    uTurbSpeed: { value: DEFAULTS.turbSpeed },
    uSize: { value: DEFAULTS.size },
    uSizeContrast: { value: DEFAULTS.sizeContrast },
    uSizeMax: { value: DEFAULTS.sizeMax },
    uOpacity: { value: DEFAULTS.opacity },
    uColor: { value: new THREE.Vector3(1, 1, 1) },
    uBreathSpeed: { value: DEFAULTS.breathSpeed },
    uBreathAmt: { value: DEFAULTS.breathAmt },
    uDrift: { value: DEFAULTS.drift },
    uReactSpeed: { value: DEFAULTS.reactSpeed ?? 1.0 },
    uReactTurb: { value: DEFAULTS.reactTurb ?? 1.5 },
    uReactSize: { value: DEFAULTS.reactSize ?? 0.1 },
    uReactBass: { value: DEFAULTS.reactBass ?? 0.3 },
    uReactRadius: { value: DEFAULTS.reactRadius ?? 0.0 },
    uReactScale: { value: DEFAULTS.reactScale ?? 0.0 },
    uHollow: { value: DEFAULTS.hollow ?? 0.0 },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: u,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { geo, mat, pts };
}
