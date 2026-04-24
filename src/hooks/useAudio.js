import { useRef, useCallback } from "react";

const LOG = (...args) => console.log("[useAudio]", ...args);

export function useAudio() {
  const refs = useRef({ ctx: null, stream: null, raf: 0 });
  const data = useRef({ level: 0, bass: 0, treble: 0 });

  const start = useCallback(async () => {
    LOG("start() called");
    LOG("  window.isSecureContext:", window.isSecureContext);
    LOG("  location.protocol:", window.location.protocol);
    LOG("  location.host:", window.location.host);
    LOG("  navigator.mediaDevices:", !!navigator.mediaDevices);
    LOG("  getUserMedia:", !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = "getUserMedia not available — need HTTPS or localhost (and not in a sandboxed iframe).";
      LOG("  ERROR:", msg);
      throw new Error(msg);
    }

    if (refs.current.ctx) try { refs.current.ctx.close(); } catch (e) {}
    if (refs.current.stream) refs.current.stream.getTracks().forEach(t => t.stop());

    LOG("  requesting mic permission...");
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      LOG("  mic granted. tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}`));
    } catch (err) {
      LOG("  getUserMedia FAILED:", err.name, err.message);
      throw err;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    LOG("  AudioContext state:", ctx.state, "sampleRate:", ctx.sampleRate);
    if (ctx.state === "suspended") {
      LOG("  resuming AudioContext...");
      await ctx.resume();
      LOG("  AudioContext resumed. state:", ctx.state);
    }
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.75;
    src.connect(an);

    refs.current = { ctx, stream, raf: 0, analyser: an };
    const buf = new Uint8Array(an.frequencyBinCount);
    let active = true;
    let frameCount = 0;

    function tick() {
      if (!active) return;
      refs.current.raf = requestAnimationFrame(tick);
      an.getByteFrequencyData(buf);
      const len = buf.length;
      let sum = 0;
      for (let i = 0; i < len; i++) sum += buf[i];
      const bassEnd = Math.floor(len * 0.12);
      let bSum = 0;
      for (let i = 0; i < bassEnd; i++) bSum += buf[i];
      const trebStart = Math.floor(len * 0.55);
      let tSum = 0;
      for (let i = trebStart; i < len; i++) tSum += buf[i];
      data.current = {
        level: sum / len / 255,
        bass: bSum / Math.max(bassEnd, 1) / 255,
        treble: tSum / Math.max(len - trebStart, 1) / 255,
      };
      frameCount++;
      if (frameCount % 120 === 0) {
        LOG("  frame", frameCount, "level:", data.current.level.toFixed(3),
            "bass:", data.current.bass.toFixed(3), "treble:", data.current.treble.toFixed(3));
      }
    }
    tick();
    refs.current._stopTick = () => { active = false; };
    LOG("  tick loop started");
    return true;
  }, []);

  const stop = useCallback(() => {
    LOG("stop() called");
    refs.current._stopTick?.();
    cancelAnimationFrame(refs.current.raf);
    if (refs.current.stream) refs.current.stream.getTracks().forEach(t => t.stop());
    try { refs.current.ctx?.close(); } catch (e) {}
    refs.current = { ctx: null, stream: null, raf: 0 };
    data.current = { level: 0, bass: 0, treble: 0 };
  }, []);

  return { start, stop, data };
}
