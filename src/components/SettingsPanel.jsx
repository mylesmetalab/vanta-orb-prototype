import DEFAULTS from "../config/orbDefaults.json";
import { PRESETS } from "../config/presets";
import { SLIDERS } from "../config/sliderDefs";
import { saveParams, loadParams, clearParams } from "../config/persist";

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={on ? "Enabled" : "Disabled"}
      style={{
        width: 28,
        height: 16,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: on ? "#fff" : "#222",
        position: "relative",
        flexShrink: 0,
        marginRight: 8,
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: on ? "#000" : "#555",
          position: "absolute",
          top: 2,
          left: on ? 14 : 2,
          transition: "left 0.15s, background 0.15s",
        }}
      />
    </button>
  );
}

export function SettingsPanel({ params, setParams, rebuild, open, onClose, variant = "absolute" }) {
  const handleSave = () => {
    const ok = saveParams(params);
    if (ok) console.log("[SettingsPanel] saved to localStorage");
  };
  const handleLoad = () => {
    const loaded = loadParams();
    if (loaded) {
      setParams(loaded);
      if (loaded.particleCount && rebuild) rebuild(loaded.particleCount);
      console.log("[SettingsPanel] loaded from localStorage");
    } else {
      console.log("[SettingsPanel] nothing saved yet");
    }
  };
  const handleClear = () => {
    clearParams();
    console.log("[SettingsPanel] cleared localStorage");
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: variant === "fixed" ? "fixed" : "absolute",
            inset: 0,
            zIndex: 190,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      )}
      <div
        style={{
          position: variant === "fixed" ? "fixed" : "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          maxWidth: "92%",
          background: "rgba(6,6,6,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
          zIndex: 210,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "20px 16px 40px",
          fontFamily: "'articulat-cf', system-ui, -apple-system, sans-serif",
          letterSpacing: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "var(--ui)" }}>Orb Settings</span>
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

        {/* Save/Load/Reset row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "8px 0",
              background: "rgba(80,255,80,0.1)",
              border: "1px solid rgba(80,255,80,0.25)",
              borderRadius: 8,
              color: "#8f8",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={handleLoad}
            style={{
              flex: 1,
              padding: "8px 0",
              background: "rgba(100,150,255,0.1)",
              border: "1px solid rgba(100,150,255,0.25)",
              borderRadius: 8,
              color: "#9bf",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Load
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: "8px 0",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              color: "#666",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
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
            Reset defaults
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
          <Toggle
            on={!!params.simAudio}
            onClick={() => setParams((q) => ({ ...q, simAudio: !q.simAudio }))}
          />
        </div>

        {SLIDERS.map(({ k, label, min, max, step, rb, toggle }) => {
          const on = toggle ? params[toggle] !== false : true;
          return (
            <div key={k} style={{ marginBottom: 12, opacity: on ? 1 : 0.4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  {toggle && (
                    <Toggle
                      on={on}
                      onClick={() => setParams((q) => ({ ...q, [toggle]: !on }))}
                    />
                  )}
                  <span style={{ color: "#777", fontSize: 10 }}>{label}</span>
                </div>
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
                disabled={!on}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setParams((q) => ({ ...q, [k]: v }));
                  if (rb) rebuild(v);
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
