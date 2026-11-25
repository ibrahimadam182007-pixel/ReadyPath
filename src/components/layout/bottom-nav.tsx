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
      aria-label="Primary Navigation"
      className="sticky bottom-0 z-20 bg-rp-surface rounded-t-[16px] border-t border-rp-border/70 px-3 py-2"
    >
      <ul className="grid grid-cols-3 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-[12px] px-2 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-rp-tag text-rp-primary font-semibold"
                    : "text-rp-text-muted hover:text-rp-text"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
