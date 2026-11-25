"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  FileSearch,
  Trash2,
} from "lucide-react";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility, generateCountdownPlan } from "@/lib/engine";
import { formatLongDate, getDaysLeft } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

const CHECKLIST_STORAGE_PREFIX = "readypath_checklist_v1_";

export default function SavedPlanTrackerPage() {
  const params = useParams<{ opportunityId: string }>();
  const router = useRouter();
  const { profile, getSavedPlan, togglePlanReminders, removePlan } =
    useReadyPath();
  const opportunity = getOpportunityById(params.opportunityId);
  const savedPlan = opportunity ? getSavedPlan(opportunity.id) : undefined;

  const [completedKeys, setCompletedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!opportunity) return;
    try {
      const raw = window.localStorage.getItem(
        `${CHECKLIST_STORAGE_PREFIX}${opportunity.id}`
      );
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCompletedKeys(parsed);
      }
    } catch {
      // ignore storage read error
    }
  }, [opportunity]);

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-rp-bg flex flex-col">
        <div className="w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7">
          <DesktopNavbar variant="app" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-[16px] font-extrabold text-rp-text">
            Saved plan not found
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[10px] bg-rp-primary px-5 text-[13px] font-bold text-white"
          >
            Back to My Plans
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
  const daysLeft = getDaysLeft(opportunity.deadline, today);

  const toggleMilestone = (key: string) => {
    setCompletedKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      try {
        window.localStorage.setItem(
          `${CHECKLIST_STORAGE_PREFIX}${opportunity.id}`,
          JSON.stringify(next)
        );
      } catch {
        // ignore storage write error
      }
      return next;
    });
  };

  const handleRemove = () => {
    removePlan(opportunity.id);
    router.push("/plans");
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      {/* Mobile Forest Header */}
      <header className="lg:hidden bg-rp-primary text-rp-primary-on px-5 pt-4 pb-6 rounded-b-[24px]">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/plans"
            aria-label="Back to My Plans"
            className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </Link>
          <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
            {opportunity.category}
          </span>
        </div>

        <h1 className="text-[22px] font-extrabold leading-snug text-white">
          {opportunity.title}
        </h1>
        <p className="mt-1.5 text-[11.5px] text-rp-primary-on-muted">
          {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"} · Deadline{" "}
          {formatLongDate(opportunity.deadline)}
        </p>
      </header>

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Top */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-rp-sage-strong hover:text-rp-primary transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
              <span>Back to My Plans</span>
            </Link>
            <div className="flex items-center gap-2.5 pt-1">
              <span className="inline-flex items-center rounded-full bg-rp-surface-met px-2.5 py-0.5 text-[10px] font-extrabold text-rp-success">
                {opportunity.category}
              </span>
              <span className="text-[12px] font-bold text-rp-danger">
                {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
              </span>
            </div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
              {opportunity.title}
            </h1>
            <p className="text-[12.5px] text-rp-text-muted">
              Deadline {formatLongDate(opportunity.deadline)} ·{" "}
              {opportunity.organizer}
            </p>
          </div>
        </div>

        <main className="flex-1 px-4 pt-4 pb-8 lg:px-0 lg:pt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
          {/* Action Checklist Card */}
          <div className="space-y-4">
            {/* Mobile Readiness Progress Card */}
            <section className="lg:hidden rounded-[16px] bg-rp-surface p-4 border border-rp-border shadow-rp-flat space-y-3">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Readiness Progress
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-extrabold leading-none text-rp-primary">
                  {gapReport.readinessPercent}%
                </span>
                <span className="text-[13.5px] font-bold text-rp-sage-strong">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-rp-text-muted">
                {gapReport.metCount} of{" "}
                {gapReport.totalCount} requirements met
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-rp-bg">
                <div
                  className="h-full rounded-full bg-rp-primary"
                  style={{ width: `${gapReport.readinessPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="flex-1 h-[40px] inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-rp-bg text-[12px] font-extrabold text-rp-primary"
                >
                  <FileSearch className="h-3.5 w-3.5" strokeWidth={2.2} />
                  <span>View Gap Report</span>
                </Link>
                <Link
                  href={`/opportunities/${opportunity.id}/countdown`}
                  className="flex-1 h-[40px] inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-rp-border bg-rp-surface text-[12px] font-bold text-rp-text"
                >
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Edit Plan</span>
                </Link>
              </div>
            </section>

            {/* Interactive Action Checklist */}
            <section className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[14.5px] font-extrabold text-rp-text">
                    Action Checklist
                  </h2>
                  <p className="text-[11px] text-rp-text-muted mt-0.5">
                    Track each backward milestone before the portal closes
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-rp-bg px-2.5 py-1 text-[10.5px] font-extrabold text-rp-primary">
                  {completedKeys.length} / {countdown.milestones.length} done
                </span>
              </div>

              <div className="space-y-2.5">
                {countdown.milestones.map((milestone, idx) => {
                  const key = `${milestone.type}-${milestone.daysBeforeDeadline}-${idx}`;
                  const checked = completedKeys.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleMilestone(key)}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-[12px] p-3.5 text-left border transition",
                        checked
                          ? "bg-rp-surface-met border-rp-border"
                          : "bg-rp-surface border-rp-border/80 hover:border-rp-primary/60"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition",
                          checked
                            ? "bg-rp-success border-rp-success text-white"
                            : "bg-rp-surface border-rp-border"
                        )}
                      >
                        {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.8} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "text-[13px] font-bold leading-snug",
                              checked
                                ? "line-through text-rp-text-muted"
                                : "text-rp-text"
                            )}
                          >
                            {milestone.title}
                          </p>
                          <span className="shrink-0 text-[10px] font-extrabold text-rp-sage-strong">
                            H-{milestone.daysBeforeDeadline}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-rp-text-muted">
                          {milestone.description}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[10.5px] font-bold",
                            checked
                              ? "text-rp-success"
                              : milestone.isPastDue
                              ? "text-rp-danger"
                              : "text-rp-sage-strong"
                          )}
                        >
                          {checked
                            ? "Completed"
                            : `Due ${formatLongDate(milestone.targetDate)}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Mobile Remove Button */}
            {savedPlan && (
              <button
                type="button"
                onClick={handleRemove}
                className="lg:hidden w-full h-[46px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-surface border border-rp-danger-border text-[13px] font-bold text-rp-danger hover:bg-rp-danger-bg transition"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                <span>Remove from My Plans</span>
              </button>
            )}
          </div>

          {/* Desktop Right Sticky Rail */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-7">
            <section className="rounded-[16px] bg-rp-surface p-[22px] border border-rp-border shadow-rp-flat space-y-3.5">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Readiness Progress
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[38px] font-extrabold leading-none text-rp-primary">
                  {gapReport.readinessPercent}%
                </span>
                <span className="text-[13px] font-bold text-rp-sage-strong">
                  Ready
                </span>
              </div>
              <p className="text-[11.5px] text-rp-text-muted">
                {gapReport.metCount} of{" "}
                {gapReport.totalCount} requirements met
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-rp-bg">
                <div
                  className="h-full rounded-full bg-rp-primary"
                  style={{ width: `${gapReport.readinessPercent}%` }}
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-rp-primary text-[13px] font-bold text-white hover:bg-rp-primary-hover transition"
                >
                  <FileSearch className="h-4 w-4" strokeWidth={2} />
                  <span>View Gap Report</span>
                </Link>
                <Link
                  href={`/opportunities/${opportunity.id}/countdown`}
                  className="w-full h-[44px] inline-flex items-center justify-center gap-2 rounded-[10px] border border-rp-border bg-rp-surface text-[13px] font-bold text-rp-text hover:bg-rp-bg/50 transition"
                >
                  <Calendar className="h-4 w-4" strokeWidth={2} />
                  <span>Adjust Countdown & Reminders</span>
                </Link>
              </div>
            </section>

            {savedPlan && (
              <section className="rounded-[16px] bg-rp-surface p-[22px] border border-rp-border shadow-rp-flat space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4 w-4 text-rp-primary" strokeWidth={2} />
                    <div>
                      <p className="text-[12.5px] font-extrabold text-rp-text">
                        Email Reminders
                      </p>
                      <p className="text-[10.5px] text-rp-text-muted">
                        {savedPlan.reminderOffsets.join(", ") || "No offsets"}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={savedPlan.remindersEnabled}
                    onChange={(v) => togglePlanReminders(opportunity.id, v)}
                    ariaLabel="Toggle reminders for this plan"
                  />
                </div>

                <div className="h-px bg-rp-hairline" />

                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[10px] border border-rp-danger-border bg-rp-surface text-[12.5px] font-bold text-rp-danger hover:bg-rp-danger-bg transition"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                  <span>Remove from My Plans</span>
                </button>
              </section>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
