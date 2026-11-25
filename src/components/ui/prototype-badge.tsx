import React from "react";
import { cn } from "@/lib/utils";

interface PrototypeBadgeProps {
  onDark?: boolean;
  label?: string;
  className?: string;
}

export function PrototypeBadge({
  onDark = false,
  label = "Prototype Data",
  className,
}: PrototypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.01em] whitespace-nowrap",
        onDark
          ? "border border-white/25 bg-white/10 text-rp-primary-on-muted"
          : "bg-rp-tag-bg text-rp-tag",
        className
      )}
    >
      {label}
    </span>
  );
}
