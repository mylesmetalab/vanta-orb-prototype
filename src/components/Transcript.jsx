import { useRef, useEffect, useMemo } from "react";

// Animated word: fades from opacity 0 + 4px blur to opacity 1 + 0px blur
// on first mount, then stays static. Stable key per (block, word) position
// prevents re-animation on each interim speech-recognition update.
function Word({ text, isDim }) {
  return (
    <span
      style={{
        display: "inline-block",
        animation: "wordIn 0.55s cubic-bezier(0.32, 0.72, 0, 1) both",
        color: isDim ? "#767676" : "#fff",
        transition: "color 0.6s ease",
      }}
    >
      {text}
      {"\u00A0"}
    </span>
  );
}

export function Transcript({ blocks, isRecording }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isRecording) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [blocks, isRecording]);

  // Split each block into words lazily so per-word animation only runs once.
  const words = useMemo(
    () => blocks.map((b) => (b.t || "").trim().split(/\s+/)),
    [blocks]
  );

  return (
    <div
      ref={scrollRef}
      className="no-scroll"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 160,
        overflowY: "auto",
        // Reserve space so the very first word starts 24px under the top bar.
        // Top bar ends at ~118px (54 top padding + 48 button + 16 bottom padding).
        paddingTop: 118 + 24,
        paddingRight: 32,
        paddingBottom: 48,
        paddingLeft: 32,
        scrollBehavior: "smooth",
      }}
    >
      {blocks.length === 0 && isRecording && (
        <p
          style={{
            fontFamily: "var(--display)",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -0.48,
            color: "rgba(255,255,255,0.25)",
            animation: "blink 2.5s ease-in-out infinite",
          }}
        >
          Listening…
        </p>
      )}
      {blocks.map((b, i) => {
        const isCurrent = i === blocks.length - 1;
        return (
          <p
            key={i}
            style={{
              fontFamily: "var(--display)",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -0.48,
              marginBottom: 32,
            }}
          >
            {words[i].map((w, j) => (
              <Word key={`${i}-${j}`} text={w} isDim={!isCurrent} />
            ))}
          </p>
        );
      })}
    </div>
  );
}
