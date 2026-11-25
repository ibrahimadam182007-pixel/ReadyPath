import type { EngineStudentProfile } from "@/lib/engine";
import { db } from "./db";
import { buildPlanSnapshot, type PlanSnapshot } from "./plan-snapshot";
import { offsetsToCodes } from "./reminders";
import { num, toEngineProfile, toEngineTarget } from "./serializers";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const PROFILE_INCLUDE = { certificates: true, experiences: true } as const;
export const OPPORTUNITY_INCLUDE = { rule: true } as const;

export async function loadEngineProfile(userId: string): Promise<EngineStudentProfile | null> {
  const row = await db.studentProfile.findUnique({
    where: { userId },
    include: PROFILE_INCLUDE,
  });
  return row ? toEngineProfile(row) : null;
}

/** Prisma operations (for $transaction) that replace a plan's milestones and cached summary. */
export function planWriteOps(planId: string, snapshot: PlanSnapshot) {
  return [
    db.planMilestone.deleteMany({ where: { planId } }),
    db.planMilestone.createMany({
      data: snapshot.milestones.map((m) => ({
        planId,
        title: m.title,
        description: m.description,
        type: m.type,
        targetDate: m.targetDate,
        daysBeforeDeadline: m.daysBeforeDeadline,
      })),
    }),
    db.targetPlan.update({
      where: { id: planId },
      data: {
        isFullyEligible: snapshot.isFullyEligible,
        requiredNextTermGpa: snapshot.requiredNextTermGpa,
      },
    }),
  ];
}

/** Recompute every ACTIVE plan of a user (called after the profile changes). */
export async function refreshPlansForUser(userId: string, now = new Date()): Promise<number> {
  const profile = await loadEngineProfile(userId);
  if (!profile) return 0;
  const plans = await db.targetPlan.findMany({
    where: { userId, status: "ACTIVE" },
    include: { opportunity: { include: OPPORTUNITY_INCLUDE } },
  });
  let refreshed = 0;
  for (const plan of plans) {
    if (!plan.opportunity?.rule) continue;
    const snapshot = buildPlanSnapshot({ profile, target: toEngineTarget(plan.opportunity), now });
    await db.$transaction(planWriteOps(plan.id, snapshot));
    refreshed += 1;
  }
  return refreshed;
}

/** Public JSON of a plan. `snapshot` is optional (null when the user has no profile yet). */
export function serializePlan(plan: any, snapshot: PlanSnapshot | null) {
  const opp = plan.opportunity;
  const milestones = [...(plan.milestones ?? [])].sort(
    (a: any, b: any) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
  return {
    opportunityId: plan.opportunityId,
    title: opp?.title ?? null,
    category: opp?.category ?? null,
    deadline: opp?.deadline ?? null,
    status: plan.status,
    remindersEnabled: plan.remindersEnabled,
    reminderOffsets: offsetsToCodes(plan.reminderOffsets ?? []),
    reminderEmail: plan.reminderEmail,
    savedAt: plan.createdAt,
    isFullyEligible: snapshot ? snapshot.isFullyEligible : plan.isFullyEligible,
    readinessPercent: snapshot ? snapshot.gapReport.readinessPercent : null,
    metCount: snapshot ? snapshot.gapReport.metCount : null,
    totalCount: snapshot ? snapshot.gapReport.totalCount : null,
    requiredNextTermGpa: snapshot ? snapshot.requiredNextTermGpa : num(plan.requiredNextTermGpa),
    milestones: milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      targetDate: m.targetDate,
      daysBeforeDeadline: m.daysBeforeDeadline,
      isCompleted: m.isCompleted,
    })),
  };
}
