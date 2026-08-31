"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DEFAULT_SETTINGS, getSettings, updateSettings } from "@/lib/settings";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { Stepper } from "@/components/stepper";
import { ToggleSwitch } from "@/components/toggle-switch";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [defaultWeightKg, setDefaultWeightKg] = useState(DEFAULT_SETTINGS.defaultWeightKg);
  const [defaultReps, setDefaultReps] = useState(DEFAULT_SETTINGS.defaultReps);
  const [partialRepsEnabled, setPartialRepsEnabled] = useState(DEFAULT_SETTINGS.partialRepsEnabled);
  const [editingDefaults, setEditingDefaults] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));

    // localStorage isn't available during SSR, so the real settings must be
    // read here (post-mount) rather than in a lazy useState initializer --
    // otherwise the server-rendered defaults mismatch the client's actual
    // stored values and React throws a hydration error.
    const settings = getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, not derivable at render time
    setDefaultWeightKg(settings.defaultWeightKg);
    setDefaultReps(settings.defaultReps);
    setPartialRepsEnabled(settings.partialRepsEnabled);
  }, []);

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

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="font-semibold text-white">{email ?? "…"}</p>
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

      <SignOutButton />
    </div>
  );
}
