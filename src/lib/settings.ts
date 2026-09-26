const STORAGE_KEY = "lifta:settings";

export type Theme = "dark" | "light";

export type Settings = {
  defaultWeightKg: number;
  defaultReps: number;
  partialRepsEnabled: boolean;
  // The amount the quick +/- buttons jump by while logging a set.
  weightStepKg: number;
  repsStep: number;
  theme: Theme;
};

export const DEFAULT_SETTINGS: Settings = {
  defaultWeightKg: 20,
  defaultReps: 8,
  partialRepsEnabled: false,
  weightStepKg: 5,
  repsStep: 5,
  theme: "dark",
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
  if (updates.theme) applyTheme(updates.theme);
  return next;
}

// Flips the data-theme attribute immediately (so a toggle takes effect
// without a reload) -- the same read also happens as a blocking inline
// script in the document head, to set the initial attribute before first
// paint and avoid a flash of the wrong theme.
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}
