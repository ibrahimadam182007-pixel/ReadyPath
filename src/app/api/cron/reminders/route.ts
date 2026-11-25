import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { HttpError, handle } from "@/server/http";
import { composeReminderEmail, selectDueOffset } from "@/server/reminders";
import { buildPlanSnapshot } from "@/server/plan-snapshot";
import { toEngineProfile, toEngineTarget } from "@/server/serializers";
import { wibDateString } from "@/server/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new HttpError(503, "CRON_SECRET is not configured");
  const header = req.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function run(req: Request) {
  if (!authorized(req)) throw new HttpError(401, "Unauthorized");

  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const plans: any[] = await db.targetPlan.findMany({
    where: { status: "ACTIVE", remindersEnabled: true },
    include: {
      opportunity: { include: { rule: true } },
      user: { include: { studentProfile: { include: { certificates: true, experiences: true } } } },
      reminderDispatches: true,
    },
  });

  const stats = { considered: plans.length, due: 0, sent: 0, failed: 0, skipped: 0, dryRun: 0 };

  for (const plan of plans) {
    const opp = plan.opportunity;
    if (!opp?.isActive || !opp.rule) {
      stats.skipped += 1;
      continue;
    }
    const offset = selectDueOffset(plan, new Date(opp.deadline), now);
    if (offset === null) continue;
    stats.due += 1;

    const alreadySent = plan.reminderDispatches.some(
      (d: any) => d.offsetDays === offset && d.status === "SENT"
    );
    const profileRow = plan.user?.studentProfile;
    if (alreadySent || !profileRow) {
      stats.skipped += 1;
      continue;
    }

    const snapshot = buildPlanSnapshot({
      profile: toEngineProfile(profileRow),
      target: toEngineTarget(opp),
      now,
    });
    const message = composeReminderEmail({
      recipientName: plan.user.name,
      appUrl,
      opportunity: {
        id: opp.id,
        title: opp.title,
        deadline: new Date(opp.deadline),
        sourceUrl: opp.sourceUrl,
        isPrototype: opp.isPrototype,
        lastVerifiedAt: opp.lastVerifiedAt ? new Date(opp.lastVerifiedAt) : null,
      },
      offset,
      isFullyEligible: snapshot.isFullyEligible,
      unmetItems: snapshot.gapReport.items.filter((i) => i.status === "NOT_MET"),
      upcomingMilestones: snapshot.milestones,
    });

    const result = await sendEmail({ to: plan.reminderEmail, ...message });
    if (result.dryRun) {
      stats.dryRun += 1;
      continue; // nothing was sent, so do not record it (a later real run must still send it)
    }

    await db.reminderDispatch.upsert({
      where: { planId_offsetDays: { planId: plan.id, offsetDays: offset } },
      update: {
        status: result.ok ? "SENT" : "FAILED",
        provider: result.provider,
        error: result.error ?? null,
        sentAt: now,
      },
      create: {
        planId: plan.id,
        offsetDays: offset,
        status: result.ok ? "SENT" : "FAILED",
        provider: result.provider,
        error: result.error ?? null,
      },
    });
    if (result.ok) stats.sent += 1;
    else stats.failed += 1;
  }

  return NextResponse.json({ ok: true, date: wibDateString(now), ...stats });
}

// Vercel Cron calls GET with `Authorization: Bearer $CRON_SECRET`; POST is handy for manual runs.
export const GET = handle(async (req) => run(req));
export const POST = handle(async (req) => run(req));
