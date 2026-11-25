import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  onDark?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BrandLogo({
  onDark = false,
  size = "md",
  className,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-[8px] bg-rp-sage font-extrabold text-rp-primary shrink-0",
          size === "sm" ? "h-6 w-6 text-[12px]" : "h-7 w-7 text-[15px]"
        )}
      >
        R
      </span>
      <span
        className={cn(
          "font-extrabold tracking-tight",
          size === "sm" ? "text-[14.5px]" : "text-[16px]",
          onDark ? "text-rp-primary-on" : "text-rp-text"
        )}
      >
        ReadyPath
      </span>
    </span>
  );
}
