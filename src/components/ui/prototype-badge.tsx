import React from "react";
import { cn } from "@/lib/utils";

interface PrototypeBadgeProps {
  className?: string;
  onDark?: boolean;
}

export function PrototypeBadge({ className, onDark = false }: PrototypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border border-dashed px-1.5 py-0.5 text-[10px] font-medium leading-none",
        onDark
          ? "border-white/50 text-white/85"
          : "border-rp-text-muted text-rp-text-muted",
        className
      )}
    >
      Prototype Data
    </span>
  );
}
