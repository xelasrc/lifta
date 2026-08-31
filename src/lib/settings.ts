const STORAGE_KEY = "lifta:settings";

export type Settings = {
  defaultWeightKg: number;
  defaultReps: number;
  partialRepsEnabled: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  defaultWeightKg: 20,
  defaultReps: 8,
  partialRepsEnabled: true,
};

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...updates };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
