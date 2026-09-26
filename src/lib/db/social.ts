import { createClient } from "@/lib/supabase/client";
import { mapFriendship, mapProfile, mapWorkout } from "./mappers";
import type { Friendship, Profile, Workout } from "./types";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

export async function findProfileByEmail(email: string): Promise<Profile | undefined> {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();
  return data ? mapProfile(data) : undefined;
}

export async function getProfilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return new Map((data ?? []).map(mapProfile).map((p) => [p.id, p]));
}

export async function getMyProfile(): Promise<Profile | undefined> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ? mapProfile(data) : undefined;
}

// Not unique -- just a display name shown wherever an email would otherwise
// be, defaulted to the email prefix at signup.
export async function updateMyDisplayName(displayName: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  if (error) throw error;
}

export type FriendshipsOverview = {
  accepted: { friendship: Friendship; profile: Profile }[];
  incoming: { friendship: Friendship; profile: Profile }[];
  outgoing: { friendship: Friendship; profile: Profile }[];
};

export async function listFriendships(): Promise<FriendshipsOverview> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
  const friendships = (data ?? []).map(mapFriendship);

  const otherPartyId = (f: Friendship) => (f.requesterId === user.id ? f.addresseeId : f.requesterId);
  const profiles = await getProfilesByIds(Array.from(new Set(friendships.map(otherPartyId))));

  const overview: FriendshipsOverview = { accepted: [], incoming: [], outgoing: [] };
  for (const friendship of friendships) {
    const profile = profiles.get(otherPartyId(friendship));
    if (!profile) continue;
    if (friendship.status === "accepted") {
      overview.accepted.push({ friendship, profile });
    } else if (friendship.addresseeId === user.id) {
      overview.incoming.push({ friendship, profile });
    } else {
      overview.outgoing.push({ friendship, profile });
    }
  }
  return overview;
}

export async function sendFriendRequest(email: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const target = await findProfileByEmail(email);
  if (!target) throw new Error("No lifta user found with that email");
  if (target.id === user.id) throw new Error("You can't add yourself");

  const { data: existing } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`,
    )
    .maybeSingle();
  if (existing) throw new Error("A friend request already exists with this user");

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id: target.id, status: "pending" });
  if (error) throw error;
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw error;
}

// Also used to cancel an outgoing request or decline an incoming one --
// either way it's just removing the (still-pending) row.
export async function removeFriendship(friendshipId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}

export async function listFriendCompletedWorkouts(friendUserId: string): Promise<Workout[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", friendUserId)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false });
  return (data ?? []).map(mapWorkout);
}
