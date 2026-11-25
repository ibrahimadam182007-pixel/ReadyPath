import React from "react";
import Link from "next/link";
import { ChevronLeft, Compass } from "lucide-react";

interface AuthHeaderProps {
  backHref: string;
  title: string;
  subtitle: string;
}

export function AuthHeader({ backHref, title, subtitle }: AuthHeaderProps) {
  return (
    <header className="bg-rp-primary text-rp-primary-on px-4 pt-4 pb-6 rounded-b-[24px]">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={backHref}
          aria-label="Go back"
          className="inline-flex h-11 w-11 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white/15">
            <Compass className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-semibold text-white">
            ReadyPath
          </span>
        </div>
      </div>

      <h1 className="text-[22px] font-semibold leading-tight text-white">
        {title}
      </h1>
      <p className="mt-1 text-[13px] text-rp-primary-on-muted">{subtitle}</p>
    </header>
  );
}

interface FlowHeaderProps {
  backHref: string;
  title: string;
  subtitle: string;
}

export function FlowHeader({ backHref, title, subtitle }: FlowHeaderProps) {
  return (
    <header className="bg-rp-primary text-rp-primary-on px-4 pt-4 pb-6 rounded-b-[24px]">
      <div className="mb-3">
        <Link
          href={backHref}
          aria-label="Go back"
          className="inline-flex h-11 w-11 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
      </div>
      <h1 className="text-[22px] font-semibold leading-tight text-white">
        {title}
      </h1>
      <p className="mt-1 text-[13px] text-rp-primary-on-muted">{subtitle}</p>
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
    <header className="bg-rp-primary text-rp-primary-on px-4 pt-6 pb-6 rounded-b-[24px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-semibold leading-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-[12px] text-rp-primary-on-muted">{subtitle}</p>
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
