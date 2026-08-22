import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth/auth-form";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="h-14 w-14" />
          <h1 className="text-2xl font-bold text-white">Lifta</h1>
          <p className="text-sm text-muted">Track your lifts.</p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
