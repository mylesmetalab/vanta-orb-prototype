import { MicIcon, PauseIcon, PlusIcon, CheckIcon } from "./Icons";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function BottomBar({ state, elapsed, onRecord, onPause, onResume }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 44,
        paddingTop: 44,
      }}
    >
      {/* iOS-style progressive blur — only in idle/paused. When recording,
          the orb sits over clean black (matching Figma). */}
      {state !== "recording" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 140,
              background:
                "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              maskImage:
                "linear-gradient(0deg, black 0%, black 40%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(0deg, black 0%, black 40%, transparent 100%)",
            }}
          />
        </div>
      )}

      {state === "idle" && (
        <button
          onClick={onRecord}
          style={{
            position: "relative",
            width: 80,
            height: 80,
            borderRadius: 99,
            background: "#fff",
            border: "0.5px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: "pulse 3s ease-in-out infinite",
          }}
        >
          <MicIcon c="#000" />
        </button>
      )}

      {state === "recording" && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
            padding: "0 24px",
            zIndex: 10,
          }}
        >
          <span
            style={{
              color: "#d6d6d6",
              fontSize: 14,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "var(--ui)",
            }}
          >
            {fmt(elapsed)}
          </span>
          <button
            onClick={onPause}
            style={{
              width: 80,
              height: 80,
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <PauseIcon />
          </button>
          <span
            style={{
              color: "#767676",
              fontSize: 14,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "var(--ui)",
            }}
          >
            10:00
          </span>
        </div>
      )}

      {state === "paused" && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          <button
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#434343",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <PlusIcon />
          </button>
          <button
            onClick={onResume}
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              background: "#434343",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <MicIcon c="#fff" />
          </button>
          <button
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <CheckIcon />
          </button>
        </div>
      )}
    </div>
  );
}
