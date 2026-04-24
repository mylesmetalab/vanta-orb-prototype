import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { makeParticles } from "../components/ParticleOrb";
import { useAudio } from "../hooks/useAudio";
import { fbm } from "../utils/noise";
import { TUNER_PRESETS } from "../config/presets";
import DEFAULTS from "../config/orbDefaults.json";

const TUNER_DEFAULTS = {
  ...DEFAULTS,
  simAudio: true,
  smallSizeScale: 0.7,
  smallAudioScale: 0.35,
};

const SLIDERS = [
  { k: "particleCount", label: "Particles", min: 500, max: 6000, step: 100, rb: true },
  { k: "size", label: "Overall Size", min: 0.3, max: 4, step: 0.1 },
  { k: "sizeContrast", label: "Size Contrast", min: 1, max: 15, step: 0.5 },
  { k: "sizeMax", label: "Largest Particle", min: 0.2, max: 3, step: 0.1 },
  { k: "baseSpeed", label: "Orbit Speed", min: 0.005, max: 0.15, step: 0.002 },
  { k: "drift", label: "Speed Drift", min: 0, max: 1.5, step: 0.05 },
  { k: "turbulence", label: "Turbulence", min: 0, max: 0.15, step: 0.002 },
  { k: "turbFreq", label: "Turb Frequency", min: 0.5, max: 5, step: 0.1 },
  { k: "turbSpeed", label: "Turb Speed", min: 0, max: 0.3, step: 0.005 },
  { k: "reactivity", label: "Voice Reactivity (master)", min: 0, max: 4, step: 0.1 },
  { k: "reactSpeed", label: "→ drives Speed", min: 0, max: 4, step: 0.1 },
  { k: "reactTurb", label: "→ drives Turbulence", min: 0, max: 4, step: 0.1 },
  { k: "reactSize", label: "→ drives Size", min: 0, max: 1, step: 0.02 },
  { k: "reactBass", label: "→ Bass boost", min: 0, max: 2, step: 0.05 },
  { k: "reactRadius", label: "→ Fly outward (radius)", min: 0, max: 2, step: 0.02 },
  { k: "reactScale", label: "→ Whole-orb pulse", min: 0, max: 0.6, step: 0.01 },
  { k: "hollow", label: "Hollow center (idle only)", min: 0, max: 1, step: 0.02 },
  { k: "smoothing", label: "Audio Smoothing", min: 0.8, max: 0.99, step: 0.005 },
  { k: "breathSpeed", label: "Breath Speed", min: 0, max: 0.8, step: 0.02 },
  { k: "breathAmt", label: "Breath Depth", min: 0, max: 0.05, step: 0.001 },
  { k: "opacity", label: "Opacity", min: 0.3, max: 1, step: 0.05 },
  { k: "smallSizeScale", label: "Small Size Scale", min: 0.2, max: 1.2, step: 0.05 },
  { k: "smallAudioScale", label: "Small Audio Scale", min: 0.0, max: 1.0, step: 0.05 },
  { k: "r", label: "Red", min: 0, max: 1, step: 0.01 },
  { k: "g", label: "Green", min: 0, max: 1, step: 0.01 },
  { k: "b", label: "Blue", min: 0, max: 1, step: 0.01 },
];

function Bar({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 4 }}>
        <div
          style={{
            width: 20,
            borderRadius: 3,
            height: Math.max(2, value * 60),
            background: color,
            transition: "height 0.05s",
          }}
        />
      </div>
      <div style={{ fontSize: 9, color: "#666", fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>{value.toFixed(2)}</div>
    </div>
  );
}

