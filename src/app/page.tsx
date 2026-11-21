import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Add your profile",
    description:
      "Enter your semester, cumulative GPA, certificates with expiry dates, and campus experience.",
  },
  {
    number: 2,
    title: "See your gaps",
    description:
      "Compare your details against official requirements to know exactly what is met or missing.",
  },
  {
    number: 3,
    title: "Plan the countdown",
    description:
      "Get a backward timeline from the deadline with H-30, H-14, and H-7 email reminders.",
  },
];

export default function WelcomePage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      {/* Dark Forest Green Brand Header */}
      <header className="relative overflow-hidden bg-rp-primary text-rp-primary-on px-5 pt-6 pb-8 rounded-b-[24px]">
        {/* Decorative dotted trajectory line ending in dusty-red dot */}
        <svg
          aria-hidden="true"
          viewBox="0 0 120 110"
          className="pointer-events-none absolute right-2 top-3 h-28 w-28 opacity-80"
          fill="none"
        >
          <path
            d="M12 96 C 36 86, 52 54, 78 44 C 92 38, 100 28, 104 18"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <circle cx="104" cy="18" r="5" fill="#C94A47" />
        </svg>

        {/* Logo + Wordmark */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white/15">
            <Compass className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            ReadyPath
          </span>
        </div>

        {/* Overline */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-rp-primary-on-muted mb-2">
          Universitas AMIKOM Yogyakarta
        </p>

        {/* Display Headline */}
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-white max-w-[290px]">
          Know what you miss and by when to act for campus opportunities
        </h1>

        {/* Supporting text */}
        <p className="mt-3 text-[13px] leading-[1.45] text-rp-primary-on-muted max-w-[310px]">
          Match your profile with scholarships, competitions, internships, and training—computed directly from official rules.
        </p>
      </header>

      {/* Sage Scrollable Content: How ReadyPath works */}
      <main className="flex-1 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-rp-text">
            How ReadyPath works
          </h2>
          <span className="inline-flex items-center rounded-[4px] border border-dashed border-rp-text-muted-bg px-1.5 py-0.5 text-[10px] font-medium text-rp-text-muted-bg">
            Prototype Data
          </span>
        </div>

        {/* 3-Step Vertical Stepper */}
        <div className="relative space-y-3">
          {/* Connecting vertical line behind step circles */}
          <div
            aria-hidden="true"
            className="absolute left-[25px] top-7 bottom-7 w-px bg-rp-border"
          />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex items-start gap-3 rounded-[12px] bg-rp-surface p-3 shadow-rp-flat border border-rp-border/60"
            >
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-rp-primary bg-rp-surface text-[12px] font-semibold text-rp-primary">
                {step.number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold text-rp-text">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-[1.4] text-rp-text-muted">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Pinned Bottom CTA within thumb reach */}
      <footer className="px-4 pt-2 pb-5 bg-rp-bg">
        <Link
          href="#get-started"
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 transition"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        <p className="mt-3 text-center text-[12px] text-rp-text-muted-bg">
          Already have an account?{" "}
          <Link
            href="#login"
            className="font-semibold text-rp-text underline underline-offset-2"
          >
            Log in
          </Link>
        </p>
      </footer>
    </div>
  );
}
