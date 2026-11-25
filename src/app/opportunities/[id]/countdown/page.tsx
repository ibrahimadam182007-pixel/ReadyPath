"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bell, Check, ChevronLeft, Trash2 } from "lucide-react";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility, generateCountdownPlan } from "@/lib/engine";
import {
  formatCompactDate,
  formatLongDate,
  formatRelativeDays,
} from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

export default function CountdownPlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { account, profile, getSavedPlan, savePlan, removePlan } = useReadyPath();
  const opportunity = getOpportunityById(params.id);

  const existingPlan = opportunity ? getSavedPlan(opportunity.id) : undefined;
  const [remindersEnabled, setRemindersEnabled] = useState(
    existingPlan?.remindersEnabled ?? true
  );
  const [selectedOffsets, setSelectedOffsets] = useState<string[]>(
    existingPlan?.reminderOffsets ?? ["H-30", "H-14", "H-7"]
  );

  useEffect(() => {
    if (existingPlan) {
      setRemindersEnabled(existingPlan.remindersEnabled);
      setSelectedOffsets(existingPlan.reminderOffsets);
    }
  }, [existingPlan]);

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
  const countdown = generateCountdownPlan({
    profile,
    target: opportunity,
    referenceDate: today,
  });

  const unmetCount = gapReport.totalCount - gapReport.metCount;
  const availableCodes = countdown.reminderSchedule.map((r) => r.code);
  const activeOffsets = availableCodes.filter((c) => selectedOffsets.includes(c));

  const toggleOffset = (code: string) => {
    setSelectedOffsets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSavePlan = () => {
    savePlan({
      opportunityId: opportunity.id,
      remindersEnabled,
      reminderOffsets: activeOffsets,
    });
    router.push("/plans");
  };

  const handleRemove = () => {
    removePlan(opportunity.id);
    router.push("/plans");
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      {/* Mobile Deep Forest Header with Big Countdown Number */}
      <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-4 pb-6 rounded-b-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/opportunities/${opportunity.id}`}
            aria-label="Back to Opportunity Detail"
            className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </Link>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-rp-primary-on-muted">
            Countdown Plan
          </span>
        </div>

        <h1 className="text-[16px] font-bold text-white leading-snug">
          {opportunity.title}
        </h1>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-[54px] font-extrabold leading-none tracking-tight text-white">
            {Math.max(0, countdown.daysUntilDeadline)}
          </span>
          <span className="text-[12.5px] font-semibold text-rp-primary-on-muted">
            days until the deadline
          </span>
        </div>

        <p className="mt-2 text-[11.5px] text-rp-primary-on-muted">
          Deadline: {formatLongDate(opportunity.deadline)} · today is{" "}
          {formatCompactDate(today)}
        </p>
      </header>

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Top */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-rp-sage-strong hover:text-rp-primary transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
              <span>Back to gap report</span>
            </Link>
            <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
              Countdown Plan
            </h1>
            <p className="text-[12.5px] text-rp-text-muted">
              {opportunity.title} · {opportunity.organizer}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-rp-surface-met px-3 py-1 text-[10.5px] font-extrabold text-rp-success">
              {opportunity.category}
            </span>
            {opportunity.isPrototype && <PrototypeBadge />}
          </div>
        </div>

        <main className="flex-1 px-4 pt-4 pb-6 lg:px-0 lg:pt-0 lg:pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:gap-6 lg:items-start">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Desktop Forest Countdown Strip */}
            <section className="hidden lg:flex items-center justify-between gap-6 rounded-[16px] bg-rp-primary px-7 py-6 text-white">
              <div className="flex items-end gap-4">
                <span className="text-[62px] font-extrabold leading-none tracking-tight text-white">
                  {Math.max(0, countdown.daysUntilDeadline)}
                </span>
                <div className="pb-1.5 space-y-0.5">
                  <p className="text-[13px] font-bold text-white">
                    days until the deadline
                  </p>
                  <p className="text-[11.5px] text-rp-primary-on-muted">
                    {formatLongDate(opportunity.deadline)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-[#8FAFA2]">
                  Today
                </p>
                <p className="mt-0.5 text-[12.5px] font-bold text-white">
                  {formatLongDate(today)}
                </p>
              </div>
            </section>

            {/* Email Reminder Card */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rp-bg text-rp-primary">
                    <Bell className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-extrabold text-rp-text">
                      Email reminders
                    </p>
                    <p className="text-[11px] text-rp-text-muted truncate">
                      Sent to {account.email || "your student email"}
                    </p>
                  </div>
                </div>

                <ToggleSwitch
                  checked={remindersEnabled}
                  onChange={setRemindersEnabled}
                  ariaLabel="Toggle email reminders"
                />
              </div>

              <div className="pt-3 border-t border-rp-hairline">
                <p className="text-[11px] font-semibold text-rp-text-muted mb-2.5">
                  Remind me before the deadline
                </p>
                {countdown.reminderSchedule.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {countdown.reminderSchedule.map((item) => {
                      const isOn =
                        remindersEnabled && selectedOffsets.includes(item.code);
                      return (
                        <button
                          key={item.code}
                          type="button"
                          disabled={!remindersEnabled}
                          onClick={() => toggleOffset(item.code)}
                          className={cn(
                            "rounded-full px-3.5 py-2 text-[11px] font-bold transition disabled:opacity-50",
                            isOn
                              ? "bg-rp-primary text-white"
                              : "bg-rp-bg text-rp-primary border border-rp-border hover:bg-rp-surface-met"
                          )}
                        >
                          {item.code} · {formatCompactDate(item.sendDate)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11.5px] text-rp-danger font-semibold">
                    Deadline has passed or is less than 7 days away; standard
                    reminder offsets (H-30, H-14, H-7) have elapsed.
                  </p>
                )}
              </div>
            </section>

            {/* Backward Timeline */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat">
              <h2 className="text-[14px] lg:text-[15px] font-extrabold text-rp-text mb-4">
                Working back from {formatCompactDate(opportunity.deadline)}
              </h2>

              <div className="relative pl-6 space-y-3.5">
                {/* Vertical connector line */}
                <div
                  aria-hidden="true"
                  className="absolute left-[7px] top-2.5 bottom-3 w-[2px] bg-rp-border"
                />

                {/* Today Node */}
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-6 top-2 h-4 w-4 rounded-full bg-rp-primary border-2 border-rp-surface ring-2 ring-rp-bg"
                  />
                  <div className="rounded-[12px] bg-rp-bg/50 p-3 border border-rp-hairline">
                    <p className="text-[11px] font-bold text-rp-primary">
                      Today · {formatLongDate(today)}
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-rp-text">
                      {unmetCount > 0
                        ? `Plan created with ${unmetCount} ${
                            unmetCount === 1 ? "gap" : "gaps"
                          } to close`
                        : "All requirements met — ready to prepare submission"}
                    </p>
                  </div>
                </div>

                {/* Backward Milestones */}
                {countdown.milestones.map((milestone, idx) => (
                  <div key={`${milestone.type}-${idx}`} className="relative">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -left-6 top-3 h-4 w-4 rounded-full border-2",
                        milestone.isPastDue
                          ? "bg-rp-danger-bg border-rp-danger"
                          : "bg-rp-surface border-rp-primary"
                      )}
                    />
                    <div className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/80">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-[11px] font-bold",
                            milestone.isPastDue
                              ? "text-rp-danger"
                              : "text-rp-text-muted"
                          )}
                        >
                          {formatLongDate(milestone.targetDate)} ·{" "}
                          {formatRelativeDays(milestone.targetDate, today)}
                        </p>
                        <span className="inline-flex rounded-full bg-rp-bg px-2 py-0.5 text-[10px] font-extrabold text-rp-primary">
                          H-{milestone.daysBeforeDeadline}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] font-bold text-rp-text">
                        {milestone.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-rp-text-muted leading-snug">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Final Deadline Node */}
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-6 top-3 h-4 w-4 rounded-full bg-rp-danger border-2 border-rp-surface ring-2 ring-rp-danger-bg"
                  />
                  <div className="rounded-[12px] bg-rp-danger-bg/60 p-3 border border-rp-danger-border">
                    <p className="text-[11px] font-extrabold text-rp-danger">
                      {formatLongDate(opportunity.deadline)} ·{" "}
                      {formatRelativeDays(opportunity.deadline, today)}
                    </p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-rp-text">
                      Application Deadline
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-rp-text-muted">
                      Official portal closes for {opportunity.title}.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Desktop Right Sticky Summary Rail */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-7">
            <section className="rounded-[16px] bg-rp-surface p-[22px] border border-rp-border shadow-rp-flat">
              <h2 className="text-[13.5px] font-extrabold text-rp-text mb-2">
                Plan summary
              </h2>
              <dl className="divide-y divide-rp-hairline text-[12px]">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-rp-text-muted">Requirements to close</dt>
                  <dd className="font-bold text-rp-text">{unmetCount}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-rp-text-muted">Milestones</dt>
                  <dd className="font-bold text-rp-text">
                    {countdown.milestones.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-rp-text-muted">Reminders</dt>
                  <dd className="font-bold text-rp-text">
                    {remindersEnabled && activeOffsets.length > 0
                      ? activeOffsets.join(", ")
                      : "Off"}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-rp-text-muted">Owner</dt>
                  <dd className="font-bold text-rp-text truncate max-w-[180px]">
                    {account.fullName || account.email || "Guest Student"}
                  </dd>
                </div>
              </dl>
            </section>

            <button
              type="button"
              onClick={handleSavePlan}
              className="w-full h-[48px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[14px] font-bold text-white hover:bg-rp-primary-hover transition"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              <span>{existingPlan ? "Update Saved Plan" : "Save Plan"}</span>
            </button>

            {existingPlan && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-surface border border-rp-danger-border px-4 text-[13px] font-bold text-rp-danger hover:bg-rp-danger-bg transition"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                <span>Remove from My Plans</span>
              </button>
            )}

            <div className="rounded-[14px] bg-rp-tag-bg p-4 space-y-1">
              <p className="text-[11px] font-extrabold text-rp-tag">
                Prototype data
              </p>
              <p className="text-[10.5px] leading-relaxed text-rp-tag">
                Deadlines and requirements are curated for this prototype.
                Always confirm on the official announcement page before applying.
              </p>
            </div>
          </aside>
        </main>
      </div>

      {/* Mobile Sticky Save CTA */}
      <footer className="lg:hidden sticky bottom-0 z-10 px-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] bg-rp-surface border-t border-rp-border">
        <button
          type="button"
          onClick={handleSavePlan}
          className="w-full h-[48px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary px-4 text-[14.5px] font-bold text-rp-primary-on hover:bg-rp-primary-hover active:brightness-95 transition"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          <span>{existingPlan ? "Update Saved Plan" : "Save Plan"}</span>
        </button>
      </footer>
    </div>
  );
}
