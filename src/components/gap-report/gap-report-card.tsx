import React from "react";
import { Check, X } from "lucide-react";
import type { GapReport } from "@/lib/engine";
import { cn } from "@/lib/utils";

interface GapReportCardProps {
  report: GapReport;
}

export function GapReportCard({ report }: GapReportCardProps) {
  const metItems = report.items.filter((i) => i.status === "MET");
  const unmetItems = report.items.filter((i) => i.status === "NOT_MET");

  return (
    <section
      aria-label="Requirement Gap Report"
      className="rounded-[12px] bg-rp-surface p-3.5 border border-rp-border/70 shadow-rp-flat"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h2 className="text-[15px] font-semibold text-rp-text">
          Requirement Gap Report
        </h2>
        <span className="text-[12px] font-semibold text-rp-text-muted">
          {report.metCount} of {report.totalCount} met
        </span>
      </div>

      {/* Segmented Progress Bar (Accessible) */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={report.totalCount}
        aria-valuenow={report.metCount}
        aria-valuetext={`${report.metCount} of ${report.totalCount} requirements met`}
        className="grid gap-1.5 mb-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, report.totalCount)}, minmax(0, 1fr))`,
        }}
      >
        {report.items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={cn(
              "h-2 rounded-full",
              item.status === "MET" ? "bg-rp-primary" : "bg-rp-danger"
            )}
          />
        ))}
      </div>

      {/* Unmet Requirements first (Gap-first principle) */}
      {unmetItems.length > 0 && (
        <div className="mb-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-rp-danger mb-2">
            Unmet Requirements
          </p>
          <div className="space-y-2">
            {unmetItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-[8px] border border-rp-danger-border bg-rp-danger-bg p-2.5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rp-danger text-white"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-rp-text leading-snug">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-rp-text-muted leading-snug">
                    {item.gapDetail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Met Requirements */}
      {metItems.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-rp-text-muted mb-2">
            Met Requirements
          </p>
          <div className="space-y-2">
            {metItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-[8px] border border-rp-primary/30 bg-rp-surface-met p-2.5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rp-success text-white"
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-rp-text leading-snug">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-rp-text-muted leading-snug">
                    {item.gapDetail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
