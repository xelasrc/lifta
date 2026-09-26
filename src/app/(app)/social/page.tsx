"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  acceptFriendRequest,
  listFriendships,
  removeFriendship,
  sendFriendRequest,
  type FriendshipsOverview,
} from "@/lib/db/social";
import { TrashIcon } from "@/components/icons/trash-icon";
import { CheckIcon } from "@/components/icons/check-icon";

const EMPTY_OVERVIEW: FriendshipsOverview = { accepted: [], incoming: [], outgoing: [] };

export default function SocialPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [overview, setOverview] = useState<FriendshipsOverview>(EMPTY_OVERVIEW);
  const [loaded, setLoaded] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  function refresh() {
    listFriendships()
      .then(setOverview)
      .finally(() => setLoaded(true));
  }

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
    refresh();
  }, []);

  async function handleAddFriend(event: React.FormEvent) {
    event.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await sendFriendRequest(addEmail.trim());
      setAddEmail("");
      refresh();
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Couldn't send that request");
    } finally {
      setAdding(false);
    }
  }

  async function handleAccept(friendshipId: string) {
    await acceptFriendRequest(friendshipId);
    refresh();
  }

  async function handleRemove(friendshipId: string) {
    await removeFriendship(friendshipId);
    refresh();
  }

  async function handleRemoveFriend(friendshipId: string, name: string) {
    if (!window.confirm(`Remove ${name} as a friend?`)) return;
    await removeFriendship(friendshipId);
    refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">Social</h1>

      <Link href="/social/profile" className="flex items-center justify-between rounded-2xl bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
            {(email?.[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-semibold text-white">{email ?? "…"}</p>
          </div>
        </div>
        <span className="text-accent">&rsaquo;</span>
      </Link>

      <form onSubmit={handleAddFriend} className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted">Add a friend</p>
        <div className="flex items-center gap-2">
          <input
            value={addEmail}
            onChange={(event) => setAddEmail(event.target.value)}
            type="email"
            placeholder="Friend's email"
            className="flex-1 rounded-full bg-[#232323] px-5 py-4 text-white placeholder-muted outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={adding || !addEmail.trim()}
            className="rounded-full bg-accent-gradient px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {addError && <p className="text-sm text-accent">{addError}</p>}
      </form>

      {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

      {loaded && overview.incoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-muted">Friend requests</p>
          {overview.incoming.map(({ friendship, profile }) => (
            <div
              key={friendship.id}
              className="flex items-center justify-between rounded-full bg-[#232323] px-5 py-4"
            >
              <span className="text-white">{profile.displayName ?? profile.email}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAccept(friendship.id)}
                  aria-label="Accept friend request"
                  className="text-accent"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(friendship.id)}
                  aria-label="Decline friend request"
                  className="text-muted hover:text-accent"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loaded && overview.outgoing.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-muted">Pending</p>
          {overview.outgoing.map(({ friendship, profile }) => (
            <div
              key={friendship.id}
              className="flex items-center justify-between rounded-full bg-[#232323] px-5 py-4"
            >
              <span className="text-white">{profile.displayName ?? profile.email}</span>
              <button
                type="button"
                onClick={() => handleRemove(friendship.id)}
                aria-label="Cancel friend request"
                className="text-muted hover:text-accent"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Friends</p>
        {loaded && overview.accepted.length === 0 && (
          <div className="rounded-2xl bg-surface p-5 text-center">
            <p className="text-sm text-muted">No friends yet. Add someone above to see their workouts here.</p>
          </div>
        )}
        {overview.accepted.map(({ friendship, profile }) => (
          <div
            key={friendship.id}
            className="flex items-center justify-between gap-3 rounded-full bg-[#232323] px-5 py-4"
          >
            <Link href={`/social/friend/${profile.id}`} className="flex flex-1 items-center justify-between">
              <span className="text-white">{profile.displayName ?? profile.email}</span>
              <span className="text-accent">&rsaquo;</span>
            </Link>
            <button
              type="button"
              onClick={() => handleRemoveFriend(friendship.id, profile.displayName ?? profile.email)}
              aria-label={`Remove ${profile.displayName ?? profile.email}`}
              className="text-muted hover:text-accent"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
