"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bell, Check, ChevronLeft } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { generateCountdownPlan } from "@/lib/engine";
import {
  formatCompactDate,
  formatLongDate,
  formatRelativeDays,
} from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

export default function CountdownPlanPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { account, profile, getSavedPlan, savePlan } = useReadyPath();
  const opportunity = getOpportunityById(params.id);

  const existingPlan = opportunity ? getSavedPlan(opportunity.id) : undefined;
  const [remindersEnabled, setRemindersEnabled] = useState(
    existingPlan?.remindersEnabled ?? true
  );

  useEffect(() => {
    if (existingPlan) {
      setRemindersEnabled(existingPlan.remindersEnabled);
    }
  }, [existingPlan]);

  if (!opportunity) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-rp-bg min-h-screen">
        <p className="text-[15px] font-semibold text-rp-text">
          Opportunity not found
        </p>
        <Link
          href="/explore"
          className="mt-3 inline-flex h-[42px] items-center justify-center rounded-[8px] bg-rp-primary px-4 text-[13px] font-semibold text-white"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const today = new Date();
  const countdown = generateCountdownPlan({
    profile,
    target: opportunity,
    referenceDate: today,
  });

  const handleSavePlan = () => {
    savePlan({
      opportunityId: opportunity.id,
      remindersEnabled,
      reminderOffsets: countdown.reminderSchedule.map((r) => r.code),
    });
    router.push("/plans");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      {/* Dark Header with Big Countdown Number */}
      <header className="bg-rp-primary text-rp-primary-on px-4 pt-4 pb-6 rounded-b-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/opportunities/${opportunity.id}`}
            aria-label="Back to Opportunity Detail"
            className="inline-flex h-11 w-11 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-rp-primary-on-muted">
            Countdown Plan
          </span>
        </div>

        <h1 className="text-[15px] font-semibold text-white leading-snug">
          {opportunity.title}
        </h1>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-[44px] font-bold leading-none tracking-tight text-white">
            {Math.max(0, countdown.daysUntilDeadline)}
          </span>
          <span className="text-[13px] text-rp-primary-on-muted">
            days until the deadline
          </span>
        </div>

        <p className="mt-2 text-[12px] text-rp-primary-on-muted">
          Deadline: {formatLongDate(opportunity.deadline)} · today is{" "}
          {formatCompactDate(today)}
        </p>
      </header>

      <main className="flex-1 px-4 pt-4 pb-6 space-y-5">
        {/* Email Reminder Card */}
        <section className="rounded-[12px] bg-rp-surface p-3.5 border border-rp-border/70 shadow-rp-flat space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-rp-tag text-rp-primary">
                <Bell className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-rp-text">
                  Email reminders
                </p>
                <p className="text-[11px] text-rp-text-muted truncate">
                  Sent to {account.email}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={remindersEnabled}
              onChange={setRemindersEnabled}
              ariaLabel="Toggle email reminders"
            />
          </div>

          <div className="pt-2 border-t border-rp-border/50">
            <p className="text-[11px] font-medium text-rp-text-muted mb-2">
              Remind me before the deadline
            </p>
            {countdown.reminderSchedule.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {countdown.reminderSchedule.map((item) => (
                  <div
                    key={item.code}
                    className={cn(
                      "rounded-[8px] px-2 py-1.5 text-center text-[11px] font-semibold transition",
                      remindersEnabled
                        ? "bg-rp-primary text-white"
                        : "bg-rp-surface border border-rp-border text-rp-text-muted"
                    )}
                  >
                    {item.code} · {formatCompactDate(item.sendDate)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-rp-danger font-medium">
                Deadline is less than 7 days away; standard offsets have passed.
              </p>
            )}
          </div>
        </section>

        {/* Backward Timeline */}
        <section>
          <h2 className="text-[15px] font-semibold text-rp-text mb-3">
            Working back from {formatCompactDate(opportunity.deadline)}
          </h2>

          <div className="relative pl-6 space-y-3">
            {/* Vertical timeline line */}
            <div
              aria-hidden="true"
              className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-rp-border"
            />

            {/* Today Node */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-6 top-2.5 h-4 w-4 rounded-full bg-rp-primary border-2 border-rp-bg"
              />
              <div className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat">
                <p className="text-[11px] text-rp-text-muted">
                  {formatLongDate(today)} · today
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-rp-text">
                  Plan started
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
                <div className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-[11px]",
                        milestone.isPastDue
                          ? "font-semibold text-rp-danger"
                          : "text-rp-text-muted"
                      )}
                    >
                      {formatLongDate(milestone.targetDate)} ·{" "}
                      {formatRelativeDays(milestone.targetDate, today)}
                    </p>
                    <span className="text-[10px] font-semibold text-rp-text-muted">
                      H-{milestone.daysBeforeDeadline}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] font-semibold text-rp-text">
                    {milestone.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-rp-text-muted leading-snug">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Final Deadline Node */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-6 top-3 h-4 w-4 rounded-full bg-rp-danger border-2 border-rp-bg"
              />
              <div className="rounded-[12px] bg-rp-surface p-3 border border-rp-danger-border shadow-rp-flat">
                <p className="text-[11px] font-semibold text-rp-danger">
                  {formatLongDate(opportunity.deadline)} ·{" "}
                  {formatRelativeDays(opportunity.deadline, today)}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-rp-text">
                  Application Deadline
                </p>
                <p className="mt-0.5 text-[11px] text-rp-text-muted">
                  Official portal closes for {opportunity.title}.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pinned CTA */}
      <footer className="sticky bottom-0 z-10 px-4 pt-2 pb-4 bg-rp-bg">
        <button
          type="button"
          onClick={handleSavePlan}
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 transition"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          <span>Save Plan</span>
        </button>
      </footer>
    </div>
  );
}
