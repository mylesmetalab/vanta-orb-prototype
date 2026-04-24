import { useState, useEffect, useRef, useMemo } from "react";
import DEFAULTS from "../config/orbDefaults.json";
import { useAudio } from "../hooks/useAudio";
import { useSpeech } from "../hooks/useSpeech";
import { useOrb } from "../hooks/useOrb";
import { TopBar } from "../components/TopBar";
import { BottomBar } from "../components/BottomBar";
import { Transcript } from "../components/Transcript";
import { SettingsPanel } from "../components/SettingsPanel";

const SIM_TEXT = [
  "Hey Vanta, here's a quick list of things I need to get done.",
  "Call Julia about the Henderson proposal. She said she'd have revisions back by Friday but I want to talk through the pricing tier stuff before she goes deep.",
  "Also rent the Zeiss lens a few days before the shoot, like 3 to 4 days before. I always forget this.",
  "Oh — the LLC annual report is due end of month, I think the 30th? Check that. If it's the 30th I have like a week.",
  "One more thing — the landing page copy, the hero line isn't landing. Maybe try builders instead of operators.",
];

export default function Prototype() {
  const [state, setState] = useState("idle");
  const [panel, setPanel] = useState(false);
  const [params, setParams] = useState({ ...DEFAULTS });
  const [elapsed, setElapsed] = useState(0);
  const [hasMic, setHasMic] = useState(false);
  const [simWords, setSimWords] = useState([]);

  const paramsRef = useRef(params);
  const pauseRef = useRef(true);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const smallRef = useRef(false);

  const { start: startAudio, stop: stopAudio, data: audioData } = useAudio();
  const { start: startSpeech, stop: stopSpeech, reset: resetSpeech, blocks, live: speechLive } = useSpeech();
  const { rebuild } = useOrb(canvasRef, paramsRef, audioData, pauseRef, smallRef);

  useEffect(() => { paramsRef.current = params; }, [params]);

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  useEffect(() => {
    if (state !== "recording" || hasMic) return;
    let wIdx = 0, pIdx = 0;
    const iv = setInterval(() => {
      if (pIdx >= SIM_TEXT.length) { clearInterval(iv); return; }
      const words = SIM_TEXT[pIdx].split(" ");
      if (wIdx < words.length) {
        setSimWords((prev) => {
          const n = [...prev];
          if (!n[pIdx]) n[pIdx] = { t: "", f: false };
          n[pIdx] = { t: words.slice(0, wIdx + 1).join(" "), f: wIdx === words.length - 1 };
          return n;
        });
        wIdx++;
      } else {
        wIdx = 0;
        pIdx++;
      }
    }, 180);
    return () => clearInterval(iv);
  }, [state, hasMic]);

  const doRecord = async () => {
    console.log("[Prototype] doRecord clicked");
    let audioOk = false;
    let speechOk = false;
    try {
      await startAudio();
      audioOk = true;
      console.log("[Prototype] audio started");
    } catch (e) {
      console.error("[Prototype] audio failed:", e.name, e.message);
    }
    if (audioOk) {
      speechOk = startSpeech();
      console.log("[Prototype] speech started:", speechOk);
    }
    setHasMic(audioOk && speechOk);
    console.log("[Prototype] hasMic set to:", audioOk && speechOk,
                "→ transcript mode:", audioOk && speechOk ? "LIVE" : "SIMULATED");
    pauseRef.current = false;
    smallRef.current = true;
    setState("recording");
    setSimWords([]);
  };

  const doPause = () => {
    pauseRef.current = true;
    stopSpeech();
    setState("paused");
  };

  const doResume = () => {
    pauseRef.current = false;
    if (hasMic) startSpeech();
    setState("recording");
  };

  const doDiscard = () => {
    pauseRef.current = true;
    smallRef.current = false;
    stopAudio();
    stopSpeech();
    resetSpeech();
    setElapsed(0);
    setState("idle");
    setSimWords([]);
  };

  const isIdle = state === "idle";
  const isRec = state === "recording";
  const isPaused = state === "paused";
  const transcript = hasMic
    ? blocks.filter((b) => b.t?.trim())
    : simWords.filter((b) => b.t?.trim());

  const isDesktop = typeof window !== "undefined" && window.innerWidth > 430;

  return (
    <div className="prototype-stage">
    <div
      style={{
        width: isDesktop ? 393 : "100%",
        maxWidth: 393,
        height: isDesktop ? 852 : "100dvh",
        maxHeight: 852,
        background: "#000",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--ui)",
        borderRadius: isDesktop ? 48 : 0,
        boxShadow: isDesktop
          ? "0 30px 80px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.15)"
          : "none",
      }}
    >
      {/* Orb — absolute, with both states anchored to `bottom` so the
          transition between center (idle) and bottom (recording) is smooth. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: isIdle ? "calc(50% - 143px)" : 24,
          width: isIdle ? 340 : 120,
          height: isIdle ? 340 : 120,
          transform: "translateX(-50%)",
          transition:
            "bottom 0.75s cubic-bezier(0.32,0.72,0,1), width 0.75s cubic-bezier(0.32,0.72,0,1), height 0.75s cubic-bezier(0.32,0.72,0,1), opacity 0.5s ease",
          zIndex: isIdle ? 2 : 6,
          pointerEvents: "none",
          opacity: isPaused ? 0.15 : 1,
          willChange: "bottom, width, height",
        }}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      <TopBar isRecording={isRec} onDiscard={doDiscard} />

      {(isRec || isPaused) && (
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 10,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              fontFamily: "var(--ui)",
              color: speechLive && hasMic ? "#6f6" : "#fa0",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: speechLive && hasMic ? "#4f4" : "#fa0",
              }}
            />
            {speechLive && hasMic ? "Live transcript" : "Simulated transcript"}
          </div>
        </div>
      )}

      {(isRec || isPaused) && (
        <Transcript blocks={transcript} isRecording={isRec} hasMic={hasMic} />
      )}

      {isIdle && (
        <p
          style={{
            position: "absolute",
            bottom: 152,
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#fff",
            fontSize: 16,
            fontWeight: 500,
            mixBlendMode: "difference",
            zIndex: 3,
          }}
        >
          Tap the button to get started
        </p>
      )}

      <BottomBar
        state={state}
        elapsed={elapsed}
        onRecord={doRecord}
        onPause={doPause}
        onResume={doResume}
      />

      {/* Settings trigger */}
      <button
        onClick={() => setPanel(true)}
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          width: 28,
          height: 28,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 12,
          opacity: 0.1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3" stroke="#fff" strokeWidth="1.5" />
          <path
            d="M8.5 1.5l-.3 1.8a6.5 6.5 0 00-2.3 1.3L4.2 3.8 2.8 6.2l1.5 1.1a6.5 6.5 0 000 2.6l-1.5 1.1 1.4 2.4 1.7-.8a6.5 6.5 0 002.3 1.3l.3 1.8h2.8l.3-1.8a6.5 6.5 0 002.3-1.3l1.7.8 1.4-2.4-1.5-1.1a6.5 6.5 0 000-2.6l1.5-1.1-1.4-2.4-1.7.8a6.5 6.5 0 00-2.3-1.3l-.3-1.8h-2.8z"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      <SettingsPanel
        params={params}
        setParams={setParams}
        rebuild={rebuild}
        open={panel}
        onClose={() => setPanel(false)}
      />
    </div>
    </div>
  );
}
