import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, handle, readJson, requireUser } from "@/server/http";
import { loadEngineProfile, planWriteOps, serializePlan } from "@/server/plan-service";
import { buildPlanSnapshot } from "@/server/plan-snapshot";
import { codesToOffsets } from "@/server/reminders";
import { toEngineTarget } from "@/server/serializers";

export const dynamic = "force-dynamic";

const PlanInputSchema = z.object({
  remindersEnabled: z.boolean().default(true),
  reminderOffsets: z.array(z.string().max(8)).max(10).default(["H-30", "H-14", "H-7"]),
});

type Ctx = { params: { opportunityId: string } };

/** Create or update the student's plan for one opportunity (idempotent). */
export const PUT = handle(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const input = await readJson(req, PlanInputSchema);

  const profile = await loadEngineProfile(user.id);
  if (!profile) throw new HttpError(409, "Save your student profile before creating a plan.");

  const opp = await db.opportunity.findFirst({
    where: { id: params.opportunityId, isActive: true },
    include: { rule: true },
  });
  if (!opp) throw new HttpError(404, "Opportunity not found");

  // An empty list means "no reminders"; a non-empty list must contain at least one supported code.
  const parsedOffsets = codesToOffsets(input.reminderOffsets);
  if (input.reminderOffsets.length > 0 && parsedOffsets.length === 0) {
    throw new HttpError(422, "Unsupported reminder offsets. Use H-30, H-14 and/or H-7.");
  }
  const reminderOffsets = parsedOffsets;
  const snapshot = buildPlanSnapshot({ profile, target: toEngineTarget(opp) });

  const plan = await db.targetPlan.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
    update: {
      status: "ACTIVE",
      remindersEnabled: input.remindersEnabled,
      reminderOffsets,
      reminderEmail: user.email,
    },
    create: {
      userId: user.id,
      opportunityId: opp.id,
      remindersEnabled: input.remindersEnabled,
      reminderOffsets,
      reminderEmail: user.email,
    },
  });

  await db.$transaction(planWriteOps(plan.id, snapshot));

  const saved = await db.targetPlan.findUnique({
    where: { id: plan.id },
    include: { opportunity: true, milestones: true },
  });
  return NextResponse.json({ plan: serializePlan(saved, snapshot) });
});

export const DELETE = handle(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  await db.targetPlan.deleteMany({
    where: { userId: user.id, opportunityId: params.opportunityId },
  });
  return new NextResponse(null, { status: 204 });
});
