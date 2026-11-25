"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useReadyPath } from "@/components/providers/readypath-store";
import { cn } from "@/lib/utils";

interface DesktopNavbarProps {
  variant?: "public" | "app";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const APP_LINKS = [
  { href: "/explore", label: "Explore", match: (p: string) => p.startsWith("/explore") || p.startsWith("/opportunities") },
  { href: "/plans", label: "My Plans", match: (p: string) => p.startsWith("/plans") },
  { href: "/profile", label: "Profile", match: (p: string) => p.startsWith("/profile") },
] as const;

export function DesktopNavbar({ variant = "app" }: DesktopNavbarProps) {
  const pathname = usePathname();
  const { account, profile } = useReadyPath();
  const initials = getInitials(account.fullName || account.email || "ST");

  if (variant === "public") {
    return (
      <header className="hidden lg:flex h-[68px] w-full items-center justify-between rounded-[14px] bg-rp-surface border border-rp-border px-6 shadow-rp-flat">
        <div className="flex items-center gap-9">
          <Link href="/" className="hover:opacity-90 transition">
            <BrandLogo />
          </Link>
          <nav aria-label="Public Navigation" className="flex items-center gap-7">
            <Link
              href="/#how-it-works"
              className="text-[12.5px] font-semibold text-rp-text-muted hover:text-rp-primary transition"
            >
              How it works
            </Link>
            <Link
              href="/explore"
              className="text-[12.5px] font-semibold text-rp-text-muted hover:text-rp-primary transition"
            >
              Opportunities
            </Link>
            <Link
              href="/profile/setup"
              className="text-[12.5px] font-semibold text-rp-text-muted hover:text-rp-primary transition"
            >
              For students
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className={cn(
              "text-[12.5px] font-bold transition px-2 py-1.5 rounded-[8px]",
              pathname === "/login"
                ? "text-rp-primary underline underline-offset-4"
                : "text-rp-primary hover:bg-rp-bg/60"
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-[38px] items-center gap-2 rounded-[9px] bg-rp-primary px-4 text-[12.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover transition"
          >
            <span>Get started</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="hidden lg:flex h-[68px] w-full items-center justify-between rounded-[14px] bg-rp-surface border border-rp-border px-6 shadow-rp-flat">
      <div className="flex items-center gap-9">
        <Link href="/explore" className="hover:opacity-90 transition">
          <BrandLogo />
        </Link>
        <nav aria-label="Main Navigation" className="flex items-center gap-6">
          {APP_LINKS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] transition py-1.5 px-2.5 rounded-[8px]",
                  active
                    ? "font-extrabold text-rp-primary bg-rp-bg/70"
                    : "font-semibold text-rp-text-muted hover:text-rp-text hover:bg-rp-bg/40"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/explore"
          aria-label="Search opportunities"
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-rp-bg text-rp-primary hover:bg-rp-border/70 transition"
        >
          <Search className="h-4 w-4" strokeWidth={2} />
        </Link>
        <Link
          href="/profile/setup"
          className="inline-flex items-center rounded-full bg-rp-bg px-3 py-1.5 text-[11px] font-bold text-rp-primary hover:bg-rp-border/70 transition"
        >
          Sem {profile.currentSemester} · GPA {profile.cumulativeGpa.toFixed(2)}
        </Link>
        <Link
          href="/profile"
          aria-label={account.fullName || "Student Profile"}
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-rp-sage text-[11px] font-extrabold text-rp-primary hover:brightness-95 transition"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
