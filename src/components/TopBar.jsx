import { ClockIcon, XIcon } from "./Icons";

export function TopBar({ isRecording, onDiscard }) {
  const btnStyle = {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: isRecording ? "#434343" : "#000",
    border: isRecording ? "none" : "1px solid #434343",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.4s ease",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: "54px 16px 16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 0 -24px 0",
          background:
            "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button style={btnStyle}>
          <ClockIcon />
        </button>
        <span
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: -0.36,
            userSelect: "none",
          }}
        >
          Create a Thought
        </span>
        <button onClick={onDiscard} style={btnStyle}>
          <XIcon />
        </button>
      </div>
    </div>
  );
}
