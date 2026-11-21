"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Calendar, Check, Compass, Search } from "lucide-react";
import { TabHeader } from "@/components/layout/headers";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { useReadyPath } from "@/components/providers/readypath-store";
import {
  PROTOTYPE_OPPORTUNITIES,
  type UiOpportunityCategory,
} from "@/lib/data/prototype-opportunities";
import { evaluateEligibility } from "@/lib/engine";
import { formatMediumDate, getDaysLeft } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<"All" | UiOpportunityCategory> = [
  "All",
  "Scholarship",
  "Competition",
  "Internship",
  "Training",
];

export default function ExplorePage() {
  const { profile, isHydrated } = useReadyPath();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | UiOpportunityCategory
  >("All");

  const evaluatedOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PROTOTYPE_OPPORTUNITIES.filter((opp) => {
      const matchesCat =
        selectedCategory === "All" || opp.category === selectedCategory;
      const matchesQuery =
        query.length === 0 ||
        opp.title.toLowerCase().includes(query) ||
        opp.organizer.toLowerCase().includes(query) ||
        opp.category.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    }).map((opp) => {
      const report = evaluateEligibility(profile, opp);
      const missingCount = report.totalCount - report.metCount;
      const daysLeft = getDaysLeft(opp.deadline);
      return { opp, report, missingCount, daysLeft };
    });
  }, [profile, searchQuery, selectedCategory]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      <TabHeader
        title="Explore"
        subtitle="Matched to your profile"
        rightSlot={
          <Link
            href="/profile"
            className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/25 transition"
          >
            Sem {profile.currentSemester} · GPA {profile.cumulativeGpa.toFixed(2)}
          </Link>
        }
      />

      <main className="flex-1 px-4 pt-4 pb-6 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rp-text-muted"
            strokeWidth={1.8}
          />
          <input
            type="search"
            aria-label="Search opportunities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, competitions…"
            className="w-full h-[38px] rounded-[8px] bg-rp-surface border border-rp-border pl-9 pr-3 text-[13px] text-rp-text placeholder:text-rp-text-muted focus:outline-none focus:ring-2 focus:ring-rp-primary"
          />
        </div>

        {/* Horizontally Scrollable Filter Chips */}
        <div
          role="tablist"
          aria-label="Opportunity categories"
          className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar"
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
                  active
                    ? "bg-rp-primary text-white"
                    : "bg-rp-surface border border-rp-border text-rp-text hover:bg-rp-surface-met/50"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Opportunity Cards List */}
        {!isHydrated ? (
          <div className="space-y-3" aria-label="Loading opportunities">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 rounded-[12px] bg-rp-surface/70 border border-rp-border/50 animate-pulse"
              />
            ))}
          </div>
        ) : evaluatedOpportunities.length === 0 ? (
          <div className="rounded-[12px] bg-rp-surface p-6 text-center border border-rp-border/70">
            <Compass className="mx-auto h-8 w-8 text-rp-text-muted mb-2" strokeWidth={1.5} />
            <p className="text-[14px] font-semibold text-rp-text">
              No matching opportunities
            </p>
            <p className="mt-1 text-[12px] text-rp-text-muted">
              Try clearing your search or switching category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-[8px] bg-rp-primary px-4 text-[12px] font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluatedOpportunities.map(({ opp, report, missingCount, daysLeft }) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block rounded-[12px] bg-rp-surface p-3 border border-rp-border/70 shadow-rp-flat hover:border-rp-primary/50 transition"
              >
                {/* Top row: Category tag + Prototype badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-rp-tag px-2.5 py-0.5 text-[11px] font-medium text-rp-text">
                    {opp.category}
                  </span>
                  {opp.isPrototype && <PrototypeBadge />}
                </div>

                {/* Title & Organizer */}
                <h2 className="text-[15px] font-semibold text-rp-text leading-snug">
                  {opp.title}
                </h2>
                <p className="mt-0.5 text-[12px] text-rp-text-muted">
                  {opp.organizer}
                </p>

                {/* Deadline + Days Left */}
                <div className="mt-2.5 flex items-center justify-between gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1.5 text-rp-text-muted">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
                    <span>Deadline {formatMediumDate(opp.deadline)}</span>
                  </span>
                  <span className="font-semibold text-rp-danger shrink-0">
                    {daysLeft >= 0 ? `${daysLeft} days left` : "Closed"}
                  </span>
                </div>

                {/* Gap Status Chip */}
                <div className="mt-2.5 pt-2.5 border-t border-rp-border/50">
                  {report.isEligible ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rp-surface-met px-2.5 py-1 text-[11px] font-semibold text-rp-text">
                      <Check className="h-3.5 w-3.5 text-rp-success" strokeWidth={2.5} />
                      <span>Eligible</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rp-danger-bg border border-rp-danger-border px-2.5 py-1 text-[11px] font-semibold text-rp-text">
                      <AlertCircle className="h-3.5 w-3.5 text-rp-danger" strokeWidth={2} />
                      <span>
                        Missing {missingCount}{" "}
                        {missingCount === 1 ? "Requirement" : "Requirements"}
                      </span>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
