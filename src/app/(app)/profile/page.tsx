"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSettings, updateSettings } from "@/lib/settings";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";

function StepButton({
  delta,
  onClick,
  label,
  big,
}: {
  delta: number;
  onClick: () => void;
  label: string;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 items-center justify-center rounded-full font-bold text-white ${
        big ? "w-11 bg-white/5 text-xs text-muted" : "w-8 bg-white/10 text-lg"
      }`}
    >
      {big ? (delta > 0 ? `+${delta}` : delta) : delta > 0 ? "+" : "−"}
    </button>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  bigStep,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  bigStep?: number;
  suffix?: string;
}) {
  function adjust(delta: number) {
    onChange(Math.min(max, Math.max(min, Math.round((value + delta) * 100) / 100)));
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-white">{label}</p>
      <div className="flex items-center gap-2">
        {bigStep && <StepButton delta={-bigStep} onClick={() => adjust(-bigStep)} label={`Decrease ${label} by ${bigStep}`} big />}
        <StepButton delta={-step} onClick={() => adjust(-step)} label={`Decrease ${label}`} />
        <p className="w-14 text-center font-semibold text-white">
          {value}
          {suffix}
        </p>
        <StepButton delta={step} onClick={() => adjust(step)} label={`Increase ${label}`} />
        {bigStep && <StepButton delta={bigStep} onClick={() => adjust(bigStep)} label={`Increase ${label} by ${bigStep}`} big />}
      </div>
    </div>
  );
}

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
