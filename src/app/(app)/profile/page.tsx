"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSettings, updateSettings } from "@/lib/settings";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { Stepper } from "@/components/stepper";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [defaultWeightKg, setDefaultWeightKg] = useState(() => getSettings().defaultWeightKg);
  const [defaultReps, setDefaultReps] = useState(() => getSettings().defaultReps);
  const [editingDefaults, setEditingDefaults] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
  }, []);

  function handleWeightChange(value: number) {
    setDefaultWeightKg(value);
    updateSettings({ defaultWeightKg: value });
  }

  function handleRepsChange(value: number) {
    setDefaultReps(value);
    updateSettings({ defaultReps: value });
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
          <p className="text-sm font-semibold text-muted">Defaults for new sets</p>
          <button
            type="button"
            onClick={() => setEditingDefaults((prev) => !prev)}
            aria-label={editingDefaults ? "Save defaults" : "Edit defaults"}
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
      </div>

      <SignOutButton />
    </div>
  );
}
