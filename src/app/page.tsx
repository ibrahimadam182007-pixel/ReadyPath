import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { PROTOTYPE_OPPORTUNITIES } from "@/lib/data/prototype-opportunities";
import { formatMediumDate, getDaysLeft } from "@/lib/utils/date-format";

const STEPS = [
  {
    number: 1,
    title: "Add your profile",
    description:
      "Semester, GPA, certificates and experience — once, in three minutes.",
  },
  {
    number: 2,
    title: "See your gaps",
    description:
      "Every requirement checked against your profile, met or missing.",
  },
  {
    number: 3,
    title: "Plan the countdown",
    description:
      "Milestones and email reminders that work back from the deadline.",
  },
];

export default function WelcomePage() {
  const today = new Date();
  const activeOpps = PROTOTYPE_OPPORTUNITIES.filter(
    (opp) => getDaysLeft(opp.deadline, today) >= 0
  ).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const featured =
    activeOpps.find((o) => o.id === "opp-magenta-bumn-2026") ??
    activeOpps[0] ??
    PROTOTYPE_OPPORTUNITIES[0];
  const featuredDays = getDaysLeft(featured.deadline, today);
  const categoryCount = new Set(PROTOTYPE_OPPORTUNITIES.map((o) => o.category)).size;

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      {/* Desktop Container Shell */}
      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="public" />

        {/* Hero Section (Full-bleed rounded-b on Mobile, Rounded Card 2-Col on Desktop) */}
        <header className="relative overflow-hidden bg-rp-primary text-rp-primary-on px-5 pt-6 pb-8 rounded-b-[24px] lg:rounded-[20px] lg:px-11 lg:py-11">
          {/* Decorative dotted trajectory SVG */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 110"
            className="pointer-events-none absolute right-2 top-3 h-28 w-28 opacity-75 lg:hidden"
            fill="none"
          >
            <path
              d="M12 96 C 36 86, 52 54, 78 44 C 92 38, 100 28, 104 18"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="4 5"
              strokeLinecap="round"
            />
            <circle cx="104" cy="18" r="5" fill="#C93B3B" />
          </svg>

          {/* Mobile Brand */}
          <div className="mb-6 lg:hidden">
            <BrandLogo onDark />
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_404px] lg:items-center lg:gap-10">
            {/* Hero Copy */}
            <div className="space-y-3.5 lg:space-y-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-rp-primary-on-muted">
                Universitas AMIKOM Yogyakarta
              </p>

              <h1 className="text-[28px] lg:text-[41px] font-extrabold leading-[1.12] tracking-tight text-white max-w-[320px] lg:max-w-[560px]">
                Know what you miss and by when to act
              </h1>

              <p className="text-[13.5px] lg:text-[14.5px] leading-[1.55] text-rp-primary-on-muted max-w-[330px] lg:max-w-[520px]">
                Scholarships, competitions, internships and training, checked
                against your profile — with a countdown for every requirement
                you still need.
              </p>

              {/* Desktop Hero CTAs */}
              <div className="hidden lg:flex items-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[10px] bg-rp-surface px-6 text-[13.5px] font-extrabold text-rp-primary hover:bg-rp-bg transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/10 px-5 text-[13px] font-bold text-white hover:bg-white/15 transition"
                >
                  <Compass className="h-4 w-4" strokeWidth={2} />
                  <span>Browse opportunities</span>
                </Link>
              </div>

              {/* Honest trust line */}
              <p className="hidden lg:flex items-center gap-2 pt-1 text-[11px] text-rp-primary-on-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-rp-sage" strokeWidth={2} />
                <span>
                  {PROTOTYPE_OPPORTUNITIES.length} official 2026 opportunities
                  indexed · deterministic rule engine (no AI guesses)
                </span>
              </p>
            </div>

            {/* Desktop Featured Opportunity Preview Card */}
            <Link
              href={`/opportunities/${featured.id}`}
              className="hidden lg:flex flex-col gap-3 rounded-[16px] bg-rp-surface p-5 text-rp-text shadow-rp-card hover:translate-y-[-2px] transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-rp-sage-strong">
                  Featured Opportunity
                </span>
                <PrototypeBadge label="Prototype" />
              </div>

              <div>
                <h2 className="text-[16px] font-extrabold leading-snug text-rp-text">
                  {featured.title}
                </h2>
                <p className="mt-0.5 text-[11.5px] text-rp-text-muted">
                  {featured.organizer}
                </p>
              </div>

              <div className="rounded-[10px] bg-rp-surface-met px-3 py-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rp-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  <span>Deterministic Gap Report Ready</span>
                </div>
                <p className="text-[11px] text-rp-text-muted">
                  Min GPA {featured.rule.minGpa.toFixed(2)} · Semester{" "}
                  {featured.rule.minSemester}–{featured.rule.maxSemester}
                </p>
              </div>

              <div className="pt-2 border-t border-rp-hairline flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-rp-text-muted">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Deadline {formatMediumDate(featured.deadline)}
                </span>
                <span className="inline-flex items-center rounded-full bg-rp-danger-bg px-2.5 py-0.5 text-[10.5px] font-extrabold text-rp-danger">
                  {featuredDays >= 0 ? `${featuredDays} days left` : "Closed"}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* How ReadyPath works */}
        <main id="how-it-works" className="flex-1 px-4 pt-5 pb-4 lg:px-0 lg:pt-0 lg:pb-0 space-y-4 lg:space-y-5">
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-[15px] font-extrabold text-rp-text">
              How ReadyPath works
            </h2>
            <PrototypeBadge />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-3.5 lg:flex-col lg:gap-3 rounded-[14px] lg:rounded-[16px] bg-rp-surface p-3.5 lg:p-[22px] border border-rp-border shadow-rp-flat"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rp-bg border border-rp-border text-[12px] font-extrabold text-rp-primary">
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13.5px] lg:text-[15px] font-extrabold text-rp-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[12px] lg:text-[12.5px] leading-[1.5] text-rp-text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Honest Desktop Stats Strip */}
          <section className="hidden lg:grid lg:grid-cols-3 gap-6 pt-1">
            <div className="px-2 py-2">
              <p className="text-[26px] font-extrabold text-rp-primary">
                {PROTOTYPE_OPPORTUNITIES.length}
              </p>
              <p className="text-[12px] font-medium text-rp-sage-strong">
                Official 2026 opportunities tracked
              </p>
            </div>
            <div className="px-2 py-2">
              <p className="text-[26px] font-extrabold text-rp-primary">
                {categoryCount}
              </p>
              <p className="text-[12px] font-medium text-rp-sage-strong">
                Program tracks (Scholarship, Internship, Training)
              </p>
            </div>
            <div className="px-2 py-2">
              <p className="text-[26px] font-extrabold text-rp-primary">
                100%
              </p>
              <p className="text-[12px] font-medium text-rp-sage-strong">
                Rule-based deterministic matching
              </p>
            </div>
          </section>
        </main>

        {/* Mobile Sticky Footer CTA */}
        <footer className="lg:hidden px-4 pt-2 pb-6 bg-rp-bg">
          <Link
            href="/signup"
            className="w-full h-[48px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 transition"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <p className="mt-3 text-center text-[12.5px] text-rp-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-rp-primary underline underline-offset-2"
            >
              Log in
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
