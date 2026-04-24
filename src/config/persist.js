import DEFAULTS from "./orbDefaults.json";

const KEY = "vanta-orb-params-v1";

export function loadParams() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge over defaults so a stored preset missing newer keys still works.
    return { ...DEFAULTS, ...parsed };
  } catch (e) {
    console.warn("[persist] load failed:", e);
    return null;
  }
}

export function saveParams(params) {
  try {
    localStorage.setItem(KEY, JSON.stringify(params));
    return true;
  } catch (e) {
    console.warn("[persist] save failed:", e);
    return false;
  }
}

export function clearParams() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch (e) {
    return false;
  }
}
