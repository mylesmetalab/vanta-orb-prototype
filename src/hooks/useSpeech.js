import { useState, useRef, useCallback } from "react";

const LOG = (...args) => console.log("[useSpeech]", ...args);

export function useSpeech() {
  const ref = useRef(null);
  const active = useRef(false);
  const [blocks, setBlocks] = useState([]);
  const [live, setLive] = useState(false);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    LOG("start() called. SpeechRecognition available:", !!SR);
    if (!SR) {
      LOG("  Web Speech API not supported in this browser — falling back to sim.");
      return false;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onstart = () => {
      LOG("  onstart fired — live transcription is active");
      setLive(true);
    };
    r.onaudiostart = () => LOG("  onaudiostart");
    r.onsoundstart = () => LOG("  onsoundstart");
    r.onspeechstart = () => LOG("  onspeechstart");
    r.onresult = (e) => {
      let fin = "", int = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t;
        else int += t;
      }
      if (fin) LOG("  final:", JSON.stringify(fin));
      if (int) LOG("  interim:", JSON.stringify(int));
      setBlocks((p) => {
        const n = [...p];
        if (fin) {
          if (n.length > 0 && !n[n.length - 1].f)
            n[n.length - 1] = { t: fin.trim(), f: true };
          else n.push({ t: fin.trim(), f: true });
          if (int) n.push({ t: int.trim(), f: false });
        } else if (int) {
          if (n.length > 0 && !n[n.length - 1].f)
            n[n.length - 1] = { t: int.trim(), f: false };
          else n.push({ t: int.trim(), f: false });
        }
        return n;
      });
    };
    r.onerror = (e) => {
      LOG("  onerror:", e.error, e.message || "");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setLive(false);
      }
    };
    r.onend = () => {
      LOG("  onend fired. active:", active.current);
      if (active.current) {
        try { r.start(); } catch (err) { LOG("  restart failed:", err.message); }
      } else {
        setLive(false);
      }
    };
    active.current = true;
    try {
      r.start();
      LOG("  r.start() called");
    } catch (err) {
      LOG("  r.start() threw:", err.message);
      return false;
    }
    ref.current = r;
    setBlocks([]);
    return true;
  }, []);

  const stop = useCallback(() => {
    LOG("stop() called");
    active.current = false;
    if (ref.current) { ref.current.stop(); ref.current = null; }
    setLive(false);
  }, []);

  const reset = useCallback(() => setBlocks([]), []);

  return { start, stop, reset, blocks, live };
}
