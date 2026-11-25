"use client";

import React from "react";
import Link from "next/link";
import { Bell, ChevronRight, Flag } from "lucide-react";
import { TabHeader } from "@/components/layout/headers";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility } from "@/lib/engine";
import {
  formatLongDate,
  formatMediumDate,
  getDaysLeft,
} from "@/lib/utils/date-format";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function MyPlansPage() {
  const { account, profile, savedPlans, isHydrated } = useReadyPath();
  const today = new Date();
  const initials = getInitials(account.fullName);

  const enrichedPlans = savedPlans
    .map((plan) => {
      const opp = getOpportunityById(plan.opportunityId);
      if (!opp) return null;
      const report = evaluateEligibility(profile, opp, today);
      const daysLeft = getDaysLeft(opp.deadline, today);
      return { plan, opp, report, daysLeft };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      <TabHeader
        title="My Plans"
        subtitle={`${enrichedPlans.length} saved target${enrichedPlans.length === 1 ? "" : "s"} · ${formatLongDate(today)}`}
        rightSlot={
          <div
            aria-label={account.fullName}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[12px] font-semibold text-white"
          >
            {initials}
          </div>
        }
      />

      <main className="flex-1 px-4 pt-4 pb-6 space-y-5">
        {/* Profile Summary Card (with flex-1 min-w-0 fix per design.md Open Issue #1) */}
        <section className="rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-rp-text truncate">
              {account.fullName}
            </p>
            <p className="mt-0.5 text-[11px] text-rp-text-muted truncate">
              Semester {profile.currentSemester} · GPA{" "}
              {profile.cumulativeGpa.toFixed(2)} · {profile.certificates.length}{" "}
              {profile.certificates.length === 1 ? "certificate" : "certificates"}
            </p>
          </div>

          <Link
            href="/profile"
            className="shrink-0 inline-flex h-[32px] items-center gap-1 rounded-[8px] bg-rp-surface border border-rp-border px-2.5 text-[12px] font-semibold text-rp-text hover:bg-rp-tag/40 transition"
          >
            <span>Edit Profile</span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Saved Targets List */}
        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-rp-text">
            Saved targets
          </h2>

          {!isHydrated ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-36 rounded-[12px] bg-rp-surface/70 border border-rp-border/50 animate-pulse"
                />
              ))}
            </div>
          ) : enrichedPlans.length === 0 ? (
            <div className="rounded-[12px] bg-rp-surface p-6 text-center border border-rp-border/70">
              <Flag className="mx-auto h-8 w-8 text-rp-text-muted mb-2" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-rp-text">
                No saved targets yet
              </p>
              <p className="mt-1 text-[12px] text-rp-text-muted">
                Pick an opportunity from Explore and create a backward countdown plan.
              </p>
              <Link
                href="/explore"
                className="mt-3 inline-flex h-10 items-center justify-center rounded-[8px] bg-rp-primary px-4 text-[12px] font-semibold text-white"
              >
                Explore Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrichedPlans.map(({ plan, opp, report, daysLeft }) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}/countdown`}
                  className="block rounded-[12px] bg-rp-surface p-3.5 border border-rp-border/70 shadow-rp-flat hover:border-rp-primary/50 transition"
                >
                  {/* Top row: Category tag + Days left */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-rp-tag px-2.5 py-0.5 text-[11px] font-medium text-rp-text">
                      {opp.category}
                    </span>
                    <span className="text-[12px] font-semibold text-rp-danger">
                      {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
                    </span>
                  </div>

                  {/* Title & Deadline */}
                  <h3 className="text-[15px] font-semibold text-rp-text leading-snug">
                    {opp.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-rp-text-muted">
                    Deadline {formatMediumDate(opp.deadline)}
                  </p>

                  {/* Readiness Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium text-rp-text">Readiness</span>
                      <span className="font-semibold text-rp-primary">
                        {report.readinessPercent}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={report.readinessPercent}
                      aria-valuetext={`${report.metCount} of ${report.totalCount} requirements met`}
                      className="h-2 w-full overflow-hidden rounded-full bg-rp-tag"
                    >
                      <div
                        className="h-full rounded-full bg-rp-primary transition-all"
                        style={{ width: `${report.readinessPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-rp-text-muted">
                      {report.isEligible
                        ? "All requirements met"
                        : `${report.metCount} of ${report.totalCount} requirements met`}
                    </p>
                  </div>

                  {/* Divider + Reminder summary */}
                  <div className="mt-3 pt-2.5 border-t border-rp-border/60 flex items-center gap-1.5 text-[11px] text-rp-text-muted">
                    <Bell className="h-3.5 w-3.5 shrink-0 text-rp-primary" strokeWidth={1.8} />
                    <span>
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
      </main>

      <BottomNav />
    </div>
  );
}
