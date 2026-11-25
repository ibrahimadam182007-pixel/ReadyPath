"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/plans", label: "My Plans", icon: Flag },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary Mobile Navigation"
      className="lg:hidden sticky bottom-0 z-20 bg-rp-surface border-t border-rp-border px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <ul className="grid grid-cols-3 gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/explore" && pathname.startsWith("/opportunities"));
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[12px] px-2 py-1.5 text-[10.5px] transition-colors",
                  isActive
                    ? "bg-rp-surface-met text-rp-primary font-bold"
                    : "text-rp-text-muted font-medium hover:text-rp-text"
                )}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
