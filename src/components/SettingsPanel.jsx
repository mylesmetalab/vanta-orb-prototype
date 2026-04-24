import DEFAULTS from "../config/orbDefaults.json";
import { PRESETS } from "../config/presets";

const SLIDERS = [
  { k: "particleCount", l: "Particles", min: 500, max: 6000, step: 100, rb: true },
  { k: "size", l: "Overall Size", min: 0.3, max: 4, step: 0.1 },
  { k: "sizeContrast", l: "Size Contrast", min: 1, max: 15, step: 0.5 },
  { k: "sizeMax", l: "Largest Particle", min: 0.2, max: 3, step: 0.1 },
  { k: "baseSpeed", l: "Speed", min: 0.005, max: 0.15, step: 0.002 },
  { k: "drift", l: "Drift", min: 0, max: 1.5, step: 0.05 },
  { k: "turbulence", l: "Turbulence", min: 0, max: 0.15, step: 0.002 },
  { k: "reactivity", l: "Reactivity", min: 0, max: 4, step: 0.1 },
  { k: "smoothing", l: "Smoothing", min: 0.8, max: 0.99, step: 0.005 },
  { k: "breathSpeed", l: "Breath Speed", min: 0, max: 0.8, step: 0.02 },
  { k: "breathAmt", l: "Breath Depth", min: 0, max: 0.05, step: 0.001 },
  { k: "opacity", l: "Opacity", min: 0.3, max: 1, step: 0.05 },
];

export function SettingsPanel({ params, setParams, rebuild, open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 90,
            background: "rgba(0,0,0,0.5)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          maxWidth: "78%",
          background: "rgba(6,6,6,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
          zIndex: 100,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "56px 14px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--ui)",
            }}
          >
            Orb Settings
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              fontSize: 20,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 5,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {Object.keys(PRESETS).map((n) => (
            <button
              key={n}
              onClick={() => setParams((q) => ({ ...q, ...PRESETS[n] }))}
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
            onClick={() => setParams({ ...DEFAULTS })}
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            padding: "6px 0",
            borderTop: "1px solid #222",
            borderBottom: "1px solid #222",
          }}
        >
          <span style={{ color: "#777", fontSize: 10 }}>Sim Audio</span>
          <button
            onClick={() =>
              setParams((q) => ({ ...q, simAudio: !q.simAudio }))
            }
            style={{
              width: 34,
              height: 18,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: params.simAudio ? "#fff" : "#333",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: params.simAudio ? "#000" : "#666",
                position: "absolute",
                top: 2,
                left: params.simAudio ? 18 : 2,
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>

        {SLIDERS.map(({ k, l, min, max, step, rb }) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#777", fontSize: 10 }}>{l}</span>
              <span
                style={{ color: "#444", fontSize: 10, fontFamily: "monospace" }}
              >
                {Number.isInteger(params[k])
                  ? params[k]
                  : params[k]?.toFixed?.(3)}
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
                setParams((q) => ({ ...q, [k]: v }));
                if (rb) rebuild(v);
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
