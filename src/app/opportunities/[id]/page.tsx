"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/prototype-badge";
import { GapReportCard } from "@/components/gap-report/gap-report-card";
import { useReadyPath } from "@/components/providers/readypath-store";
import { getOpportunityById } from "@/lib/data/prototype-opportunities";
import { evaluateEligibility } from "@/lib/engine";
import { formatLongDate, formatMonthYear } from "@/lib/utils/date-format";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile, getSavedPlan } = useReadyPath();
  const opportunity = getOpportunityById(params.id);

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

  const gapReport = evaluateEligibility(profile, opportunity);
  const existingPlan = getSavedPlan(opportunity.id);
  const hostname = new URL(opportunity.sourceUrl).hostname.replace(/^www\./, "");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-rp-bg">
      {/* Dark Forest Green Header */}
      <header className="bg-rp-primary text-rp-primary-on px-4 pt-4 pb-6 rounded-b-[24px]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link
            href="/explore"
            aria-label="Back to Explore"
            className="inline-flex h-11 w-11 -ml-2 items-center justify-center rounded-full text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          {opportunity.isPrototype && <PrototypeBadge onDark />}
        </div>

        <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white mb-2">
          {opportunity.category}
        </span>

        <h1 className="text-[20px] font-semibold leading-snug text-white">
          {opportunity.title}
        </h1>
        <p className="mt-1 text-[12px] text-rp-primary-on-muted">
          {opportunity.organizer}
        </p>

        {/* Info pills on dark */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Last verified: {formatMonthYear(opportunity.lastVerifiedAt)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Deadline {formatLongDate(opportunity.deadline)}</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-6 space-y-4">
        {/* Program Summary Card */}
        <section className="rounded-[12px] bg-rp-surface p-3.5 border border-rp-border/70 shadow-rp-flat space-y-2.5">
          <h2 className="text-[15px] font-semibold text-rp-text">
            Program summary
          </h2>
          <p className="text-[13px] leading-relaxed text-rp-text-muted">
            {opportunity.summary}
          </p>

          {opportunity.highlights.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {opportunity.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[12px] text-rp-text"
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-rp-success mt-0.5"
                    strokeWidth={2}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 border-t border-rp-border/50">
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-rp-primary underline underline-offset-2"
            >
              <span>Official source: {hostname}</span>
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
            </a>
          </div>
        </section>

        {/* Requirement Gap Report */}
        <GapReportCard report={gapReport} />
      </main>

      {/* Pinned CTA */}
      <footer className="sticky bottom-0 z-10 px-4 pt-2 pb-4 bg-rp-bg">
        <Link
          href={`/opportunities/${opportunity.id}/countdown`}
          className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-rp-primary px-4 text-[14px] font-semibold text-rp-primary-on hover:bg-[#123129] active:brightness-90 transition"
        >
          <Calendar className="h-4 w-4" strokeWidth={2} />
          <span>
            {existingPlan ? "View Countdown Plan" : "Create Countdown Plan"}
          </span>
        </Link>
      </footer>
    </div>
  );
}
