"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="font-semibold text-white">{email ?? "…"}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
