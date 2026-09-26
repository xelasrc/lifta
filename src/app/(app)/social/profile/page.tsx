"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile, updateMyDisplayName } from "@/lib/db/social";
import type { Profile } from "@/lib/db/types";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { XIcon } from "@/components/icons/x-icon";

export default function SocialProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

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
    getMyProfile().then((p) => setProfile(p ?? null));
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
  }, []);

  function startEditing() {
    if (!profile) return;
    setNameDraft(profile.displayName ?? "");
    setEditing(true);
  }

  async function handleSave() {
    const name = nameDraft.trim();
    if (!name || !profile) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await updateMyDisplayName(name);
    setProfile({ ...profile, displayName: name });
    setSaving(false);
    setEditing(false);
  }

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

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3">
        <Link href="/social" aria-label="Back to social" className="text-2xl font-bold text-white">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
          {(profile?.displayName?.[0] ?? profile?.email?.[0] ?? "?").toUpperCase()}
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              autoFocus
              className="border-b border-white/20 bg-transparent pb-1 text-center font-semibold text-white outline-none"
            />
          ) : (
            <p className="font-semibold text-white">{profile?.displayName ?? profile?.email ?? "…"}</p>
          )}
          <button
            type="button"
            onClick={editing ? handleSave : startEditing}
            disabled={saving}
            aria-label={editing ? "Save username" : "Edit username"}
            className={editing ? "text-accent disabled:opacity-60" : "text-muted hover:text-white"}
          >
            {editing ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
          </button>
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
    </div>
  );
}
