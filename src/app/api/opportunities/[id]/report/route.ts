import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { HttpError, handle, requireUser } from "@/server/http";
import { loadEngineProfile } from "@/server/plan-service";
import { buildPlanSnapshot } from "@/server/plan-snapshot";
import { toEngineTarget } from "@/server/serializers";

export const dynamic = "force-dynamic";

/** Server-side Gap Report + Countdown Plan for the signed-in student (deterministic, no AI). */
export const GET = handle(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const profile = await loadEngineProfile(user.id);
  if (!profile) throw new HttpError(409, "Complete your student profile first.");

  const opp = await db.opportunity.findFirst({
    where: { isActive: true, OR: [{ id: params.id }, { slug: params.id }] },
    include: { rule: true },
  });
  if (!opp) throw new HttpError(404, "Opportunity not found");

  const snapshot = buildPlanSnapshot({ profile, target: toEngineTarget(opp) });
  return NextResponse.json({
    opportunityId: opp.id,
    lastVerifiedAt: opp.lastVerifiedAt ?? null,
    isPrototype: opp.isPrototype,
    gapReport: snapshot.gapReport,
    countdown: snapshot.countdown,
  });
});
