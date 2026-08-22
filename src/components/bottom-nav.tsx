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
  const activeIndex = tabs.findIndex(({ href }) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href),
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      <div className="relative mx-auto flex max-w-md items-center overflow-hidden rounded-full bg-[#191919]">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-xl bg-accent transition-transform duration-300 ease-out"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
          }}
        />
        {tabs.map(({ href, label, Icon }, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative z-10 flex flex-1 items-center justify-center py-4.5 text-white"
            >
              <Icon className="h-10.5 w-10.5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
