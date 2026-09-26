"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/workout/");

  return (
    <div
      // No bg-background here -- that would paint an opaque fill over body's
      // own background, hiding its gradient in light mode.
      className={`flex flex-1 flex-col ${hideNav ? "" : "pb-[calc(5.75rem+max(1rem,env(safe-area-inset-bottom)))]"}`}
    >
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
