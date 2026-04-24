import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { makeParticles } from "../components/ParticleOrb";
import { fbm } from "../utils/noise";

export function useOrb(canvasRef, paramsRef, audioRef, pauseRef, smallRef) {
  const internals = useRef({});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 3.5;
    const gl = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setClearColor(0x000000, 0);

    const { geo, mat, pts } = makeParticles(paramsRef.current.particleCount);
    scene.add(pts);
    internals.current = { scene, cam, gl, pts, mat, geo };

    const clock = new THREE.Clock();
    let raf = 0, sA = 0, sB = 0, sT = 0;

    function resize() {
      const el = cv.parentElement;
      if (!el) return;
      gl.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement);

    function loop() {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      const p = paramsRef.current;
      const a = audioRef.current;
      const paused = pauseRef.current;
      const small = smallRef.current;

      let lv = a.level, bs = a.bass, tr = a.treble;
      if (p.simAudio && lv < 0.01) {
        lv = fbm(t * 0.7) * 0.35;
        bs = fbm(t * 0.5 + 100) * 0.3;
        tr = fbm(t * 0.9 + 200) * 0.25;
      }
      if (paused) { lv *= 0.05; bs *= 0.05; tr *= 0.05; }

      const scale = small ? 0.35 : 1.0;
      sA = sA * p.smoothing + (lv * scale) * (1 - p.smoothing);
      sB = sB * p.smoothing + (bs * scale) * (1 - p.smoothing);
      sT = sT * p.smoothing + (tr * scale) * (1 - p.smoothing);

      const u = internals.current.mat.uniforms;
      u.uTime.value = t;
      u.uAudioLevel.value = sA;
      u.uAudioBass.value = sB;
      u.uAudioTreble.value = sT;
      u.uBaseSpeed.value = p.baseSpeed;
      u.uReactivity.value = p.reactivity;
      u.uTurbulence.value = p.turbulence;
      u.uTurbFreq.value = p.turbFreq;
      u.uTurbSpeed.value = p.turbSpeed;
      u.uSize.value = small ? p.size * 0.7 : p.size;
      u.uSizeContrast.value = p.sizeContrast;
      u.uSizeMax.value = p.sizeMax;
      u.uOpacity.value = p.opacity;
      u.uColor.value.set(p.r, p.g, p.b);
      u.uBreathSpeed.value = p.breathSpeed;
      u.uBreathAmt.value = p.breathAmt;
      u.uDrift.value = p.drift;
      // Reactivity per-axis toggles — default enabled (treat missing flag as true)
      u.uReactSpeed.value = (p.enableReactSpeed ?? true) ? (p.reactSpeed ?? 1.0) : 0;
      u.uReactTurb.value = (p.enableReactTurb ?? true) ? (p.reactTurb ?? 1.5) : 0;
      u.uReactSize.value = (p.enableReactSize ?? true) ? (p.reactSize ?? 0.1) : 0;
      u.uReactBass.value = (p.enableReactBass ?? true) ? (p.reactBass ?? 0.3) : 0;
      u.uReactRadius.value = (p.enableReactRadius ?? true) ? (p.reactRadius ?? 0.0) : 0;
      u.uReactScale.value = (p.enableReactScale ?? true) ? (p.reactScale ?? 0.0) : 0;
      u.uParticleBaseline.value = p.particleBaseline ?? 1.0;
      u.uReactCount.value = (p.enableReactCount ?? true) ? (p.reactCount ?? 0.0) : 0;
      // Hollow only applies in the idle (large) state so the shrunken orb
      // around the pause button remains dense.
      u.uHollow.value = small ? 0.0 : (p.hollow ?? 0.0);

      gl.render(scene, cam);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  const rebuild = useCallback((count) => {
    const { scene, mat, pts } = internals.current;
    if (!scene) return;
    scene.remove(pts);
    pts.geometry.dispose();
    const next = makeParticles(count, mat.uniforms);
    scene.add(next.pts);
    internals.current = { ...internals.current, pts: next.pts, mat: next.mat, geo: next.geo };
  }, []);

  return { rebuild };
}
