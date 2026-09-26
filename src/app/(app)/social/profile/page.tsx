"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SocialProfilePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setEmail(session?.user.email ?? null));
  }, []);

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
          {(email?.[0] ?? "?").toUpperCase()}
        </div>
        <p className="font-semibold text-white">{email ?? "…"}</p>
      </div>
    </div>
  );
}
