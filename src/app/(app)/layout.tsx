"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/workout/");

  return (
    <div
      className={`flex flex-1 flex-col bg-background ${hideNav ? "" : "pb-[calc(5.75rem+max(1rem,env(safe-area-inset-bottom)))]"}`}
    >
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
