"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setCheckEmail(true);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setCheckEmail(false);
  }

  if (checkEmail) {
    return (
      <div className="rounded-2xl bg-surface px-5 py-6 text-center">
        <p className="font-semibold text-white">Check your email</p>
        <p className="mt-2 text-sm text-muted">
          We sent a confirmation link to <span className="text-white">{email}</span>. Confirm
          your address, then sign in.
        </p>
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className="mt-5 w-full rounded-full bg-accent py-3 font-semibold text-white"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex rounded-full bg-surface p-1">
        <button
          type="button"
          onClick={() => switchMode("sign-in")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            mode === "sign-in" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("sign-up")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            mode === "sign-up" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl bg-surface px-5 py-4 text-white placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          required
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={6}
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-2xl bg-surface px-5 py-4 text-white placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-accent py-4 font-bold text-white disabled:opacity-60"
        >
          {loading ? "..." : mode === "sign-in" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
