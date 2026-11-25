"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Check,
  Compass,
  Search,
} from "lucide-react";
import { TabHeader } from "@/components/layout/headers";
import { DesktopNavbar } from "@/components/layout/desktop-navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { useReadyPath } from "@/components/providers/readypath-store";
import {
  PROTOTYPE_OPPORTUNITIES,
  type UiOpportunityCategory,
} from "@/lib/data/prototype-opportunities";
import { evaluateEligibility } from "@/lib/engine";
import {
  formatLongDate,
  formatMediumDate,
  getDaysLeft,
} from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<"All" | UiOpportunityCategory> = [
  "All",
  "Scholarship",
  "Competition",
  "Internship",
  "Training",
];

type SortOption = "deadline" | "readiness" | "title";

export default function ExplorePage() {
  const { profile, isHydrated } = useReadyPath();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | UiOpportunityCategory
  >("All");
  const [sortBy, setSortBy] = useState<SortOption>("deadline");

  const today = useMemo(() => new Date(), []);

  const evaluatedOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = PROTOTYPE_OPPORTUNITIES.filter((opp) => {
      const matchesCat =
        selectedCategory === "All" || opp.category === selectedCategory;
      const matchesQuery =
        query.length === 0 ||
        opp.title.toLowerCase().includes(query) ||
        opp.organizer.toLowerCase().includes(query) ||
        opp.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    }).map((opp) => {
      const report = evaluateEligibility(profile, opp, today);
      const missingCount = report.totalCount - report.metCount;
      const daysLeft = getDaysLeft(opp.deadline, today);
      return { opp, report, missingCount, daysLeft };
    });

    list.sort((a, b) => {
      if (sortBy === "readiness") {
        if (b.report.readinessPercent !== a.report.readinessPercent) {
          return b.report.readinessPercent - a.report.readinessPercent;
        }
        return a.daysLeft - b.daysLeft;
      }
      if (sortBy === "title") {
        return a.opp.title.localeCompare(b.opp.title);
      }
      // Closest active deadline first, closed items after
      const aActive = a.daysLeft >= 0 ? 0 : 1;
      const bActive = b.daysLeft >= 0 ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return a.opp.deadline.getTime() - b.opp.deadline.getTime();
    });

    return list;
  }, [profile, searchQuery, selectedCategory, sortBy, today]);

  return (
    <div className="min-h-screen bg-rp-bg flex flex-col">
      <TabHeader
        title="Explore"
        subtitle="Matched to your profile"
        rightSlot={
          <Link
            href="/profile/setup"
            className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-[10.5px] font-bold text-white hover:bg-white/25 transition"
          >
            Sem {profile.currentSemester} · GPA {profile.cumulativeGpa.toFixed(2)}
          </Link>
        }
      />

      <div className="flex-1 flex flex-col w-full lg:max-w-[1200px] lg:mx-auto lg:px-6 lg:py-7 lg:gap-5">
        <DesktopNavbar variant="app" />

        {/* Desktop Page Head */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-rp-text leading-tight">
              Explore
            </h1>
            <p className="mt-1 text-[12.5px] text-rp-text-muted">
              Matched to your profile · {formatLongDate(today)} ·{" "}
              {evaluatedOpportunities.length} opportunities shown
            </p>
          </div>
        </div>

        <main className="flex-1 px-4 pt-4 pb-6 lg:px-0 lg:pt-0 lg:pb-6 space-y-4 lg:space-y-5">
          {/* Toolbar: Search + Category Chips + Sort */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3.5">
            {/* Search input */}
            <div className="relative lg:w-[380px] shrink-0">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-sage-strong"
                strokeWidth={2}
              />
              <input
                type="search"
                aria-label="Search opportunities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarships, competitions..."
                className="w-full h-[44px] rounded-[10px] bg-rp-surface border border-rp-border pl-10 pr-3.5 text-[13px] text-rp-text placeholder:text-rp-text-muted/80 focus:outline-none focus:ring-2 focus:ring-rp-primary"
              />
            </div>

            {/* Category filter chips */}
            <div
              role="tablist"
              aria-label="Filter by category"
              className="flex items-center gap-2 overflow-x-auto pb-0.5 lg:pb-0 lg:flex-1"
            >
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-2 text-[11px] transition",
                      active
                        ? "bg-rp-primary text-white font-bold"
                        : "bg-rp-surface text-rp-text border border-rp-border font-semibold hover:bg-rp-surface-met"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Sort control */}
            <div className="flex items-center justify-between lg:justify-end gap-2">
              <span className="text-[11px] font-semibold text-rp-text-muted lg:hidden">
                {evaluatedOpportunities.length} opportunities
              </span>
              <label className="relative inline-flex items-center">
                <ArrowUpDown
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-rp-sage-strong"
                  strokeWidth={2}
                />
                <select
                  aria-label="Sort opportunities"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-[38px] lg:h-[40px] appearance-none rounded-full bg-rp-surface border border-rp-border pl-8 pr-7 text-[11px] font-semibold text-rp-sage-strong focus:outline-none focus:ring-2 focus:ring-rp-primary cursor-pointer"
                >
                  <option value="deadline">Closest deadline</option>
                  <option value="readiness">Most eligible</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {/* Opportunity Cards Grid */}
          {!isHydrated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 lg:gap-[18px]">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-[196px] rounded-[16px] bg-rp-surface/75 border border-rp-border animate-pulse"
                />
              ))}
            </div>
          ) : evaluatedOpportunities.length === 0 ? (
            <div className="rounded-[16px] bg-rp-surface p-10 text-center border border-rp-border shadow-rp-flat">
              <Compass
                className="mx-auto h-9 w-9 text-rp-sage-strong mb-2.5"
                strokeWidth={1.6}
              />
              <p className="text-[15px] font-extrabold text-rp-text">
                No matching opportunities found
              </p>
              <p className="mt-1 text-[12.5px] text-rp-text-muted">
                Try clearing your search or selecting another category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 inline-flex h-[40px] items-center justify-center rounded-[10px] bg-rp-primary px-5 text-[12.5px] font-bold text-white hover:bg-rp-primary-hover transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 lg:gap-[18px]">
              {evaluatedOpportunities.map(
                ({ opp, report, missingCount, daysLeft }) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="group flex flex-col justify-between rounded-[16px] bg-rp-surface p-4 lg:p-5 border border-rp-border shadow-rp-flat hover:border-rp-primary hover:shadow-rp-card transition"
                  >
                    <div>
                      {/* Top row: Category pill + Prototype Data badge */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center rounded-full bg-rp-surface-met px-2.5 py-0.5 text-[10px] font-extrabold text-rp-success">
                          {opp.category}
                        </span>
                        {opp.isPrototype && <PrototypeBadge />}
                      </div>

                      {/* Title & Organizer */}
                      <h2 className="text-[15px] font-extrabold text-rp-text leading-snug group-hover:text-rp-primary transition">
                        {opp.title}
                      </h2>
                      <p className="mt-1 text-[11.5px] text-rp-text-muted">
                        {opp.organizer}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-rp-hairline space-y-3">
                      {/* Deadline & Days left */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-rp-text-muted">
                          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                          Deadline {formatMediumDate(opp.deadline)}
                        </span>
                        <span
                          className={cn(
                            "text-[11.5px] font-extrabold whitespace-nowrap",
                            daysLeft >= 0 ? "text-rp-danger" : "text-rp-text-muted"
                          )}
                        >
                          {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
                        </span>
                      </div>

                      {/* Deterministic Gap Status Chip */}
                      <div className="flex items-center justify-between gap-2">
                        {report.isEligible ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rp-surface-met px-3 py-1 text-[10.5px] font-extrabold text-rp-success">
                            <Check className="h-3 w-3" strokeWidth={2.6} />
                            <span>Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rp-danger-bg px-3 py-1 text-[10.5px] font-extrabold text-rp-danger">
                            <AlertCircle className="h-3 w-3" strokeWidth={2.4} />
                            <span>
                              Missing {missingCount}{" "}
                              {missingCount === 1
                                ? "Requirement"
                                : "Requirements"}
                            </span>
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-rp-sage-strong">
                          {report.readinessPercent}% ready
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
