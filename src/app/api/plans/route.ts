import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { handle, requireUser } from "@/server/http";
import { loadEngineProfile, serializePlan } from "@/server/plan-service";
import { buildPlanSnapshot } from "@/server/plan-snapshot";
import { toEngineTarget } from "@/server/serializers";

export const dynamic = "force-dynamic";

/** All plans of the signed-in student with a fresh readiness summary. */
export const GET = handle(async () => {
  const user = await requireUser();
  const [profile, plans] = await Promise.all([
    loadEngineProfile(user.id),
    db.targetPlan.findMany({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      include: { opportunity: { include: { rule: true } }, milestones: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items = plans.map((plan: { opportunity?: { rule?: unknown } }) => {
    const snapshot =
      profile && plan.opportunity?.rule
        ? buildPlanSnapshot({ profile, target: toEngineTarget(plan.opportunity) })
        : null;
    return serializePlan(plan, snapshot);
  });
  return NextResponse.json({ plans: items });
});
