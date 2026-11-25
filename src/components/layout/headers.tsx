import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

interface AuthHeaderProps {
  backHref: string;
  title: string;
  subtitle: string;
}

export function AuthHeader({ backHref, title, subtitle }: AuthHeaderProps) {
  return (
    <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-4 pb-6 rounded-b-[24px]">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={backHref}
          aria-label="Go back"
          className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <BrandLogo onDark size="sm" />
      </div>

      <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-1.5 text-[12.8px] leading-relaxed text-rp-primary-on-muted">
        {subtitle}
      </p>
    </header>
  );
}

interface FlowHeaderProps {
  backHref: string;
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}

export function FlowHeader({
  backHref,
  title,
  subtitle,
  rightSlot,
}: FlowHeaderProps) {
  return (
    <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-4 pb-6 rounded-b-[24px]">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={backHref}
          aria-label="Go back"
          className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-1.5 text-[12.8px] leading-relaxed text-rp-primary-on-muted">
        {subtitle}
      </p>
    </header>
  );
}

interface TabHeaderProps {
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}

export function TabHeader({ title, subtitle, rightSlot }: TabHeaderProps) {
  return (
    <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-6 pb-6 rounded-b-[24px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-[12.5px] text-rp-primary-on-muted">
            {subtitle}
          </p>
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
