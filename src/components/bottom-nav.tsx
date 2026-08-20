"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarbellIcon } from "./barbell-icon";
import { ClockIcon } from "./icons/clock-icon";
import { ChartIcon } from "./icons/chart-icon";
import { PersonIcon } from "./icons/person-icon";

const tabs = [
  { href: "/", label: "Workout", Icon: BarbellIcon },
  { href: "/history", label: "History", Icon: ClockIcon },
  { href: "/stats", label: "Stats", Icon: ChartIcon },
  { href: "/profile", label: "Profile", Icon: PersonIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex max-w-sm items-center rounded-full bg-surface p-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-1 items-center justify-center rounded-full py-3 text-white transition-colors ${
                active ? "bg-accent" : "bg-transparent"
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
