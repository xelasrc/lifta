"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DEFAULT_SETTINGS, getSettings, updateSettings, type Theme } from "@/lib/settings";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { Stepper } from "@/components/stepper";
import { ToggleSwitch } from "@/components/toggle-switch";

export default function SettingsPage() {
  const [defaultWeightKg, setDefaultWeightKg] = useState(DEFAULT_SETTINGS.defaultWeightKg);
  const [defaultReps, setDefaultReps] = useState(DEFAULT_SETTINGS.defaultReps);
  const [partialRepsEnabled, setPartialRepsEnabled] = useState(DEFAULT_SETTINGS.partialRepsEnabled);
  const [weightStepKg, setWeightStepKg] = useState(DEFAULT_SETTINGS.weightStepKg);
  const [repsStep, setRepsStep] = useState(DEFAULT_SETTINGS.repsStep);
  const [editingDefaults, setEditingDefaults] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_SETTINGS.theme);

  useEffect(() => {
    // localStorage isn't available during SSR, so the real settings must be
    // read here (post-mount) rather than in a lazy useState initializer --
    // otherwise the server-rendered defaults mismatch the client's actual
    // stored values and React throws a hydration error.
    const settings = getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, not derivable at render time
    setDefaultWeightKg(settings.defaultWeightKg);
    setDefaultReps(settings.defaultReps);
    setPartialRepsEnabled(settings.partialRepsEnabled);
    setWeightStepKg(settings.weightStepKg);
    setRepsStep(settings.repsStep);
    setTheme(settings.theme);
  }, []);

  function handleThemeChange(light: boolean) {
    const next: Theme = light ? "light" : "dark";
    setTheme(next);
    updateSettings({ theme: next });
  }

  function handleWeightChange(value: number) {
    setDefaultWeightKg(value);
    updateSettings({ defaultWeightKg: value });
  }

  function handleRepsChange(value: number) {
    setDefaultReps(value);
    updateSettings({ defaultReps: value });
  }

  function handlePartialRepsEnabledChange(value: boolean) {
    setPartialRepsEnabled(value);
    updateSettings({ partialRepsEnabled: value });
  }

  function handleWeightStepChange(value: number) {
    setWeightStepKg(value);
    updateSettings({ weightStepKg: value });
  }

  function handleRepsStepChange(value: number) {
    setRepsStep(value);
    updateSettings({ repsStep: value });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Back to home" className="text-2xl font-bold text-heading">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-heading">Settings</h1>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-surface p-5">
        <p className="text-sm font-semibold text-white">Light mode</p>
        <ToggleSwitch checked={theme === "light"} onChange={handleThemeChange} label="Light mode" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Exercise Logging Options</p>
            <p className="text-xs text-muted">Defaults for new sets</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingDefaults((prev) => !prev)}
            aria-label={editingDefaults ? "Save exercise logging options" : "Edit exercise logging options"}
            className={editingDefaults ? "text-accent" : "text-muted hover:text-white"}
          >
            {editingDefaults ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
          </button>
        </div>

        {editingDefaults ? (
          <div className="flex flex-col gap-3">
            <Stepper
              label="Weight"
              value={defaultWeightKg}
              onChange={handleWeightChange}
              min={0}
              max={300}
              step={0.5}
              bigStep={5}
              suffix="kg"
            />
            <Stepper
              label="Reps"
              value={defaultReps}
              onChange={handleRepsChange}
              min={0}
              max={50}
              step={1}
              bigStep={5}
            />
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted">Weight</p>
              <p className="font-semibold text-white">{defaultWeightKg}kg</p>
            </div>
            <div>
              <p className="text-xs text-muted">Reps</p>
              <p className="font-semibold text-white">{defaultReps}</p>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-muted">Quick-adjust step (the +/- buttons while logging a set)</p>
          {editingDefaults ? (
            <div className="mt-3 flex flex-col gap-3">
              <Stepper
                label="Weight step"
                value={weightStepKg}
                onChange={handleWeightStepChange}
                min={0.5}
                max={50}
                step={0.5}
                suffix="kg"
              />
              <Stepper
                label="Reps step"
                value={repsStep}
                onChange={handleRepsStepChange}
                min={1}
                max={20}
                step={1}
              />
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-6">
              <div>
                <p className="text-xs text-muted">Weight</p>
                <p className="font-semibold text-white">±{weightStepKg}kg</p>
              </div>
              <div>
                <p className="text-xs text-muted">Reps</p>
                <p className="font-semibold text-white">±{repsStep}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-sm text-white">Partial rep recording</p>
          {editingDefaults ? (
            <ToggleSwitch
              checked={partialRepsEnabled}
              onChange={handlePartialRepsEnabledChange}
              label="Partial rep recording"
            />
          ) : (
            <p className="text-sm font-semibold text-muted">{partialRepsEnabled ? "On" : "Off"}</p>
          )}
        </div>
      </div>

      <Link href="/settings/exercises" className="flex items-center justify-between rounded-2xl bg-surface p-5">
        <p className="text-sm font-semibold text-white">My Exercises</p>
        <span className="text-accent">&rsaquo;</span>
      </Link>

      <SignOutButton />
    </div>
  );
}
