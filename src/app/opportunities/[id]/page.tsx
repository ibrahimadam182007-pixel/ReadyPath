"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { GapReportCard } from "@/components/gap-report/gap-report-card";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility, generateCountdownPlan } from "@/lib/engine";
import {
  formatLongDate,
  formatMonthYear,
  getDaysLeft,
} from "@/lib/utils/date-format";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { account, profile, getSavedPlan, savePlan } = useReadyPath();
  const opportunity = getOpportunityById(params.id);

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-rp-bg flex flex-col">
        <div className="w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7">
          <DesktopNavbar variant="app" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-[16px] font-extrabold text-rp-text">
            Opportunity not found
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[10px] bg-rp-primary px-5 text-[13px] font-bold text-white"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  const gapReport = evaluateEligibility(profile, opportunity, today);
  const existingPlan = getSavedPlan(opportunity.id);
  const daysLeft = getDaysLeft(opportunity.deadline, today);
  const hostname = new URL(opportunity.sourceUrl).hostname.replace(/^www\./, "");

  const handleQuickSave = () => {
    if (existingPlan) {
      router.push(`/plans/${opportunity.id}`);
      return;
    }
    const plan = generateCountdownPlan({
      profile,
      target: opportunity,
      referenceDate: today,
    });
    savePlan({
      opportunityId: opportunity.id,
      remindersEnabled: true,
      reminderOffsets: plan.reminderSchedule.map((r) => r.code),
    });
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      {/* Mobile Deep Forest Header */}
      <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-4 pb-6 rounded-b-[24px]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link
            href="/explore"
            aria-label="Back to Explore"
            className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </Link>
          {opportunity.isPrototype && <PrototypeBadge onDark />}
        </div>

        <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-white mb-2">
          {opportunity.category}
        </span>

        <h1 className="text-[22px] font-extrabold leading-snug text-white">
          {opportunity.title}
        </h1>
        <p className="mt-1 text-[12px] text-rp-primary-on-muted">
          {opportunity.organizer}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Last verified: {formatMonthYear(opportunity.lastVerifiedAt)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold text-white">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Deadline {formatLongDate(opportunity.deadline)}</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        <main className="flex-1 px-4 pt-4 pb-6 lg:px-0 lg:pt-0 lg:pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:gap-6 lg:items-start">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Desktop Header Block */}
            <div className="hidden lg:block space-y-2.5 pb-1">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-rp-sage-strong hover:text-rp-primary transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                <span>Back to Explore</span>
              </Link>

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center rounded-full bg-rp-surface-met px-2.5 py-0.5 text-[10px] font-extrabold text-rp-success">
                  {opportunity.category}
                </span>
                {opportunity.isPrototype && <PrototypeBadge />}
                <span className="inline-flex items-center gap-1 rounded-full bg-rp-surface px-2.5 py-0.5 text-[10px] font-semibold text-rp-text-muted border border-rp-border">
                  <ShieldCheck className="h-3 w-3 text-rp-sage-strong" strokeWidth={2} />
                  Last verified: {formatMonthYear(opportunity.lastVerifiedAt)}
                </span>
              </div>

              <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-rp-text">
                {opportunity.title}
              </h1>
              <p className="text-[13px] font-medium text-rp-text-muted">
                {opportunity.organizer}
              </p>
            </div>

            {/* Program Summary Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-3">
              <h2 className="text-[14px] lg:text-[15px] font-extrabold text-rp-text">
                Program summary
              </h2>
              <p className="text-[13px] leading-relaxed text-rp-text-muted">
                {opportunity.summary}
              </p>

              {opportunity.highlights.length > 0 && (
                <ul className="space-y-2 pt-1">
                  {opportunity.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[12.5px] text-rp-text"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-rp-success mt-0.5"
                        strokeWidth={2.2}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-3 border-t border-rp-hairline">
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-rp-primary underline underline-offset-2 hover:text-rp-primary-hover"
                >
                  <span>Official source: {hostname}</span>
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                </a>
              </div>
            </section>

            {/* Requirement Gap Report */}
            <GapReportCard report={gapReport} />
          </div>

          {/* Desktop Right Sticky Action Rail */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-7">
            <section className="rounded-[16px] bg-rp-surface p-[22px] border border-rp-border shadow-rp-flat space-y-3.5">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Your Readiness
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-[38px] font-extrabold leading-none tracking-tight text-rp-primary">
                  {gapReport.readinessPercent}%
                </span>
                <span className="text-[13px] font-bold text-rp-sage-strong">
                  Ready
                </span>
              </div>

              <p className="text-[11.5px] text-rp-text-muted">
                {gapReport.metCount} of {gapReport.totalCount} requirements met
              </p>

              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={gapReport.readinessPercent}
                className="h-2 w-full overflow-hidden rounded-full bg-rp-bg"
              >
                <div
                  className="h-full rounded-full bg-rp-primary transition-all"
                  style={{ width: `${gapReport.readinessPercent}%` }}
                />
              </div>

              <div className="h-px bg-rp-hairline" />

              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-rp-text-muted">
                    Deadline
                  </p>
                  <p className="text-[12.5px] font-bold text-rp-text">
                    {formatLongDate(opportunity.deadline)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${
                    daysLeft >= 0
                      ? "bg-rp-danger-bg text-rp-danger"
                      : "bg-rp-tag-bg text-rp-tag"
                  }`}
                >
                  {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
                </span>
              </div>

              <div className="pt-1 space-y-2.5">
                <Link
                  href={`/opportunities/${opportunity.id}/countdown`}
                  className="w-full h-[46px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[13.5px] font-bold text-white hover:bg-rp-primary-hover transition"
                >
                  <Calendar className="h-4 w-4" strokeWidth={2.2} />
                  <span>
                    {existingPlan
                      ? "View Countdown Plan"
                      : "Create Countdown Plan"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleQuickSave}
                  className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-surface border border-rp-border px-4 text-[13px] font-bold text-rp-text hover:bg-rp-bg/50 transition"
                >
                  {existingPlan ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-rp-success" strokeWidth={2.2} />
                      <span>Open Saved Plan Tracker</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 text-rp-primary" strokeWidth={2} />
                      <span>Save to My Plans</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            <section className="rounded-[16px] bg-rp-surface p-[22px] border border-rp-border shadow-rp-flat space-y-1.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-rp-primary" strokeWidth={2} />
                <h3 className="text-[12px] font-extrabold text-rp-text">
                  Reminders
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-rp-text-muted">
                Email reminders go to{" "}
                <span className="font-semibold text-rp-text">
                  {account.email || "your registered student email"}
                </span>{" "}
                at H-30, H-14 and H-7 before the deadline.
              </p>
            </section>
          </aside>
        </main>
      </div>

      {/* Mobile Sticky CTA */}
      <footer className="lg:hidden sticky bottom-0 z-10 px-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] bg-rp-surface border-t border-rp-border">
        <Link
          href={`/opportunities/${opportunity.id}/countdown`}
          className="w-full h-[48px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 transition"
        >
          <Calendar className="h-4 w-4" strokeWidth={2.2} />
          <span>
            {existingPlan ? "View Countdown Plan" : "Create Countdown Plan"}
          </span>
        </Link>
      </footer>
    </div>
  );
}
