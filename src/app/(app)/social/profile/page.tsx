"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProfile, updateMyDisplayName } from "@/lib/db/social";
import type { Profile } from "@/lib/db/types";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";

export default function SocialProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => setProfile(p ?? null));
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

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
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

        <p className="text-sm text-muted">{profile?.email ?? "…"}</p>
      </div>
    </div>
  );
}
