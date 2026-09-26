"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DEFAULT_SETTINGS, getSettings, updateSettings } from "@/lib/settings";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Stepper } from "@/components/stepper";
import { ToggleSwitch } from "@/components/toggle-switch";

export default function SettingsPage() {
  const [defaultWeightKg, setDefaultWeightKg] = useState(DEFAULT_SETTINGS.defaultWeightKg);
  const [defaultReps, setDefaultReps] = useState(DEFAULT_SETTINGS.defaultReps);
  const [partialRepsEnabled, setPartialRepsEnabled] = useState(DEFAULT_SETTINGS.partialRepsEnabled);
  const [editingDefaults, setEditingDefaults] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

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

    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
  }, []);

  function startEditingEmail() {
    setEmailDraft(email ?? "");
    setEmailMessage(null);
    setEditingEmail(true);
  }

  async function handleSaveEmail() {
    const next = emailDraft.trim();
    if (!next || next === email) {
      setEditingEmail(false);
      return;
    }
    setEmailSaving(true);
    setEmailMessage(null);
    const { error } = await createClient().auth.updateUser({ email: next });
    setEmailSaving(false);
    if (error) {
      setEmailMessage(error.message);
      return;
    }
    setEditingEmail(false);
    setEmailMessage(`Check ${next} to confirm the change.`);
  }

  function startEditingPassword() {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(null);
    setEditingPassword(true);
  }

  async function handleSavePassword() {
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords don't match");
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    const { error } = await createClient().auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordMessage(error.message);
      return;
    }
    setEditingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  }

  function handleCancelPassword() {
    setEditingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(null);
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

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Back to home" className="text-2xl font-bold text-white">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
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

      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
        <p className="text-sm font-semibold text-white">Account</p>

        <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Email</p>
            <button
              type="button"
              onClick={editingEmail ? handleSaveEmail : startEditingEmail}
              disabled={emailSaving}
              aria-label={editingEmail ? "Save email" : "Change email"}
              className={editingEmail ? "text-accent disabled:opacity-60" : "text-muted hover:text-white"}
            >
              {editingEmail ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
            </button>
          </div>
          {editingEmail ? (
            <input
              type="email"
              value={emailDraft}
              onChange={(event) => setEmailDraft(event.target.value)}
              autoFocus
              className="rounded-xl border border-white/20 bg-background px-3 py-2 text-white outline-none focus:ring-2 focus:ring-accent"
            />
          ) : (
            <p className="font-semibold text-white">{email ?? "…"}</p>
          )}
          {emailMessage && <p className="text-sm text-accent">{emailMessage}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Password</p>
            <div className="flex items-center gap-3">
              {editingPassword && (
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  disabled={passwordSaving}
                  aria-label="Cancel changing password"
                  className="text-muted hover:text-white disabled:opacity-60"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={editingPassword ? handleSavePassword : startEditingPassword}
                disabled={passwordSaving}
                aria-label={editingPassword ? "Save password" : "Reset password"}
                className={editingPassword ? "text-accent disabled:opacity-60" : "text-muted hover:text-white"}
              >
                {editingPassword ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {editingPassword ? (
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                autoFocus
                className="rounded-xl border border-white/20 bg-background px-3 py-2 text-white outline-none placeholder-muted focus:ring-2 focus:ring-accent"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="rounded-xl border border-white/20 bg-background px-3 py-2 text-white outline-none placeholder-muted focus:ring-2 focus:ring-accent"
              />
            </div>
          ) : (
            <p className="font-semibold text-white">••••••••</p>
          )}
          {passwordMessage && <p className="text-sm text-accent">{passwordMessage}</p>}
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
