"use client";

import React from "react";
import Link from "next/link";
import { Bell, ChevronRight, Flag, Plus } from "lucide-react";
import { TabHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility } from "@/lib/engine";
import {
  formatLongDate,
  formatMediumDate,
  getDaysLeft,
} from "@/lib/utils/date-format";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function MyPlansPage() {
  const { account, profile, savedPlans, togglePlanReminders, isHydrated } =
    useReadyPath();
  const today = new Date();
  const initials = getInitials(account.fullName || account.email || "ST");

  const enrichedPlans = savedPlans
    .map((plan) => {
      const opp = getOpportunityById(plan.opportunityId);
      if (!opp) return null;
      const report = evaluateEligibility(profile, opp, today);
      const daysLeft = getDaysLeft(opp.deadline, today);
      return { plan, opp, report, daysLeft };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const totalMet = enrichedPlans.reduce((sum, x) => sum + x.report.metCount, 0);
  const totalReqs = enrichedPlans.reduce(
    (sum, x) => sum + x.report.totalCount,
    0
  );
  const activePlans = enrichedPlans.filter((x) => x.daysLeft >= 0);
  const closestPlan = [...activePlans].sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const closingThisMonth = activePlans.filter((x) => x.daysLeft <= 30).length;
  const anyRemindersOn = enrichedPlans.some((x) => x.plan.remindersEnabled);

  const handleToggleAllReminders = (next: boolean) => {
    for (const { plan } of enrichedPlans) {
      if (plan.remindersEnabled !== next) {
        togglePlanReminders(plan.opportunityId, next);
      }
    }
  };

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <TabHeader
        title="My Plans"
        subtitle={`${enrichedPlans.length} saved target${
          enrichedPlans.length === 1 ? "" : "s"
        } · ${formatLongDate(today)}`}
        rightSlot={
          <Link
            href="/profile"
            aria-label={account.fullName || "Profile"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-rp-sage text-[12px] font-extrabold text-rp-primary"
          >
            {initials}
          </Link>
        }
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Head */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
              My Plans
            </h1>
            <p className="mt-1 text-[12.5px] text-rp-text-muted">
              {enrichedPlans.length} saved target
              {enrichedPlans.length === 1 ? "" : "s"} · {formatLongDate(today)}
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex h-[44px] items-center gap-2 rounded-[10px] bg-rp-surface border border-rp-border px-5 text-[12.5px] font-bold text-rp-primary hover:bg-rp-surface-met transition"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            <span>New target</span>
          </Link>
        </div>

        <main className="flex-1 px-4 pt-4 pb-6 lg:px-0 lg:pt-0 lg:pb-8 space-y-4 lg:space-y-5">
          {/* Profile Strip */}
          <section className="rounded-[16px] bg-rp-surface px-4 py-3.5 lg:px-5 lg:py-4 border border-rp-border shadow-rp-flat flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-full bg-rp-bg text-[13px] font-extrabold text-rp-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold text-rp-text truncate">
                  {account.fullName || "Student Profile"}
                </p>
                <p className="mt-0.5 text-[11px] text-rp-text-muted truncate">
                  Semester {profile.currentSemester} · GPA{" "}
                  {profile.cumulativeGpa.toFixed(2)} ·{" "}
                  {profile.certificates.length}{" "}
                  {profile.certificates.length === 1
                    ? "certificate"
                    : "certificates"}{" "}
                  · {profile.experiences.length}{" "}
                  {profile.experiences.length === 1
                    ? "experience"
                    : "experiences"}
                </p>
              </div>
            </div>

            <Link
              href="/profile/setup"
              className="shrink-0 inline-flex h-[34px] items-center gap-1 rounded-[9px] bg-rp-bg px-3 text-[11.5px] font-extrabold text-rp-primary hover:bg-rp-border/60 transition"
            >
              <span>Edit Profile</span>
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Link>
          </section>

          {/* Desktop 3 KPI Stat Cards */}
          <section className="hidden lg:grid lg:grid-cols-3 gap-[18px]">
            <div className="rounded-[16px] bg-rp-surface px-5 py-4 border border-rp-border shadow-rp-flat space-y-1">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Saved Targets
              </p>
              <p className="text-[26px] font-extrabold text-rp-primary leading-tight">
                {enrichedPlans.length}
              </p>
              <p className="text-[11px] text-rp-text-muted">
                {closingThisMonth} closing within 30 days
              </p>
            </div>

            <div className="rounded-[16px] bg-rp-surface px-5 py-4 border border-rp-border shadow-rp-flat space-y-1">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Requirements Met
              </p>
              <p className="text-[26px] font-extrabold text-rp-primary leading-tight">
                {totalMet} of {totalReqs}
              </p>
              <p className="text-[11px] text-rp-text-muted">
                across all saved targets
              </p>
            </div>

            <div className="rounded-[16px] bg-rp-surface px-5 py-4 border border-rp-border shadow-rp-flat space-y-1">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.07em] text-rp-sage-strong">
                Days to Closest Deadline
              </p>
              <p className="text-[26px] font-extrabold text-rp-primary leading-tight">
                {closestPlan ? closestPlan.daysLeft : "—"}
              </p>
              <p className="text-[11px] text-rp-text-muted truncate">
                {closestPlan ? closestPlan.opp.title : "No active deadlines"}
              </p>
            </div>
          </section>

          {/* Saved Targets Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-[14px] font-extrabold text-rp-text">
                Saved targets
              </h2>
              <span className="text-[11px] font-semibold text-rp-text-muted">
                {enrichedPlans.length} active
              </span>
            </div>

            {!isHydrated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 lg:gap-[18px]">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-44 rounded-[16px] bg-rp-surface/75 border border-rp-border animate-pulse"
                  />
                ))}
              </div>
            ) : enrichedPlans.length === 0 ? (
              <div className="rounded-[16px] bg-rp-surface p-8 lg:p-10 text-center border border-rp-border shadow-rp-flat">
                <Flag
                  className="mx-auto h-9 w-9 text-rp-sage-strong mb-2.5"
                  strokeWidth={1.6}
                />
                <p className="text-[15px] font-extrabold text-rp-text">
                  No saved targets yet
                </p>
                <p className="mt-1 text-[12.5px] text-rp-text-muted max-w-md mx-auto">
                  Pick an opportunity from Explore and create a backward
                  countdown plan with automated email reminders.
                </p>
                <Link
                  href="/explore"
                  className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[10px] bg-rp-primary px-5 text-[13px] font-bold text-white hover:bg-rp-primary-hover transition"
                >
                  Explore Opportunities
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 lg:gap-[18px]">
                {enrichedPlans.map(({ plan, opp, report, daysLeft }) => (
                  <Link
                    key={opp.id}
                    href={`/plans/${opp.id}`}
                    className="group flex flex-col justify-between rounded-[16px] bg-rp-surface p-4 lg:p-5 border border-rp-border shadow-rp-flat hover:border-rp-primary hover:shadow-rp-card transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center rounded-full bg-rp-surface-met px-2.5 py-0.5 text-[10px] font-extrabold text-rp-success">
                          {opp.category}
                        </span>
                        <span
                          className={`text-[11px] font-extrabold ${
                            daysLeft >= 0
                              ? "text-rp-danger"
                              : "text-rp-text-muted"
                          }`}
                        >
                          {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-extrabold text-rp-text leading-snug group-hover:text-rp-primary transition">
                        {opp.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-rp-text-muted">
                        Deadline {formatMediumDate(opp.deadline)}
                      </p>

                      {/* Readiness Progress */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-rp-text-muted">
                            Readiness
                          </span>
                          <span className="font-extrabold text-rp-primary">
                            {report.readinessPercent}%
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={report.readinessPercent}
                          aria-valuetext={`${report.metCount} of ${report.totalCount} requirements met`}
                          className="h-2 w-full overflow-hidden rounded-full bg-rp-bg"
                        >
                          <div
                            className="h-full rounded-full bg-rp-primary transition-all"
                            style={{ width: `${report.readinessPercent}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[10.5px] text-rp-text-muted">
                          {report.isEligible
                            ? "All requirements met"
                            : `${report.metCount} of ${report.totalCount} requirements met`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-rp-hairline flex items-center gap-1.5 text-[10.5px] text-rp-text-muted">
                      <Bell
                        className="h-3.5 w-3.5 shrink-0 text-rp-primary"
                        strokeWidth={2}
                      />
                      <span className="truncate">
                        {plan.remindersEnabled
                          ? `Email reminders on · ${
                              plan.reminderOffsets.length > 0
                                ? plan.reminderOffsets.join(", ")
                                : "Active"
                            }`
                          : "Email reminders off"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Desktop Global Reminder Bar */}
          {enrichedPlans.length > 0 && (
            <section className="hidden lg:flex items-center justify-between gap-4 rounded-[16px] bg-rp-surface px-5 py-3.5 border border-rp-border shadow-rp-flat">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-rp-bg text-rp-primary">
                  <Bell className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-rp-text">
                    Email reminders across saved plans
                  </p>
                  <p className="text-[11px] text-rp-text-muted">
                    Sent to {account.email || "your student email"} at standard
                    countdown checkpoints
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {["H-30", "H-14", "H-7"].map((code) => (
                    <span
                      key={code}
                      className={`rounded-full px-3 py-1.5 text-[10.5px] font-bold ${
                        anyRemindersOn
                          ? "bg-rp-primary text-white"
                          : "bg-rp-bg text-rp-text-muted"
                      }`}
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <ToggleSwitch
                  checked={anyRemindersOn}
                  onChange={handleToggleAllReminders}
                  ariaLabel="Toggle reminders for all saved plans"
                />
              </div>
            </section>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
