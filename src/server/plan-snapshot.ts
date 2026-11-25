import {
  evaluateEligibility,
  generateCountdownPlan,
  type CountdownMilestone,
  type CountdownPlanResult,
  type EngineOpportunityTarget,
  type EngineStudentProfile,
  type GapReport,
} from "@/lib/engine";
import { toWib } from "./time";

export interface PlanSnapshot {
  gapReport: GapReport;
  countdown: CountdownPlanResult;
  isFullyEligible: boolean;
  /** Fits Decimal(3,2); null when the GPA is already met or not applicable. */
  requiredNextTermGpa: number | null;
  milestones: CountdownMilestone[];
}

function clampGpa(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.round(Math.min(9.99, Math.max(0, value)) * 100) / 100;
}

/**
 * Pure, deterministic snapshot of a student's standing for one opportunity.
 * The countdown engine is given the WIB calendar date as its reference so "days left"
 * matches what Indonesian students see on the deadline.
 */
export function buildPlanSnapshot(input: {
  profile: EngineStudentProfile;
  target: EngineOpportunityTarget;
  now?: Date;
}): PlanSnapshot {
  const now = input.now ?? new Date();
  const countdown = generateCountdownPlan({
    profile: input.profile,
    target: input.target,
    referenceDate: toWib(now),
  });

  // generateCountdownPlan does not return the gap report, so evaluate it with the same
  // reference date (pure and cheap) to expose it to the API consistently.
  const gapReport = evaluateEligibility(input.profile, input.target, toWib(now));

  return {
    gapReport,
    countdown,
    isFullyEligible: countdown.isFullyEligible,
    requiredNextTermGpa: clampGpa(countdown.gpaPlan?.requiredTermGpa ?? null),
    milestones: countdown.milestones,
  };
}
