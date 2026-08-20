import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="font-semibold text-white">{user?.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
