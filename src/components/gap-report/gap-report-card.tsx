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
      className="rounded-[16px] bg-rp-surface p-4 lg:p-[22px] border border-rp-border shadow-rp-flat"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[14px] lg:text-[15px] font-extrabold text-rp-text">
          Requirement Gap Report
        </h2>
        <span className="inline-flex items-center rounded-full bg-rp-bg px-2.5 py-0.5 text-[11px] font-extrabold text-rp-primary">
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
        className="grid gap-1.5 mb-5"
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

      <div className="space-y-4">
        {/* Unmet Requirements first (Gap-first clarity) */}
        {unmetItems.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-rp-danger mb-2">
              Unmet Requirements ({unmetItems.length})
            </p>
            <div className="space-y-2">
              {unmetItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-[12px] border border-rp-danger-border bg-rp-danger-bg p-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rp-danger text-white"
                  >
                    <X className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-rp-text leading-snug">
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
            <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-rp-success mb-2">
              Met Requirements ({metItems.length})
            </p>
            <div className="space-y-2">
              {metItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-[12px] border border-rp-border bg-rp-surface-met p-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rp-success text-white"
                  >
                    <Check className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-rp-text leading-snug">
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
      </div>
    </section>
  );
}