export default function Tuner() {
  const [params, setParams] = useState({ ...TUNER_DEFAULTS });
  const [panelOpen, setPanelOpen] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [audioLevels, setAudioLevels] = useState({ level: 0, bass: 0, treble: 0 });
  const [copyStatus, setCopyStatus] = useState("");
  const [jsonOpen, setJsonOpen] = useState(false);

  const paramsRef = useRef(params);
  const canvasRef = useRef(null);
  const canvasSmallRef = useRef(null);
  const internals = useRef({});
  const smallInternals = useRef({});

  const { start: startMic, stop: stopMic, data: audioData } = useAudio();

  useEffect(() => { paramsRef.current = params; }, [params]);

  useEffect(() => {
    document.body.classList.add("tuner-mode");
    return () => document.body.classList.remove("tuner-mode");
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    const cvsSmall = canvasSmallRef.current;
    if (!cvs || !cvsSmall) return;

    // Large orb
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 3.5;
    const gl = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setClearColor(0x000000, 0);
    const { geo, mat, pts } = makeParticles(paramsRef.current.particleCount);
    scene.add(pts);
    internals.current = { scene, cam, gl, pts, mat, geo };

    // Small orb
    const sceneS = new THREE.Scene();
    const camS = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camS.position.z = 3.5;
    const glS = new THREE.WebGLRenderer({ canvas: cvsSmall, antialias: true, alpha: true });
    glS.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    glS.setClearColor(0x000000, 0);
    const makeS = makeParticles(paramsRef.current.particleCount);
    sceneS.add(makeS.pts);
    smallInternals.current = { scene: sceneS, cam: camS, gl: glS, pts: makeS.pts, mat: makeS.mat, geo: makeS.geo };

    const clock = new THREE.Clock();
    let raf = 0, sA = 0, sB = 0, sT = 0;

    function resizeLarge() {
      const el = cvs.parentElement;
      if (!el) return;
      gl.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    }
    // Small preview renders at the SAME internal pixel resolution as the large
    // orb, then the browser scales the canvas down via CSS. This keeps the
    // visual density identical — it's "the same orb, just smaller on screen."
    function resizeSmall() {
      const largeEl = cvs.parentElement;
      if (!largeEl) return;
      glS.setSize(largeEl.clientWidth, largeEl.clientHeight, false);
      camS.aspect = 1;
      camS.updateProjectionMatrix();
    }
    resizeLarge();
    resizeSmall();
    const ro = new ResizeObserver(() => {
      resizeLarge();
      resizeSmall();
    });
    ro.observe(cvs.parentElement);

    function applyUniforms(m, p, time, level, bass, treble, sizeMul, isSmall) {
      const u = m.uniforms;
      u.uTime.value = time;
      u.uAudioLevel.value = level;
      u.uAudioBass.value = bass;
      u.uAudioTreble.value = treble;
      u.uBaseSpeed.value = p.baseSpeed;
      u.uReactivity.value = p.reactivity;
      u.uTurbulence.value = p.turbulence;
      u.uTurbFreq.value = p.turbFreq;
      u.uTurbSpeed.value = p.turbSpeed;
      u.uSize.value = p.size * sizeMul;
      u.uSizeContrast.value = p.sizeContrast;
      u.uSizeMax.value = p.sizeMax;
      u.uOpacity.value = p.opacity;
      u.uColor.value.set(p.r, p.g, p.b);
      u.uBreathSpeed.value = p.breathSpeed;
      u.uBreathAmt.value = p.breathAmt;
      u.uDrift.value = p.drift;
      u.uReactSpeed.value = p.reactSpeed ?? 1.0;
      u.uReactTurb.value = p.reactTurb ?? 1.5;
      u.uReactSize.value = p.reactSize ?? 0.1;
      u.uReactBass.value = p.reactBass ?? 0.3;
      u.uReactRadius.value = p.reactRadius ?? 0.0;
      u.uReactScale.value = p.reactScale ?? 0.0;
      u.uHollow.value = isSmall ? 0.0 : (p.hollow ?? 0.0);
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      const p = paramsRef.current;
      const a = audioData.current;
      const sm = p.smoothing;

      let level = a.level, bass = a.bass, treble = a.treble;
      if (p.simAudio && level < 0.01) {
        level = fbm(t * 0.7) * 0.35;
        bass = fbm(t * 0.5 + 100) * 0.3;
        treble = fbm(t * 0.9 + 200) * 0.25;
      }

      sA = sA * sm + level * (1 - sm);
      sB = sB * sm + bass * (1 - sm);
      sT = sT * sm + treble * (1 - sm);

      if (Math.floor(t * 10) % 2 === 0) {
        setAudioLevels({ level: sA, bass: sB, treble: sT });
      }

      // Small-orb response multipliers (tuning knobs)
      const smallAudioMul = p.smallAudioScale ?? 0.35;
      const smallSizeMul = p.smallSizeScale ?? 0.7;

      applyUniforms(internals.current.mat, p, t, sA, sB, sT, 1.0, false);
      applyUniforms(
        smallInternals.current.mat,
        p,
        t,
        sA * smallAudioMul,
        sB * smallAudioMul,
        sT * smallAudioMul,
        smallSizeMul,
        true
      );

      gl.render(scene, cam);
      glS.render(sceneS, camS);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.dispose();
      glS.dispose();
      geo.dispose();
      mat.dispose();
      makeS.geo.dispose();
      makeS.mat.dispose();
    };
  }, []);

  const rebuild = useCallback((count) => {
    const rebuildOne = (ref) => {
      const { scene, mat, pts } = ref.current;
      if (!scene) return;
      scene.remove(pts);
      pts.geometry.dispose();
      const next = makeParticles(count, mat.uniforms);
      scene.add(next.pts);
      ref.current.pts = next.pts;
      ref.current.mat = next.mat;
      ref.current.geo = next.geo;
    };
    rebuildOne(internals);
    rebuildOne(smallInternals);
  }, []);

  const toggleMic = async () => {
    console.log("[Tuner] toggleMic clicked, micActive:", micActive);
    if (micActive) {
      console.log("[Tuner] stopping mic");
      stopMic();
      setMicActive(false);
      setParams((p) => ({ ...p, simAudio: true }));
    } else {
      console.log("[Tuner] starting mic...");
      try {
        await startMic();
        console.log("[Tuner] startMic() resolved OK");
        setMicActive(true);
        setParams((p) => ({ ...p, simAudio: false }));
      } catch (e) {
        console.error("[Tuner] Mic failed:", e.name, e.message, e);
        alert(
          "Mic failed: " +
            e.name +
            " — " +
            e.message +
            "\n\nIf you're running this inside Claude's preview iframe, open http://localhost:5173/tuner directly in Chrome to grant mic access."
        );
      }
    }
  };

  const copyParams = async () => {
    const exportable = { ...params };
    delete exportable.simAudio;
    const json = JSON.stringify(exportable, null, 2);
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(json);
        copied = true;
      }
    } catch (e) {}
    if (!copied) {
      const ta = document.createElement("textarea");
      ta.value = json;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        copied = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
    }
    if (copied) {
      setCopyStatus("Copied!");
    } else {
      console.log("Vanta orb params:\n" + json);
      setCopyStatus("Copy failed — see console");
    }
    setTimeout(() => setCopyStatus(""), 2000);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        overflow: "hidden",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Orb area */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "min(70vw, 70vh)", height: "min(70vw, 70vh)", maxWidth: 620, maxHeight: 620, position: "relative" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontSize: 10,
              letterSpacing: 1,
              color: "#555",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            Idle — full size
          </div>
        </div>

        {/* Small preview — matches the shrunken orb next to the pause button */}
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            width: 180,
            height: 180,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          <canvas ref={canvasSmallRef} style={{ width: "100%", height: "100%", display: "block" }} />
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 8,
              fontSize: 9,
              letterSpacing: 1,
              color: "#555",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            Talking — small
          </div>
        </div>

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#888",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 12,
            zIndex: 10,
          }}
        >
          {panelOpen ? "Hide Controls" : "Show Controls"}
        </button>

        <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: micActive ? "#4f4" : params.simAudio ? "#fa0" : "#666",
            }}
          />
          <span style={{ color: "#666", fontSize: 11 }}>
            {micActive ? "Live Microphone" : params.simAudio ? "Simulated Audio" : "Silent"}
          </span>
        </div>
      </div>

      {/* Controls panel */}
      <div
        className="panel"
        style={{
          width: panelOpen ? 280 : 0,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          borderLeft: panelOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          background: "rgba(4,4,4,0.95)",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 280, padding: "20px 16px", overflowY: "auto", height: "100vh" }}>
          <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: -0.3 }}>
            Orb Tuner
          </h2>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 8px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <Bar value={audioLevels.level} label="LEVEL" color="#fff" />
              <Bar value={audioLevels.bass} label="BASS" color="#88f" />
              <Bar value={audioLevels.treble} label="TREBLE" color="#f88" />
            </div>
          </div>

          <button
            onClick={toggleMic}
            style={{
              width: "100%",
              padding: "10px 0",
              marginBottom: 12,
              background: micActive ? "rgba(80,255,80,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${micActive ? "rgba(80,255,80,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8,
              color: micActive ? "#6f6" : "#aaa",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {micActive ? "● Mic Active — Click to Stop" : "Connect Microphone"}
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "8px 0" }}>
            <span style={{ color: "#888", fontSize: 11 }}>Simulated Audio</span>
            <button
              onClick={() => setParams((p) => ({ ...p, simAudio: !p.simAudio }))}
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: params.simAudio ? "#fff" : "#333",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: params.simAudio ? "#000" : "#666",
                  position: "absolute",
                  top: 2,
                  left: params.simAudio ? 18 : 2,
                  transition: "all 0.2s",
                }}
              />
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {Object.keys(TUNER_PRESETS).map((n) => (
              <button
                key={n}
                onClick={() => setParams((p) => ({ ...p, ...TUNER_PRESETS[n] }))}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 999,
                  color: "#aaa",
                  fontSize: 10,
                  padding: "4px 12px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setParams({ ...TUNER_DEFAULTS })}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 999,
                color: "#555",
                fontSize: 10,
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          {SLIDERS.map(({ k, label, min, max, step, rb }) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "#777", fontSize: 10 }}>{label}</span>
                <span style={{ color: "#444", fontSize: 10, fontFamily: "monospace" }}>
                  {Number.isInteger(params[k]) ? params[k] : params[k]?.toFixed?.(3)}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={params[k]}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setParams((p) => ({ ...p, [k]: v }));
                  if (rb) rebuild(v);
                }}
              />
            </div>
          ))}

          <button
            onClick={copyParams}
            style={{
              width: "100%",
              padding: "10px 0",
              marginTop: 8,
              background: copyStatus
                ? "rgba(80,255,80,0.15)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${copyStatus ? "rgba(80,255,80,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8,
              color: copyStatus ? "#6f6" : "#aaa",
              cursor: "pointer",
              fontSize: 11,
              transition: "all 0.2s",
            }}
          >
            {copyStatus || "Copy Parameters as JSON"}
          </button>

          <button
            onClick={() => setJsonOpen((v) => !v)}
            style={{
              width: "100%",
              padding: "8px 0",
              marginTop: 6,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              color: "#666",
              cursor: "pointer",
              fontSize: 10,
            }}
          >
            {jsonOpen ? "Hide JSON" : "Show JSON"}
          </button>

          {jsonOpen && (() => {
            const exportable = { ...params };
            delete exportable.simAudio;
            const json = JSON.stringify(exportable, null, 2);
            return (
              <textarea
                readOnly
                value={json}
                onFocus={(e) => e.target.select()}
                style={{
                  width: "100%",
                  marginTop: 6,
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#aaa",
                  fontSize: 10,
                  fontFamily: "monospace",
                  padding: 8,
                  minHeight: 240,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
